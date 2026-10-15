/**
 * 反馈问题 (2026-10-15, the user: everyone needs a quick way to report a bug, above all while an
 * answer is slow). The Ask page, the App and the homepage section send one fixed shape (ask-lizheng
 * src/report.js, copied here as shared/ask-report-client.js): what the person wrote, and what the
 * page saw — the question unless the report is about the page itself, how long it waited, the
 * stage, the error. This checks it and mails it to the owner through the Resend key the email
 * sign-in already uses. Nothing is stored but two counts that expire in two days: each network may
 * send REPORT_NETWORK_DAILY_LIMIT a day, and all together REPORT_DAILY_LIMIT, so reports never use
 * up Resend's daily allowance, which sign-in codes share. No account, no address; the browser's
 * user agent comes along, for the device. A situation (结合我的处境) is never part of a report.
 */
import { AccessError, authDigest, clientNetwork, redis } from "./ask-access.js";
import { sendMail, type Mail } from "./ask-db-watch.js";

export const REPORT_BODY_LIMIT = 4096;
export const REPORT_TEXT_MAX = 800;
export const REPORT_QUESTION_MAX = 300;
export const REPORT_NETWORK_DAILY_LIMIT = 10;
export const REPORT_DAILY_LIMIT = 40;
export const REPORT_PREFIX = "ask:report:v1:";
// Where the person was: waiting for an answer, after one failed or stopped, reading one, or anywhere
// on the page (its footer), which has no question.
export const REPORT_PLACES = ["waiting", "failed", "answer", "page"] as const;
export const REPORT_SURFACES = ["ask", "app", "home"] as const;
// Our own checks, crawlers and link previews never mail.
const NOT_A_PERSON = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|whatsapp|telegram|skype/i;
const FIELDS = ["v", "surface", "place", "text", "question", "asked_at", "elapsed", "quiet", "stage", "error", "status", "model", "share"];
const CODE = /^[a-z][a-z_-]{0,47}$/;
const MODEL = /^[A-Za-z0-9][A-Za-z0-9._-]{0,47}$/;
const TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const SHARE = /^https:\/\/ask\.lizheng\.ai\/s\/\d{4}-\d{2}-\d{2}\/[a-z0-9]+(?:-[a-z0-9]+){0,4}$/;

export type ReportPlace = (typeof REPORT_PLACES)[number];
export type ReportSurface = (typeof REPORT_SURFACES)[number];
export type Report = {
  v: 1; surface: ReportSurface; place: ReportPlace; text: string;
  question?: string; asked_at?: string; elapsed?: number; quiet?: number;
  stage?: string; error?: string; status?: string; model?: string; share?: string;
};

// Words a person typed, as plain text: no control characters but line breaks, at most two blank lines.
const plain = (value: string) => value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, "")
  .replace(/\n{3,}/g, "\n\n").trim();

export function reportFrom(body: Buffer): Report {
  const invalid = (): never => { throw new AccessError("invalid_request", 400); };
  if (!body.byteLength || body.byteLength > REPORT_BODY_LIMIT) invalid();
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)); } catch { invalid(); }
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const r = value as Record<string, unknown>;
  if (Object.keys(r).some(key => !FIELDS.includes(key)) || r.v !== 1 ||
      !REPORT_SURFACES.includes(r.surface as ReportSurface) || !REPORT_PLACES.includes(r.place as ReportPlace) ||
      typeof r.text !== "string") invalid();
  const text = plain(r.text as string);
  if (text.length > REPORT_TEXT_MAX) invalid();
  const report: Report = { v: 1, surface: r.surface as ReportSurface, place: r.place as ReportPlace, text };
  const turn = report.place !== "page";
  // The page itself has nothing to show but what the person wrote.
  if (!turn && (!text || Object.keys(r).length > 4)) invalid();
  if (r.question !== undefined) {
    const question = typeof r.question === "string" ? plain(r.question) : "";
    if (!question || question.length > REPORT_QUESTION_MAX) invalid();
    report.question = question;
  }
  if (r.asked_at !== undefined) {
    if (typeof r.asked_at !== "string" || !TIME.test(r.asked_at) || Number.isNaN(Date.parse(r.asked_at))) invalid();
    report.asked_at = r.asked_at as string;
  }
  for (const key of ["elapsed", "quiet"] as const) {
    if (r[key] === undefined) continue;
    if (typeof r[key] !== "number" || !Number.isInteger(r[key]) || (r[key] as number) < 0 || (r[key] as number) > 3600) invalid();
    report[key] = r[key] as number;
  }
  for (const key of ["stage", "error", "status"] as const) {
    if (r[key] === undefined) continue;
    if (typeof r[key] !== "string" || !CODE.test(r[key] as string)) invalid();
    report[key] = r[key] as string;
  }
  if (r.model !== undefined) {
    if (typeof r.model !== "string" || !MODEL.test(r.model)) invalid();
    report.model = r.model as string;
  }
  if (r.share !== undefined) {
    if (typeof r.share !== "string" || !SHARE.test(r.share)) invalid();
    report.share = r.share as string;
  }
  return report;
}

