/**
 * 每日体检 (2026-10-15). The user asked that what can fail unseen be checked and reported to him, and
 * only when something is wrong. Once a day, with the database check (api/ask-lizheng-db-watch.ts,
 * 04:00 UTC, after Ops' backup of the day, which starts at 00:00 UTC), this reads counts and times
 * only, never a question or an answer:
 *
 * - yesterday's questions (Beijing day) and how many were answered, and how many never finished;
 * - the public feed: when Ops' curation last finished, why it stopped, how far behind the newest
 *   question its cursor is (ask-lizheng-ops writes discovery:curate-health after each run);
 * - the public files' heartbeat, which Ops writes every minute;
 * - the last daily backup (Ops writes backup-health; this site cannot read the backup store);
 * - how much the archive holds against the database's plan: the last backup's size (raw_bytes, close
 *   to what the database holds) against the plan the database check last read (INFO maxmemory), from
 *   seven tenths; Upstash upgrades a full database on its own, so this says it is coming, at most
 *   weekly. (Until 2026-10-15 it warned of the public feed's 5000 items, a ceiling since removed: the
 *   owner asked to assume 1,000,000 public answers.)
 * - whether the answer service answers /api/meta with its model and semantic index ready.
 *
 * Builder's own account (spend against its ceiling, the free hosting's end) needs Builder's token,
 * which this site never holds: ask-lizheng's health workflow checks those and GitHub mails a failure.
 */
import { redis } from "./ask-access.js";
import { DB_WATCH_KEY, planSize, sendMail, type Mail } from "./ask-db-watch.js";
import { fileReader, PUBLIC_FILES, type FileReader } from "./ask-public-files.js";

const OPS = "ask-ops:{v3}:";
export const HEALTH_KEY = "ask:watch:v1:health";
/** The share of the plan the archive may fill before the check says so. */
export const SPACE_WARNING = 0.7;
const BUILDER_META = "https://ask-lizheng.ai-builders.space/api/meta";
const HOUR = 3_600_000;

