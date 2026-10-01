/** Node-only email ownership verification. No questions or member content. */
import { randomInt, timingSafeEqual } from "node:crypto";
import {
  AccessError, authCookie, authDigest, decryptRecord, encryptRecord,
  officialOrigin, randomId, readCookie, redis, redisKey, safeReturnPath,
} from "./ask-access";

export const COOKIE_EMAIL = "__Host-ask-email";
const VALID_SECONDS = 600;
const MAX_ATTEMPTS = 5;
type Challenge = {
  v: 1; email: string; origin: string; returnPath: string;
  codeHash: string; expiresAt: number;
};

// All rate keys share one Redis hash tag, including the resend cooldown.
const RATE_SCRIPT = `
for i=1,3 do
  if tonumber(redis.call('GET',KEYS[i]) or '0') >= tonumber(ARGV[i]) then return 0 end
end
if redis.call('EXISTS',KEYS[4]) == 1 then return 0 end
for i=1,3 do
  local n=redis.call('INCR',KEYS[i])
  if n == 1 then redis.call('EXPIRE',KEYS[i],ARGV[4]) end
end
redis.call('SET',KEYS[4],'1','EX',ARGV[5])
return 1`;

// Compare the exact encrypted record read by this request, then consume or
// increment attempts in the same operation. Concurrent correct codes win once.
const VERIFY_SCRIPT = `
local raw=redis.call('GET',KEYS[1])
if not raw or redis.call('PTTL',KEYS[1]) <= 0 then return 'missing' end
if raw ~= ARGV[1] then return 'changed' end
local attempts=tonumber(redis.call('GET',KEYS[2]) or '0')
if attempts >= tonumber(ARGV[3]) then return 'locked' end
if ARGV[2] == '1' then
  redis.call('DEL',KEYS[1],KEYS[2]); return 'verified'
end
local ttl=redis.call('PTTL',KEYS[1])
attempts=redis.call('INCR',KEYS[2])
if attempts == 1 then redis.call('PEXPIRE',KEYS[2],ttl) end
if attempts >= tonumber(ARGV[3]) then
  redis.call('DEL',KEYS[1]); return 'locked'
end
return 'invalid'`;

export function emailLoginReady() {
  return !!process.env.ASK_AUTH_EMAIL_API_KEY?.trim();
}
function emailAddress(value: unknown) {
  if (typeof value !== "string") throw new AccessError("invalid_email", 400);
  const email = value.trim().toLowerCase();
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\x00-\x1f\x7f<>"\\]/.test(email))
    throw new AccessError("invalid_email", 400);
  return email;
}
export function emailReturnPath(url: URL) {
  const path = safeReturnPath(url.searchParams.get("return"));
  return url.searchParams.get("popup") === "1" ? path.replace("#", "?ask_login=done#") : path;
}
function codeHash(id: string, email: string, code: string) {
  return authDigest(`email-otp-code:${id}:${email}:${code}`);
}
async function consumeSendLimit(email: string, address: string) {
  const window = Math.floor(Date.now() / (VALID_SECONDS * 1000));
  const emailHash = await authDigest(`email-otp-email:${email}`);
  const ipHash = await authDigest(`email-otp-ip:${address.trim().slice(0, 200) || "unknown"}`);
  const prefix = "ask:auth:{email-rate-v1}:";
  const allowed = await redis(["EVAL", RATE_SCRIPT, 4,
    `${prefix}email:${emailHash}:${window}`, `${prefix}ip:${ipHash}:${window}`,
    `${prefix}global:${window}`, `${prefix}resend:${emailHash}`,
    3, 20, 100, VALID_SECONDS, 60]);
  if (allowed !== 1) throw new AccessError("email_throttled", 429);
}
async function deliverCode(email: string, code: string, id: string) {
  const key = process.env.ASK_AUTH_EMAIL_API_KEY?.trim();
  if (!key) throw new AccessError("email_unavailable");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json",
        "Idempotency-Key": `ask-email-otp:${id}` },
      body: JSON.stringify({ from: "立正 <podcast@notify.lizheng.ai>", to: [email],
        reply_to: "sunyuzheng@gmail.com", subject: "问问立正｜邮箱验证码",
        text: `你的问问立正邮箱验证码是：${code}\n10分钟内有效。若非本人操作，请忽略本邮件。`,
        html: `<p>你的问问立正邮箱验证码是：</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>10分钟内有效。若非本人操作，请忽略本邮件。</p>` }),
      cache: "no-store", redirect: "manual", signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      void response.body?.cancel().catch(() => {});
      throw new AccessError("email_unavailable");
    }
    reader = response.body.getReader();
    const abort = () => { void reader?.cancel().catch(() => {}); };
    controller.signal.addEventListener("abort", abort, { once: true });
    let size = 0;
    const chunks: Uint8Array[] = [];
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (controller.signal.aborted) throw new AccessError("email_unavailable");
        if (done) break;
        size += value.byteLength;
        if (size > 16_384) throw new AccessError("email_unavailable");
        chunks.push(value);
      }
    } finally { controller.signal.removeEventListener("abort", abort); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const result = JSON.parse(new TextDecoder().decode(bytes));
    if (!result || typeof result.id !== "string" || !result.id || result.id.length > 160)
      throw new AccessError("email_unavailable");
  } catch { throw new AccessError("email_unavailable"); }
  finally { clearTimeout(timer); if (reader) { void reader.cancel().catch(() => {}); reader.releaseLock(); } }
}

