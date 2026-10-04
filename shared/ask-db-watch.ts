/**
 * Mails the owner when the database behind the Ask changes plan. Upstash upgrades it on its own when
 * it fills (Auto Upgrade, on since 2026-10-04 at the user's request), and the user asked to hear
 * when that happens. Once a day (vercel.json crons) this reads the plan's size, INFO memory's
 * maxmemory, and mails when it differs from the size last seen; the first run says the check is on.
 * It reads nothing else, and mails at most once for each change.
 */
import { AccessError, redis } from "./ask-access.js";

export const DB_WATCH_KEY = "ask:watch:v1:db";
const OWNER = "sunyuzheng@gmail.com";
const STORE = "ask-lizheng-kv";
// Upstash's fixed plans as Vercel Storage lists them (2026-10-04), per month.
const PRICES: Record<number, string> = { 268435456: "$10", 1073741824: "$20", 5368709120: "$100", 10737418240: "$200" };

export type Mail = { subject: string; text: string; key: string };
export type WatchResult = "started" | "unchanged" | "upgraded" | "changed";

export function planBytes(info: unknown): number | null {
  const match = /(?:^|\n)maxmemory:(\d+)/.exec(String(info));
  return match && Number(match[1]) > 0 ? Number(match[1]) : null;
}
export const planSize = (bytes: number) =>
  bytes >= 2 ** 30 ? `${Number((bytes / 2 ** 30).toFixed(1))}GB` : `${Math.round(bytes / 2 ** 20)}MB`;
const price = (bytes: number) => (PRICES[bytes] ? `，每月${PRICES[bytes]}` : "");

export function watchMail(result: Exclude<WatchResult, "unchanged">, before: number, after: number): Mail {
  if (result === "started")
    return {
      key: `ask-db-watch:start:${after}`,
      subject: "问问立正：数据库升级提醒已开启",
      text: `lizheng.ai 和问问立正用的数据库（Vercel Storage 里的 ${STORE}）已打开自动升级：存满时 Upstash 会自动换成更大的套餐，网站不会停。\n\n` +
        `每次换套餐，这里都会发一封邮件。现在的上限是${planSize(after)}${price(after)}。每天检查一次。\n\n这封是开启时的确认，不用回复。`,
    };
  return {
    key: `ask-db-watch:${before}:${after}`,
    subject: result === "upgraded"
      ? `问问立正的数据库自动升级了：${planSize(before)} → ${planSize(after)}`
      : `问问立正的数据库换了套餐：${planSize(before)} → ${planSize(after)}`,
    text: (result === "upgraded"
      ? `数据存满了原来的套餐，Upstash 已经自动升级，网站照常运行。新的上限是${planSize(after)}${price(after)}，费用以 Vercel 账单为准。`
      : `数据库的上限从${planSize(before)}变成了${planSize(after)}${price(after)}，不是自动升级，可能是在 Vercel 里手动改的。`) +
      `\n\n看用量或调整：Vercel → Storage → ${STORE} → Settings。`,
  };
}

/** Sends through the Resend key the email sign-in already uses, from the agent sender. */
export async function sendMail(mail: Mail): Promise<void> {
  const key = process.env.ASK_AUTH_EMAIL_API_KEY?.trim();
  if (!key) throw new AccessError("email_unavailable");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": mail.key },
    body: JSON.stringify({ from: "立正 <podcast@notify.lizheng.ai>", to: [OWNER], reply_to: OWNER, subject: mail.subject, text: mail.text }),
    cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(5_000),
  });
  await response.body?.cancel().catch(() => {});
  if (!response.ok) throw new AccessError("email_unavailable");
}

export async function watchDatabase(send = redis, mail = sendMail, now = Date.now()): Promise<WatchResult> {
  const after = planBytes(await send(["INFO", "memory"]));
  if (!after) throw new AccessError("watch_unavailable");
  const before = Number(await send(["HGET", DB_WATCH_KEY, "plan_bytes"])) || 0;
  const at = new Date(now).toISOString();
  if (before === after) {
    await send(["HSET", DB_WATCH_KEY, "checked_at", at]);
    return "unchanged";
  }
  const result = !before ? "started" : after > before ? "upgraded" : "changed";
  // Mailed first: if mail fails, the change stays unseen and tomorrow's check tries again.
  await mail(watchMail(result, before, after));
  await send(["HSET", DB_WATCH_KEY, "plan_bytes", after, "changed_at", at, "checked_at", at]);
  return result;
}