const PLACES: Record<ReportPlace, string> = { waiting: "等回答时", failed: "回答没完成后", answer: "看回答时", page: "页面上（没在问问题）" };
const SURFACES: Record<ReportSurface, string> = { ask: "ask.lizheng.ai 网页", app: "App", home: "lizheng.ai 主页问答区" };
const STAGES: Record<string, string> = {
  retrieving: "找资料", matching: "匹配资料", thinking: "等回答模型", drafting: "写回答", checking: "核对出处", repairing: "修正回答",
};
const beijing = (ms: number) => new Date(ms + 8 * 3_600_000).toISOString().slice(0, 19).replace("T", " ");
const short = (text: string, length: number) => (text.length > length ? `${text.slice(0, length)}…` : text);

/** The mail to the owner: what the person wrote first, then what the page saw. */
export function reportMail(report: Report, seen: { at: number; agent: string; release?: string; id: string }): Mail {
  const firstLine = report.text.split("\n")[0];
  const subject = report.place === "waiting" && report.elapsed !== undefined ? `等了${report.elapsed}秒还没出回答`
    : report.place === "failed" ? `回答没完成${report.error ? `（${report.error}）` : ""}`
    : report.place === "answer" ? "关于一条回答"
    : short(firstLine, 30);
  const lines = [
    `写的内容：${report.text ? `\n${report.text}` : "（没写，直接发送的）"}`,
    "",
    `在哪里：${PLACES[report.place]}，${SURFACES[report.surface]}`,
    report.question && `问题：${report.question}`,
    report.asked_at && `提问时间：${beijing(Date.parse(report.asked_at))}（北京时间）`,
    report.elapsed !== undefined && `${report.place === "waiting" ? "已经等了" : "用时"}：${report.elapsed}秒`,
    report.quiet !== undefined && `最近一次收到进展：${report.quiet}秒前`,
    report.stage && `进行到：${STAGES[report.stage] || report.stage}`,
    report.error && `出错：${report.error}`,
    report.status && `回答状态：${report.status}`,
    report.share && `回答页面：${report.share}`,
    report.model && `回答模型：${report.model}`,
    `设备：${seen.agent}`,
    `发送时间：${beijing(seen.at)}（北京时间），${new Date(seen.at).toISOString().slice(0, 19)}Z`,
    seen.release && `主站版本：${seen.release}`,
  ].filter(line => typeof line === "string");
  return {
    key: `ask-report:${seen.id}`,
    subject: `问问立正反馈：${subject || "页面上的问题"}`,
    text: `有人在问问立正点了「反馈问题」。\n\n${lines.join("\n")}\n\n这封邮件由网站自动发出；对方没有留下联系方式的话，没法直接回复。`,
  };
}

// KEYS[1]: this network's reports today; KEYS[2]: everyone's. ARGV: the two caps, the ttl. 0 is
// accepted; 1 means this network has sent enough today, 2 that everyone together has.
export const REPORT_COUNT_SCRIPT = `
local net=redis.call('INCR',KEYS[1])
if net==1 then redis.call('EXPIRE',KEYS[1],tonumber(ARGV[3])) end
if net>tonumber(ARGV[1]) then return 1 end
local all=redis.call('INCR',KEYS[2])
if all==1 then redis.call('EXPIRE',KEYS[2],tonumber(ARGV[3])) end
if all>tonumber(ARGV[2]) then return 2 end
return 0
`;

/** Checks one report and mails it to the owner; our own checks and crawlers are let through unmailed. */
export async function recordReport(request: Request, body: Buffer, send = redis, mail = sendMail, now = Date.now()): Promise<"mailed" | "skipped"> {
  const report = reportFrom(body);
  const agent = plain(request.headers.get("user-agent") || "").slice(0, 300);
  if (!agent || NOT_A_PERSON.test(agent)) return "skipped";
  const day = new Date(now + 8 * 3_600_000).toISOString().slice(0, 10); // Beijing day, like the quota
  const counted = await send(["EVAL", REPORT_COUNT_SCRIPT, 2,
    `${REPORT_PREFIX}net:${await authDigest(`report-network:${clientNetwork(request)}`)}:${day}`, `${REPORT_PREFIX}day:${day}`,
    REPORT_NETWORK_DAILY_LIMIT, REPORT_DAILY_LIMIT, 172_800]);
  if (counted === 1 || counted === 2) throw new AccessError("report_limited", 429);
  if (counted !== 0) throw new AccessError("report_unavailable");
  const release = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  try {
    await mail(reportMail(report, { at: now, agent, release, id: crypto.randomUUID() }));
  } catch {
    throw new AccessError("report_unavailable");
  }
  return "mailed";
}
