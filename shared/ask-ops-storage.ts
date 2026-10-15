/** Signed question/answer archive intake. Dashboard readers live in ask-lizheng-ops. */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { AccessError, redis } from "./ask-access.js";
import { archivedAnswer, type ArchivedAnswer } from "./ask-archive-answer.js";
export const OPS_BODY_LIMIT = 262_144;

export const OPS_PREFIX = "ask-ops:{v3}:";
export const OPS_STATUSES = [
  "answered",
  "clarify",
  "unsupported",
  "sources-only",
  "error",
  "cancelled",
] as const;
export const OPS_UUID =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export const OPS_HASH = /^[a-f0-9]{64}$/;
export type OpsStart = {
  v: 3;
  event: "start";
  record_id: string;
  question: string;
  created_at: string;
  model: string;
  visitor_id: string;
  conversation_id: string;
  intent: "understand" | "apply" | "find";
  entrypoint: "home" | "standalone";
  // Asked under the v4 notice: the answer may be published (as asked since 2026-10-05; before, with personal details removed),
  // unless a situation or earlier turns took part ("1"). The situation itself stays owner-only.
  notice_version?: "v4";
  has_background?: "0" | "1";
  context?: string;
};
export type OpsFinish = {
  v: 3;
  event: "finish";
  record_id: string;
  status: (typeof OPS_STATUSES)[number];
  duration_ms: number;
  answer: ArchivedAnswer | null;
  error_code: string | null;
  // The English word the model gave an answered question, for its page's address (2026-10-14).
  share_word?: string;
};
/** One to four lowercase English words: the word of a page's address (ask.lizheng.ai/s/<day>/<word>). */
export const PAGE_WORD = /^[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,3}$/;
/** An address: the word, with -2, -3… when its day already had it. */
export const PAGE_SLUG = /^[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,4}$/;
/**
 * Lua: the first free address of a day for one record (word, word-2…, up to 500), taken for it and
 * returned, or '' when all are taken. An address another record holds stays its; one this record
 * holds is its own. The finish script below and the share script (ask-share-link.ts) both take
 * addresses with it, so a record gets the same address whichever comes first.
 */
export const PAGE_ADDRESS_LUA = `
local function take_address(prefix,day,word,id)
 for n=1,500 do
  local candidate=word
  if n>1 then candidate=candidate..'-'..n end
  local key=prefix..'share:'..day..':'..candidate
  local owner=redis.call('GET',key)
  if not owner or owner==id then redis.call('SET',key,id) return candidate end
 end
 return ''
end`;
/**
 * Lua: the record whose page a conversation is, or nil while none of its questions is answered.
 * A conversation is one question with one page (2026-10-15, the owner: 多轮对话应该在同一个 URL 里边,
 * titled by its first question): its first question answered under the v4 notice. Its follow-ups
 * are shown on that page, after it, and have no address of their own. Kept once found
 * (conversation-head:<conversation>), so deleting that question takes the whole page with it rather
 * than putting a follow-up in its place; a conversation from before 2026-10-15 is found on first need.
 * Ops (ask-lizheng-ops) runs the same text to publish a conversation once, by this question.
 */