export type Problem = { key: string; title: string; detail: string };
type Send = (command: (string | number)[]) => Promise<unknown>;
type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export function beijingDay(at: number) {
  return new Date(at + 8 * HOUR).toISOString().slice(0, 10);
}
function counts(reply: unknown): Record<string, number> {
  const values: Record<string, number> = {};
  if (Array.isArray(reply)) for (let i = 0; i + 1 < reply.length; i += 2) values[String(reply[i])] = Number(reply[i + 1]) || 0;
  return values;
}
function record(reply: unknown): Record<string, unknown> | null {
  try {
    const value = typeof reply === "string" ? JSON.parse(reply) : null;
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
const hours = (ms: number) => Math.max(1, Math.round(ms / HOUR));
const STOPS: Record<string, string> = {
  unreadable_record: "有一条提问记录后台读不懂（多半是回答服务给存档加了后台还不认识的字段）",
  store_unavailable: "读数据库出错",
  ops_store_unavailable: "写数据库出错",
};

export async function checkHealth({ send = redis as Send, read = fileReader(), fetcher = fetch as Fetcher, now = Date.now() }:
  { send?: Send; read?: FileReader | null; fetcher?: Fetcher; now?: number } = {}): Promise<Problem[]> {
  const problems: Problem[] = [];

  const day = beijingDay(now - 24 * HOUR);
  const yesterday = counts(await send(["HGETALL", OPS + "day:" + day]));
  const asked = yesterday.questions || 0, answered = yesterday.answered || 0, unfinished = yesterday.generating || 0;
  if (asked >= 5 && answered < asked / 2)
    problems.push({ key: "answers", title: `昨天（北京时间${day}）${asked}个提问只答完${answered}个`,
      detail: "大多数提问没有拿到完整回答，多半是回答服务或模型出了问题。在后台看这些记录的状态和出错代码，或看 Vercel 日志里 /api/ask 的状态码。" });
  if (unfinished > 2)
    problems.push({ key: "unfinished", title: `昨天有${unfinished}个提问开始了却没有结果`,
      detail: "回答服务在答到一半时停了（重启、崩溃或存档失败），这些记录一直停在「生成中」。" });

  const curate = record(await send(["GET", OPS + "discovery:curate-health"]));
  const newest = await send(["ZREVRANGE", OPS + "records", 0, 0, "WITHSCORES"]);
  const newestAt = Array.isArray(newest) && newest.length === 2 ? Number(newest[1]) : 0;
  if (!curate || typeof curate.at !== "number")
    problems.push({ key: "feed_unknown", title: "「别人在问什么」的自动整理没有留下运行记录",
      detail: "后台每15分钟整理一轮，每轮结束会记一笔；没有这笔记录，说明整理一直没跑完。看 ask-lizheng-ops 的 Vercel 日志里 /api/curate。" });
  else {
    if (now - curate.at > 2 * HOUR)
      problems.push({ key: "feed_idle", title: `「别人在问什么」的自动整理已经${hours(now - curate.at)}小时没跑完`,
        detail: "新的提问不会再出现在列表里。看 ask-lizheng-ops 的 Vercel 日志里 /api/curate 的状态码。" });
    if (typeof curate.stopped === "string" && STOPS[curate.stopped])
      problems.push({ key: "feed_stopped", title: "「别人在问什么」的自动整理停住了：" + STOPS[curate.stopped],
        detail: "整理停在这一条上不往前走，修好后会从这里接着整理，漏不掉。" });
    const cursor = Number(curate.cursor_at) || 0;
    if (newestAt && newestAt < now - HOUR && newestAt - cursor > 3 * HOUR)
      problems.push({ key: "feed_behind", title: `「别人在问什么」落后最新提问${hours(newestAt - cursor)}小时`,
        detail: "整理一直在跑，却没有往前处理新的提问。" + (curate.stopped ? `最近一轮停下的原因：${curate.stopped}。` : "") });
  }

  if (read) {
    let checked = NaN;
    try {
      const state = record(await read(PUBLIC_FILES.state));
      checked = Date.parse(String(state?.checked_at));
    } catch { /* counted below as not updated */ }
    if (!Number.isFinite(checked) || now - checked > 15 * 60_000)
      problems.push({ key: "files", title: Number.isFinite(checked) ? `公开问答的文件已经${Math.round((now - checked) / 60_000)}分钟没更新` : "读不到公开问答的文件",
        detail: "后台每分钟把「别人在问什么」和公开问答页写成文件；文件旧了，主站会改去问后台，页面照常，但后台和数据库都出事时就没有备用了。看 ask-lizheng-ops 的 /api/public-files。" });
  }

  const backup = record(await send(["GET", OPS + "backup-health"]));
  if (!backup || typeof backup.at !== "number" || now - backup.at > 30 * HOUR)
    problems.push({ key: "backup", title: backup && typeof backup.at === "number" ? `最近一份每日备份是${hours(now - backup.at)}小时前` : "没有找到每日备份的记录",
      detail: "后台每天从 UTC 0 点起分段把问答存档备份一份、留30天。看 ask-lizheng-ops 的 Vercel 日志里 /api/backup。" });

  const held = Number(backup?.raw_bytes) || 0, plan = Number(await send(["HGET", DB_WATCH_KEY, "plan_bytes"])) || 0;
  if (held > 0 && plan > 0 && held >= plan * SPACE_WARNING)
    problems.push({ key: "space", title: `问答存档约${planSize(held)}，数据库套餐上限${planSize(plan)}`,
      detail: "存满时 Upstash 会自动换成更大的套餐，网站不停，但每月费用会变高（换了会另发一封信）。不想升级，可以在后台删掉不需要的存档。" });

  let ready = false;
  for (let attempt = 0; attempt < 2 && !ready; attempt++) {
    try {
      // Two tries of 30 seconds: the first may only wake it (vercel.json gives this function 90 seconds).
      const response = await fetcher(BUILDER_META, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
      const meta = response.ok ? await response.json() : null;
      ready = meta?.model_ready === true && meta?.semantic_ready === true;
    } catch { ready = false; }
  }
  if (!ready)
    problems.push({ key: "builder", title: "回答服务没有正常回应",
      detail: "检查时连不上回答服务，或它报告模型、语义索引没就绪；这时没人能提问。看 Builder Space 上 ask-lizheng 的状态和日志。" });

  return problems;
}

export function healthMail(problems: Problem[], day: string): Mail {
  return {
    key: `ask-health:${day}:${problems.map(problem => problem.key).join(",")}`,
    subject: `问问立正每日体检：${problems.length}件事要看一下`,
    text: problems.map((problem, i) => `${i + 1}. ${problem.title}\n${problem.detail}`).join("\n\n") +
      "\n\n每天检查一次，有问题才发这封信；修好后第二天就不再提。",
  };
}

/** Mails the owner the day's problems, if any. The space warning comes at most once a week. */
export async function watchHealth({ send = redis as Send, read = fileReader(), fetcher = fetch as Fetcher, mail = sendMail, now = Date.now() }:
  { send?: Send; read?: FileReader | null; fetcher?: Fetcher; mail?: (mail: Mail) => Promise<void>; now?: number } = {}): Promise<{ problems: string[]; mailed: boolean }> {
  let problems = await checkHealth({ send, read, fetcher, now });
  const lastSpace = Number(await send(["HGET", HEALTH_KEY, "space_mailed_at"])) || 0;
  if (now - lastSpace < 7 * 24 * HOUR) problems = problems.filter(problem => problem.key !== "space");
  await send(["HSET", HEALTH_KEY, "checked_at", new Date(now).toISOString(), "problems", problems.map(problem => problem.key).join(",")]);
  if (!problems.length) return { problems: [], mailed: false };
  await mail(healthMail(problems, beijingDay(now)));
  if (problems.some(problem => problem.key === "space")) await send(["HSET", HEALTH_KEY, "space_mailed_at", now]);
  return { problems: problems.map(problem => problem.key), mailed: true };
}
