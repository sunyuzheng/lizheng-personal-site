/** Permanent, owner-only question and answer archive. Fixed Redis scripts. */
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
};
export type OpsFinish = {
  v: 3;
  event: "finish";
  record_id: string;
  status: (typeof OPS_STATUSES)[number];
  duration_ms: number;
  answer: ArchivedAnswer | null;
  error_code: string | null;
};
export type OpsRecord = Omit<OpsStart, "event"> & {
  status: (typeof OPS_STATUSES)[number] | "generating";
  duration_ms: number | null;
  question_chars: number;
  turn_number: number;
  unconfirmed: boolean;
  answer: ArchivedAnswer | null;
  error_code: string | null;
  answer_chars: number;
};
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
  const keys =
    r.event === "start"
      ? [
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
        ]
      : [
          "v",
          "event",
          "record_id",
          "status",
          "duration_ms",
          "answer",
          "error_code",
        ];
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
      archivedAnswer(r.answer);
      if (r.answer.status !== r.status) fail();
    } else if (!["error", "cancelled"].includes(r.status)) fail();
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
redis.call('HSET',KEYS[1],'start_hash',ARGV[1],'record_id',ARGV[2],'question',ARGV[3],'created_at',ARGV[4],'model',ARGV[5],'visitor_id',ARGV[6],'conversation_id',ARGV[7],'intent',ARGV[8],'entrypoint',ARGV[9],'question_chars',ARGV[10],'turn_number',turn,'day',ARGV[11],'status','generating','duration_ms','','answer','','error_code','')
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
export const OPS_FINISH_SCRIPT = `
if redis.call('EXISTS',KEYS[1]) == 0 then return 0 end
local status=redis.call('HGET',KEYS[1],'status')
if status ~= 'generating' then return 0 end
local day=redis.call('HGET',KEYS[1],'day')
redis.call('HSET',KEYS[1],'status',ARGV[1],'duration_ms',ARGV[2],'answer',ARGV[4],'error_code',ARGV[5])
for _,key in ipairs({KEYS[2],ARGV[3]..'day:'..day}) do
 redis.call('HINCRBY',key,'generating',-1)
 redis.call('HINCRBY',key,ARGV[1],1)
 redis.call('HINCRBY',key,'completed',1)
 redis.call('HINCRBY',key,'duration_ms',ARGV[2])
end
return 1`;
// Tombstones prevent a timed-out intake retry from resurrecting a manually deleted question.
export const OPS_DELETE_SCRIPT = `
if redis.call('EXISTS',KEYS[1]) == 0 then return 0 end
local row=redis.call('HMGET',KEYS[1],'day','visitor_id','conversation_id','question_chars','status','duration_ms','entrypoint')
local day,visitor,conversation,chars,status,duration,entrypoint=unpack(row)
local prefix=ARGV[2]
for _,key in ipairs({KEYS[3],prefix..'day:'..day}) do
 redis.call('HINCRBY',key,'questions',-1)
 redis.call('HINCRBY',key,'question_chars',-tonumber(chars))
 redis.call('HINCRBY',key,status,-1)
 redis.call('HINCRBY',key,entrypoint,-1)
 if duration ~= '' then redis.call('HINCRBY',key,'completed',-1); redis.call('HINCRBY',key,'duration_ms',-tonumber(duration)) end
end
for _,pair in ipairs({{prefix..'visitors',visitor},{prefix..'day-visitors:'..day,visitor},{prefix..'conversations',conversation},{prefix..'day-conversations:'..day,conversation}}) do
 local n=redis.call('HINCRBY',pair[1],pair[2],-1)
 if n <= 0 then redis.call('HDEL',pair[1],pair[2]) end
end
redis.call('ZREM',KEYS[2],ARGV[1])
redis.call('ZREM',prefix..'conversation:'..conversation,ARGV[1])
if redis.call('ZCARD',prefix..'conversation:'..conversation) == 0 then
 redis.call('DEL',prefix..'conversation:'..conversation,prefix..'sequence:'..conversation)
end
redis.call('DEL',KEYS[1])
redis.call('SET',prefix..'deleted:'..ARGV[1],'1','EX',86400)
return 1`;
function beijingDay(created: number) {
  return new Date(created + 8 * 3600_000).toISOString().slice(0, 10);
}
export async function storeOpsEvent(
  body: Buffer,
  proof: unknown,
  send: Sender = redis
) {
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
    ]);
  } else
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
    ]);
  if (![0, 1, 2].includes(Number(result)) || typeof result !== "number")
    throw new AccessError("ops_storage_unavailable");
  return { ok: true };
}
export const RECORD_FIELDS = [
  "record_id",
  "question",
  "created_at",
  "model",
  "visitor_id",
  "conversation_id",
  "intent",
  "entrypoint",
  "status",
  "duration_ms",
  "question_chars",
  "turn_number",
  "answer",
  "error_code",
];
function strings(value: unknown): string[] {
  if (!Array.isArray(value) || value.some(v => typeof v !== "string"))
    throw new AccessError("ops_read_failed");
  return value;
}
export async function readOpsRecord(
  id: string,
  send: Sender = redis
): Promise<OpsRecord | null> {
  if (!OPS_UUID.test(id)) fail();
  const row = await send([
    "HMGET",
    OPS_PREFIX + "record:" + id,
    ...RECORD_FIELDS,
  ]);
  if (!Array.isArray(row) || row.length !== RECORD_FIELDS.length)
    throw new AccessError("ops_read_failed");
  if (row.every(v => v === null)) return null;
  const values = strings(row),
    result = Object.fromEntries(RECORD_FIELDS.map((f, i) => [f, values[i]]));
  if (
    result.record_id !== id ||
    !OPS_HASH.test(result.visitor_id) ||
    !OPS_HASH.test(result.conversation_id) ||
    !result.question.trim() ||
    Array.from(result.question).length > 2000 ||
    !/^[a-z0-9][a-z0-9._:/-]{0,100}$/.test(result.model) ||
    ![...OPS_STATUSES, "generating"].includes(
      result.status as (typeof OPS_STATUSES)[number]
    ) ||
    !["home", "standalone"].includes(result.entrypoint) ||
    !["understand", "apply", "find"].includes(result.intent) ||
    !Number.isFinite(Date.parse(result.created_at)) ||
    new Date(result.created_at).toISOString() !== result.created_at ||
    !/^\d+$/.test(result.turn_number) ||
    Number(result.turn_number) < 1 ||
    !Number.isSafeInteger(Number(result.turn_number)) ||
    Number(result.question_chars) !== Array.from(result.question).length ||
    result.answer.length > OPS_BODY_LIMIT ||
    (result.duration_ms !== "" &&
      (!/^\d{1,6}$/.test(result.duration_ms) ||
        Number(result.duration_ms) > 600_000)) ||
    (result.status === "generating") !== (result.duration_ms === "") ||
    (result.error_code && !/^[a-z_]{1,80}$/.test(result.error_code))
  )
    throw new AccessError("ops_read_failed");
  let answer: ArchivedAnswer | null = null;
  if (result.answer) {
    try {
      answer = archivedAnswer(JSON.parse(result.answer));
    } catch {
      throw new AccessError("ops_read_failed");
    }
  }
  if (answer && answer.status !== result.status)
    throw new AccessError("ops_read_failed");
  return {
    ...result,
    answer,
    error_code: result.error_code || null,
    answer_chars: answer
      ? Array.from(
          [
            answer.summary,
            ...answer.sections.map(s => s.heading + "\n" + s.body),
            answer.limitations,
            ...answer.followups,
            ...answer.clarifying_questions,
          ].join("\n")
        ).length
      : 0,
    v: 3,
    duration_ms: result.duration_ms === "" ? null : Number(result.duration_ms),
    question_chars: Number(result.question_chars),
    turn_number: Number(result.turn_number),
    unconfirmed:
      result.status === "generating" &&
      Date.parse(result.created_at) < Date.now() - 300_000,
  } as OpsRecord;
}
export type OpsRange = "today" | "7" | "30" | "90" | "all";
export function opsRange(value: string | null): OpsRange {
  if (!["today", "7", "30", "90", "all"].includes(value || "")) fail();
  return value as OpsRange;
}
export function rangeBounds(range: OpsRange, now = Date.now()) {
  const today = beijingDay(now),
    midnight = Date.parse(today + "T00:00:00.000+08:00");
  return {
    today,
    min:
      range === "all"
        ? 0
        : midnight - ((range === "today" ? 1 : Number(range)) - 1) * 86400_000,
    max: now,
  };
}
const COUNTERS = [
  "questions",
  "question_chars",
  "generating",
  ...OPS_STATUSES,
  "completed",
  "duration_ms",
  "home",
  "standalone",
];
function counters(row: unknown) {
  if (
    !Array.isArray(row) ||
    row.length !== COUNTERS.length ||
    row.some(v => v !== null && (typeof v !== "string" || !/^\d+$/.test(v)))
  )
    throw new AccessError("ops_read_failed");
  return Object.fromEntries(COUNTERS.map((f, i) => [f, Number(row[i] || 0)]));
}
// Exact unique-browser and conversation counts for a bounded date range; no question text.
export const OPS_UNIQUE_SCRIPT = `
local visitors,conversations={},{}
for i=1,#KEYS,2 do
 for _,id in ipairs(redis.call('HKEYS',KEYS[i])) do visitors[id]=true end
 for _,id in ipairs(redis.call('HKEYS',KEYS[i+1])) do conversations[id]=true end
end
local v,c=0,0
for _ in pairs(visitors) do v=v+1 end
for _ in pairs(conversations) do c=c+1 end
return {v,c}`;
// One read-only Redis snapshot: daily counters, aggregate counters and unique
// browser/conversation counts cannot observe different intake/deletion states.
export const OPS_SUMMARY_SCRIPT = `
local fields={}
for i=2,#ARGV do fields[#fields+1]=ARGV[i] end
local daily,totals,visitors,conversations={},{},{},{}
for i=1,#fields do totals[i]=0 end
for i=4,#KEYS,3 do
 local row=redis.call('HMGET',KEYS[i],unpack(fields))
 daily[#daily+1]=row
 if ARGV[1] ~= 'all' then
  for j=1,#fields do totals[j]=totals[j]+(tonumber(row[j]) or 0) end
  for _,id in ipairs(redis.call('HKEYS',KEYS[i+1])) do visitors[id]=true end
  for _,id in ipairs(redis.call('HKEYS',KEYS[i+2])) do conversations[id]=true end
 end
end
local unique
if ARGV[1] == 'all' then
 totals=redis.call('HMGET',KEYS[1],unpack(fields))
 unique={redis.call('HLEN',KEYS[2]),redis.call('HLEN',KEYS[3])}
else
 local v,c=0,0
 for _ in pairs(visitors) do v=v+1 end
 for _ in pairs(conversations) do c=c+1 end
 unique={v,c}
end
return {totals,daily,unique}`;
export async function opsSummary(range: OpsRange, send: Sender = redis) {
  const bounds = rangeBounds(range),
    days: string[] = [];
  // All-time totals stay exact; chart shows the most recent 30 days for all-time.
  const midnight = Date.parse(bounds.today + "T00:00:00+08:00");
  const chartStart = range === "all" ? midnight - 29 * 86400_000 : bounds.min;
  for (let time = chartStart; time <= midnight; time += 86400_000)
    days.push(beijingDay(time));
  const keys = [
    OPS_PREFIX + "total",
    OPS_PREFIX + "visitors",
    OPS_PREFIX + "conversations",
    ...days.flatMap(day => [
      OPS_PREFIX + "day:" + day,
      OPS_PREFIX + "day-visitors:" + day,
      OPS_PREFIX + "day-conversations:" + day,
    ]),
  ];
  const snapshot = await send([
    "EVAL",
    OPS_SUMMARY_SCRIPT,
    keys.length,
    ...keys,
    range === "all" ? "all" : "range",
    ...COUNTERS,
  ]);
  if (
    !Array.isArray(snapshot) ||
    snapshot.length !== 3 ||
    !Array.isArray(snapshot[1]) ||
    snapshot[1].length !== days.length
  )
    throw new AccessError("ops_read_failed");
  const [aggregate, rows, unique] = snapshot;
  // Redis HMGET returns strings/null; Lua summed range counters return numbers.
  const totals = counters(
    Array.isArray(aggregate)
      ? aggregate.map(value =>
          typeof value === "number" && Number.isSafeInteger(value)
            ? String(value)
            : value
        )
      : aggregate
  );
  const daily = days.map((day, i) => ({ day, ...counters(rows[i]) }));
  if (
    !Array.isArray(unique) ||
    unique.length !== 2 ||
    unique.some(v => typeof v !== "number" || !Number.isInteger(v) || v < 0)
  )
    throw new AccessError("ops_read_failed");
  return {
    range,
    timezone: "Asia/Shanghai",
    totals,
    visitors: unique[0],
    conversations: unique[1],
    daily,
    generated_at: new Date().toISOString(),
  };
}
// Seek cursor includes score and ID; stable across insertions/deletions, including identical timestamps.
export const OPS_PAGE_SCRIPT = `
local out,offset={},0
while #out < tonumber(ARGV[4])*2 do
 local rows=redis.call('ZREVRANGEBYSCORE',KEYS[1],ARGV[1],ARGV[2],'WITHSCORES','LIMIT',offset,500)
 if #rows == 0 then break end
 for i=1,#rows,2 do
  local id,score=rows[i],tonumber(rows[i+1])
  if score < tonumber(ARGV[1]) or ARGV[3] == '' or id < ARGV[3] then
   table.insert(out,id); table.insert(out,rows[i+1])
   if #out >= tonumber(ARGV[4])*2 then break end
  end
 end
 if #rows < 1000 then break end
 offset=offset+500
end
return out`;
function parseCursor(cursor: string | null, max: number) {
  if (!cursor) return { max, id: "" };
  const match = /^(\d{1,16}):([a-f0-9-]{36})$/.exec(cursor);
  if (!match || !OPS_UUID.test(match[2]) || Number(match[1]) > max) fail();
  return { max: Number(match[1]), id: match[2] };
}
export async function opsRecords(
  range: OpsRange,
  cursor: string | null,
  limit = 25,
  conversation?: string,
  send: Sender = redis
) {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    (conversation && !OPS_HASH.test(conversation))
  )
    fail();
  const bounds = rangeBounds(range),
    pos = parseCursor(
      cursor,
      conversation ? Number.MAX_SAFE_INTEGER : bounds.max
    );
  const key =
    OPS_PREFIX + (conversation ? "conversation:" + conversation : "records");
  const items = strings(
    await send([
      "EVAL",
      OPS_PAGE_SCRIPT,
      1,
      key,
      pos.max,
      conversation ? 0 : bounds.min,
      pos.id,
      limit + 1,
    ])
  );
  if (items.length % 2) throw new AccessError("ops_read_failed");
  const selected: { id: string; score: string }[] = [];
  for (let i = 0; i < items.length; i += 2) {
    if (!OPS_UUID.test(items[i]) || !/^\d+$/.test(items[i + 1]))
      throw new AccessError("ops_read_failed");
    selected.push({ id: items[i], score: items[i + 1] });
  }
  const page = selected.slice(0, limit),
    records: OpsRecord[] = [];
  for (let i = 0; i < page.length; i += 8)
    records.push(
      ...(
        await Promise.all(
          page.slice(i, i + 8).map(row => readOpsRecord(row.id, send))
        )
      ).filter((r): r is OpsRecord => !!r)
    );
  const last = page.at(-1);
  const conversation_turns = conversation
    ? await send(["ZCARD", key])
    : undefined;
  return {
    records,
    next_cursor:
      selected.length > limit && last ? `${last.score}:${last.id}` : null,
    conversation_turns,
  };
}
export async function deleteOpsRecord(id: string, send: Sender = redis) {
  if (!OPS_UUID.test(id)) fail();
  const result = await send([
    "EVAL",
    OPS_DELETE_SCRIPT,
    3,
    OPS_PREFIX + "record:" + id,
    OPS_PREFIX + "records",
    OPS_PREFIX + "total",
    id,
    OPS_PREFIX,
  ]);
  if (result !== 0 && result !== 1) throw new AccessError("ops_delete_failed");
  return { deleted: result === 1, record_id: id };
}