export const CONVERSATION_HEAD_LUA = `
local function conversation_head(prefix,conversation)
 if not conversation or conversation == '' then return nil end
 local pin=prefix..'conversation-head:'..conversation
 local head=redis.call('GET',pin)
 if head then return head end
 for _,id in ipairs(redis.call('ZRANGE',prefix..'conversation:'..conversation,0,-1)) do
  local row=redis.call('HMGET',prefix..'record:'..id,'status','notice_version')
  if row[1] == 'answered' and row[2] == 'v4' then
   redis.call('SET',pin,id)
   return id
  end
 end
 return nil
end`;
export type Sender = (command: (string | number)[]) => Promise<unknown>;
function fail(): never {
  throw new AccessError("invalid_request", 400);
}
export function opsEnabled() {
  return (
    process.env.ASK_OPS_ENABLED === "true" &&
    process.env.ASK_QUERY_LOG_ENABLED === "true" &&
    process.env.ASK_QUOTA_ENABLED === "true"
  );
}
export function opsEvent(body: Buffer, now = Date.now()): OpsStart | OpsFinish {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
  } catch {
    fail();
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) fail();
  const r = parsed as OpsStart | OpsFinish;
  const start = [
    "v",
    "event",
    "record_id",
    "question",
    "created_at",
    "model",
    "visitor_id",
    "conversation_id",
    "intent",
    "entrypoint",
  ];
  const finish = [
    "v",
    "event",
    "record_id",
    "status",
    "duration_ms",
    "answer",
    "error_code",
  ];
  const keys =
    r.event === "start"
      ? "notice_version" in r
        ? [...start, "notice_version", "has_background", "context"]
        : start
      : "share_word" in r
        ? [...finish, "share_word"]
        : finish;
  if (
    JSON.stringify(Object.keys(r).sort()) !== JSON.stringify(keys.sort()) ||
    r.v !== 3 ||
    typeof r.record_id !== "string" ||
    !OPS_UUID.test(r.record_id)
  )
    fail();
  if (r.event === "finish") {
    if (
      !(OPS_STATUSES as readonly string[]).includes(r.status) ||
      !Number.isInteger(r.duration_ms) ||
      r.duration_ms < 0 ||
      r.duration_ms > 600_000
    )
      fail();
    if (
      r.error_code !== null &&
      (typeof r.error_code !== "string" || !/^[a-z_]{1,80}$/.test(r.error_code))
    )
      fail();
    if (r.answer !== null) {
      // Kept as read: a field this site does not know yet is left out of the archive, not refused.
      r.answer = archivedAnswer(r.answer, true);
      if (r.answer.status !== r.status) fail();
    } else if (!["error", "cancelled"].includes(r.status)) fail();
    // Only an answered question has a page.
    if (
      "share_word" in r &&
      (r.status !== "answered" ||
        typeof r.share_word !== "string" ||
        !PAGE_WORD.test(r.share_word))
    )
      fail();
    return r;
  }
  if (
    r.event !== "start" ||
    typeof r.question !== "string" ||
    !r.question.trim() ||
    Array.from(r.question).length > 2000 ||
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(
      r.question
    ) ||
    typeof r.created_at !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.created_at) ||
    typeof r.model !== "string" ||
    !/^[a-z0-9][a-z0-9._:/-]{0,100}$/.test(r.model) ||
    typeof r.visitor_id !== "string" ||
    !OPS_HASH.test(r.visitor_id) ||
    typeof r.conversation_id !== "string" ||
    !OPS_HASH.test(r.conversation_id) ||
    !["understand", "apply", "find"].includes(r.intent) ||
    !["home", "standalone"].includes(r.entrypoint)
  )
    fail();
  if (
    "notice_version" in r &&
    (r.notice_version !== "v4" ||
      (r.has_background !== "0" && r.has_background !== "1") ||
      typeof r.context !== "string" ||
      Array.from(r.context).length > 2500 ||
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(r.context) ||
      (r.context.trim() !== "" && r.has_background !== "1"))
  )
    fail();
  const created = Date.parse(r.created_at);
  if (
    !Number.isFinite(created) ||
    new Date(created).toISOString() !== r.created_at ||
    created > now + 60_000 ||
    created < now - 900_000
  )
    fail();
  return r;
}
export function verifyOpsProof(
  body: Buffer,
  proof: unknown,
  now = Math.floor(Date.now() / 1000)
) {
  const secret = process.env.ASK_QUOTA_STORE_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/.test(secret))
    throw new AccessError("ops_storage_unavailable");
  if (typeof proof !== "string" || !/^v3\.[0-9]{10}\.[a-f0-9]{64}$/.test(proof))
    throw new AccessError("invalid_admission", 403);
  const [, expiry, sig] = proof.split(".");
  if (Number(expiry) <= now || Number(expiry) > now + 45)
    throw new AccessError("invalid_admission", 403);
  const digest = createHash("sha256").update(body).digest("hex");
  const expected = createHmac("sha256", secret)
    .update(`ask-ops-store:v3:${expiry}:${digest}`)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(sig, "hex")))
    throw new AccessError("invalid_admission", 403);
}
// All keys use one hash tag. Atomic intake assigns a turn and increments each index once.
export const OPS_START_SCRIPT = `
if redis.call('EXISTS',KEYS[2]) == 1 then return 2 end
if redis.call('EXISTS',KEYS[1]) == 1 then
  if redis.call('HGET',KEYS[1],'start_hash') ~= ARGV[1] then return -1 end
  return 0
end
local turn=redis.call('INCR',KEYS[5])
redis.call('HSET',KEYS[1],'start_hash',ARGV[1],'record_id',ARGV[2],'question',ARGV[3],'created_at',ARGV[4],'model',ARGV[5],'visitor_id',ARGV[6],'conversation_id',ARGV[7],'intent',ARGV[8],'entrypoint',ARGV[9],'question_chars',ARGV[10],'turn_number',turn,'day',ARGV[11],'status','generating','duration_ms','','answer','','error_code','','notice_version',ARGV[13],'has_background',ARGV[14],'context',ARGV[15])
redis.call('ZADD',KEYS[3],ARGV[12],ARGV[2])
redis.call('ZADD',KEYS[4],turn,ARGV[2])
for i=6,7 do
 redis.call('HINCRBY',KEYS[i],'questions',1)
 redis.call('HINCRBY',KEYS[i],'question_chars',ARGV[10])
 redis.call('HINCRBY',KEYS[i],'generating',1)
 redis.call('HINCRBY',KEYS[i],ARGV[9],1)
end
for i=8,9 do redis.call('HINCRBY',KEYS[i],ARGV[6],1) end
for i=10,11 do redis.call('HINCRBY',KEYS[i],ARGV[7],1) end
return 1`;
// KEYS: the record, the totals. ARGV: status, duration, prefix, answer, error code, then the page's
// word ('' for none), record id, time (ISO) and time (ms). Finishes a generating record once; then an
// answered v4 question gets its page (2026-10-14, the owner: the page exists once the question is
// answered, without anyone sharing it; since 2026-10-15 a question about the asker's own situation
// too, as every answered question is published). A follow-up's answer goes on its conversation's page
// (CONVERSATION_HEAD_LUA), which is returned as its page, made now if that question had none yet. A
// retry finds the record finished and its page made. Returns {finished now (1|0), slug, day}: the
// page's, which for a follow-up is its conversation's, made on that question's day.
export const OPS_FINISH_SCRIPT = `${PAGE_ADDRESS_LUA}${CONVERSATION_HEAD_LUA}
if redis.call('EXISTS',KEYS[1]) == 0 then return {0,'',''} end
local row=redis.call('HMGET',KEYS[1],'status','day','notice_version','share_slug','conversation_id')
local status,day,done=row[1],row[2] or '',0
if status == 'generating' then
 redis.call('HSET',KEYS[1],'status',ARGV[1],'duration_ms',ARGV[2],'answer',ARGV[4],'error_code',ARGV[5])
 for _,key in ipairs({KEYS[2],ARGV[3]..'day:'..day}) do
  redis.call('HINCRBY',key,'generating',-1)
  redis.call('HINCRBY',key,ARGV[1],1)
  redis.call('HINCRBY',key,'completed',1)
  redis.call('HINCRBY',key,'duration_ms',ARGV[2])
 end
 status,done=ARGV[1],1
end
local slug,page,id=row[4] or '',KEYS[1],ARGV[7]
if status == 'answered' and row[3] == 'v4' and day ~= '' then
 local head=conversation_head(ARGV[3],row[5])
 if head and head ~= id then
  -- A follow-up: its conversation's page, or none when that question was deleted.
  local h=redis.call('HMGET',ARGV[3]..'record:'..head,'status','day','share_slug')
  if h[1] ~= 'answered' then return {done,'',''} end
  page,id,day,slug=ARGV[3]..'record:'..head,head,h[2] or '',h[3] or ''
 end
 if slug == '' and (ARGV[6] or '') ~= '' and day ~= '' then
  slug=take_address(ARGV[3],day,ARGV[6],id)
  if slug ~= '' then
   redis.call('HSET',page,'share_slug',slug,'shared_at',ARGV[8])
   redis.call('ZADD',ARGV[3]..'shares',tonumber(ARGV[9]),id)
  end
 end
end
return {done,slug,day}`;
// Tombstones prevent a timed-out intake retry from resurrecting a manually deleted question.
function beijingDay(created: number) {
  return new Date(created + 8 * 3600_000).toISOString().slice(0, 10);
}
export async function storeOpsEvent(
  body: Buffer,
  proof: unknown,
  send: Sender = redis
): Promise<{ ok: true; share?: string }> {
  if (!opsEnabled()) throw new AccessError("ops_storage_disabled");
  if (body.length > OPS_BODY_LIMIT)
    throw new AccessError("input_too_large", 413);
  verifyOpsProof(body, proof);
  const r = opsEvent(body),
    p = OPS_PREFIX;
  let result;
  if (r.event === "start") {
    const ms = Date.parse(r.created_at),
      day = beijingDay(ms);
    result = await send([
      "EVAL",
      OPS_START_SCRIPT,
      11,
      p + "record:" + r.record_id,
      p + "deleted:" + r.record_id,
      p + "records",
      p + "conversation:" + r.conversation_id,
      p + "sequence:" + r.conversation_id,
      p + "total",
      p + "day:" + day,
      p + "visitors",
      p + "day-visitors:" + day,
      p + "conversations",
      p + "day-conversations:" + day,
      createHash("sha256").update(body).digest("hex"),
      r.record_id,
      r.question,
      r.created_at,
      r.model,
      r.visitor_id,
      r.conversation_id,
      r.intent,
      r.entrypoint,
      Array.from(r.question).length,
      day,
      ms,
      // v3 records keep no background flag or situation; Ops reads them as never public.
      r.notice_version ?? "v3",
      r.has_background ?? "",
      r.context ?? "",
    ]);
  } else {
    const now = Date.now();
    result = await send([
      "EVAL",
      OPS_FINISH_SCRIPT,
      2,
      p + "record:" + r.record_id,
      p + "total",
      r.status,
      r.duration_ms,
      p,
      r.answer === null ? "" : JSON.stringify(r.answer),
      r.error_code || "",
      r.share_word ?? "",
      r.record_id,
      new Date(now).toISOString(),
      now,
    ]);
    if (
      !Array.isArray(result) ||
      result.length !== 3 ||
      ![0, 1].includes(result[0]) ||
      typeof result[1] !== "string" ||
      typeof result[2] !== "string"
    )
      throw new AccessError("ops_storage_unavailable");
    const [, slug, day] = result as [number, string, string];
    // A Builder that sends the word is told the page; an older one accepts { ok: true } only.
    return r.share_word !== undefined && PAGE_SLUG.test(slug) && /^\d{4}-\d{2}-\d{2}$/.test(day)
      ? { ok: true as const, share: `${day}/${slug}` }
      : { ok: true as const };
  }
  if (![0, 1, 2].includes(Number(result)) || typeof result !== "number")
    throw new AccessError("ops_storage_unavailable");
  return { ok: true as const };
}