export async function requestEmailCode(request: Request, rawEmail: unknown, address: string) {
  if (!emailLoginReady()) throw new AccessError("email_unavailable");
  const url = new URL(request.url), origin = officialOrigin(request.url);
  const email = emailAddress(rawEmail);
  await consumeSendLimit(email, address);
  const id = randomId(), key = await redisKey("otp", id);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const challenge: Challenge = { v: 1, email, origin, returnPath: emailReturnPath(url),
    codeHash: await codeHash(id, email, code), expiresAt: Math.floor(Date.now() / 1000) + VALID_SECONDS };
  await redis(["SET", key, await encryptRecord(challenge), "EX", VALID_SECONDS]);
  try { await deliverCode(email, code, id); }
  catch (error) { await redis(["DEL", key]); throw error; }
  const previous = readCookie(request, COOKIE_EMAIL);
  if (previous && /^[a-f0-9]{64}$/.test(previous)) {
    const oldKey = await redisKey("otp", previous);
    await redis(["DEL", oldKey, `${oldKey}:attempts`]);
  }
  return { cookie: authCookie(COOKIE_EMAIL, id, VALID_SECONDS), expires_in: VALID_SECONDS };
}

export async function verifyEmailCode(request: Request, rawCode: unknown): Promise<{ email: string; redirect: string }> {
  const origin = officialOrigin(request.url), id = readCookie(request, COOKIE_EMAIL);
  if (!id || !/^[a-f0-9]{64}$/.test(id)) throw new AccessError("email_expired", 401);
  if (typeof rawCode !== "string" || !/^\d{6}$/.test(rawCode.trim())) throw new AccessError("invalid_code", 400);
  const key = await redisKey("otp", id), stored = await redis(["GET", key]);
  if (stored === null) throw new AccessError("email_expired", 401);
  const challenge = await decryptRecord(stored) as Challenge;
  if (!challenge || challenge.v !== 1 || challenge.origin !== origin ||
      !Number.isInteger(challenge.expiresAt) || challenge.expiresAt <= Date.now() / 1000 ||
      typeof challenge.codeHash !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(challenge.codeHash) ||
      !["/#ask-lizheng", "/en/#ask-lizheng", "/?ask_login=done#ask-lizheng", "/en/?ask_login=done#ask-lizheng"].includes(challenge.returnPath))
    throw new AccessError("email_expired", 401);
  const email = emailAddress(challenge.email);
  const submitted = await codeHash(id, email, rawCode.trim());
  const matches = timingSafeEqual(Buffer.from(challenge.codeHash), Buffer.from(submitted));
  const result = await redis(["EVAL", VERIFY_SCRIPT, 2, key, `${key}:attempts`, stored as string, matches ? "1" : "0", MAX_ATTEMPTS]);
  if (result !== "verified") {
    if (!["missing", "changed", "locked", "invalid"].includes(String(result))) throw new AccessError("access_unavailable");
    throw new AccessError(result === "locked" ? "email_locked" : "invalid_code", 401);
  }
  return { email, redirect: `${origin}${challenge.returnPath}` };
}
