/** Owner-only, bounded read of the existing 30-day v1 question records. */
import { AccessError, redis } from "./ask-access.js";
import { QUERY_PREFIX, QUERY_RETENTION_SECONDS } from "./ask-query-storage.js";

export type OpsRange = "today" | "7" | "30" | "all";
export type OpsStatus = "answered" | "clarify" | "unsupported" | "sources-only" | "error" | "cancelled";
export type OpsRecord = {
  record_id: string; question: string; created_at: string; model: string;
  status: OpsStatus; duration_ms: number; question_chars: number;
};
export type OpsTotals = {
  questions: number; question_chars: number; completed: number; duration_ms: number;
  status: Record<OpsStatus, number>;
};
export type OpsSummary = {
  totals: OpsTotals; daily: (OpsTotals & { date: string })[];
  generated_at: string; truncated: boolean; visitors: null; conversations: null;
};
export type OpsPage = { records: OpsRecord[]; next_cursor: string | null; truncated: boolean };
export type OpsSender = (command: (string | number)[]) => Promise<unknown>;

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const KEY = new RegExp(`^${QUERY_PREFIX}[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$`);
const STATUSES: OpsStatus[] = ["answered", "clarify", "unsupported", "sources-only", "error", "cancelled"];
const DAY = 86_400_000;
const MAX_KEYS = 5000, MAX_SCANS = 100, BATCH_KEYS = 100, MAX_CONCURRENT = 4, READ_MS = 15_000;

// Every command is read-only. TTL is checked in the same atomic read as HMGET.
// Returning only bounded fields also bounds the Redis REST response per batch.
export const OPS_READ_SCRIPT = `
if #KEYS > 100 then return redis.error_reply('invalid_ops_read') end
local rows = {}
local invalid = 0
for _, key in ipairs(KEYS) do
  if key ~= string.lower(key) or not string.match(key, '^ask%-query:v1:%x%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$') then
    return redis.error_reply('invalid_ops_read')
  end
  local ttl = redis.call('TTL', key)
  if ttl > 0 and ttl <= 2592060 then
    local r = redis.call('HMGET', key, 'question', 'created_at', 'model', 'status', 'duration_ms')
    local valid = true
    local limits = {8000, 24, 101, 12, 6}
    for i = 1, 5 do
      if type(r[i]) ~= 'string' or #r[i] > limits[i] then valid = false end
    end
    if valid then table.insert(rows, {key, r[1], r[2], r[3], r[4], r[5]})
    else invalid = invalid + 1 end
  elseif ttl == -1 or ttl > 2592060 then invalid = invalid + 1 end
end
return {rows, invalid}
`;

class ReadBudget extends Error {}
export function opsRange(value: unknown): OpsRange {
  if (value === "today" || value === "7" || value === "30" || value === "all") return value;
  throw new AccessError("invalid_request", 400);
}
function timestamp(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms) && new Date(ms).toISOString() === value;
}
function day(ms: number) { return new Date(ms + 8 * 3_600_000).toISOString().slice(0, 10); }
function start(range: OpsRange, anchor: number) {
  if (range === "all") return anchor - QUERY_RETENTION_SECONDS * 1000;
  const midnight = Date.parse(`${day(anchor)}T00:00:00+08:00`);
  return midnight - (range === "today" ? 0 : Number(range) - 1) * DAY;
}
function validRecord(raw: unknown, now: number): OpsRecord | null {
  if (!Array.isArray(raw) || raw.length !== 6 || raw.some(v => typeof v !== "string")) return null;
  const [key, question, created_at, model, status, duration] = raw as string[];
  if (!KEY.test(key) || !question.trim() || Array.from(question).length > 2000 ||
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(question) ||
      !timestamp(created_at) || !/^[a-z0-9][a-z0-9._:/-]{0,100}$/.test(model) ||
      !STATUSES.includes(status as OpsStatus) || !/^\d{1,6}$/.test(duration) || Number(duration) > 600_000) return null;
  const created = Date.parse(created_at);
  if (created > now + 60_000 || created <= now - QUERY_RETENTION_SECONDS * 1000) return null;
  return { record_id: key.slice(QUERY_PREFIX.length), question, created_at, model,
    status: status as OpsStatus, duration_ms: Number(duration), question_chars: Array.from(question).length };
}

async function readSnapshot(send: OpsSender, now: number) {
  const deadline = Date.now() + READ_MS;
  const request = async (command: (string | number)[]) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new ReadBudget();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([send(command), new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new ReadBudget()), remaining);
      })]);
    } finally { clearTimeout(timer); }
  };
  const keys = new Set<string>(), records: OpsRecord[] = [];
  let cursor = "0", truncated = false;
  try {
    for (let scans = 0; scans < MAX_SCANS; scans++) {
      const page = await request(["SCAN", cursor, "MATCH", `${QUERY_PREFIX}*`, "COUNT", 500]);
      if (!Array.isArray(page) || page.length !== 2 || typeof page[0] !== "string" || !/^\d{1,20}$/.test(page[0]) ||
          !Array.isArray(page[1]) || page[1].some(key => typeof key !== "string")) throw new AccessError("ops_read_unavailable");
      cursor = page[0];
      for (const key of page[1]) {
        if (!KEY.test(key)) continue;
        if (!keys.has(key) && keys.size === MAX_KEYS) { truncated = true; break; }
        keys.add(key);
      }
      if (cursor === "0") break;
      if (keys.size === MAX_KEYS || scans === MAX_SCANS - 1) { truncated = true; break; }
    }
    const selected = [...keys];
    for (let offset = 0; offset < selected.length; offset += BATCH_KEYS * MAX_CONCURRENT) {
      const requests = [];
      for (let index = offset; index < Math.min(selected.length, offset + BATCH_KEYS * MAX_CONCURRENT); index += BATCH_KEYS) {
        const batch = selected.slice(index, index + BATCH_KEYS);
        requests.push(request(["EVAL", OPS_READ_SCRIPT, batch.length, ...batch]).then(result => {
          if (!Array.isArray(result) || result.length !== 2 || !Array.isArray(result[0]) ||
              result[0].length > batch.length || !Number.isInteger(result[1]) || result[1] < 0 || result[1] > batch.length)
            throw new AccessError("ops_read_unavailable");
          const seen = new Set<string>();
          for (const row of result[0]) {
            const record = validRecord(row, now);
            if (!record || !batch.includes(`${QUERY_PREFIX}${record.record_id}`) || seen.has(record.record_id)) {
              truncated = true;
              continue;
            }
            seen.add(record.record_id);
            records.push(record);
          }
          if (result[1]) truncated = true;
        }));
      }
      const results = await Promise.allSettled(requests);
      for (const result of results) if (result.status === "rejected") throw result.reason;
    }
  } catch (error) {
    if (error instanceof ReadBudget) truncated = true;
    else throw new AccessError("ops_read_unavailable");
  }
  records.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.record_id.localeCompare(a.record_id));
  return { records, truncated };
}

function totals(): OpsTotals {
  return { questions: 0, question_chars: 0, completed: 0, duration_ms: 0,
    status: { answered: 0, clarify: 0, unsupported: 0, "sources-only": 0, error: 0, cancelled: 0 } };
}
function count(value: OpsTotals, record: OpsRecord) {
  value.questions++; value.completed++; value.question_chars += record.question_chars;
  value.duration_ms += record.duration_ms; value.status[record.status]++;
}
export async function opsSummary(range: OpsRange, send: OpsSender = redis, now = Date.now()): Promise<OpsSummary> {
  opsRange(range);
  const snapshot = await readSnapshot(send, now), from = start(range, now), total = totals();
  const daily = new Map<string, OpsTotals & { date: string }>();
  for (let ms = Date.parse(`${day(from)}T00:00:00+08:00`); ms <= now; ms += DAY) {
    const date = day(ms); daily.set(date, { ...totals(), date });
  }
  for (const record of snapshot.records) {
    const created = Date.parse(record.created_at);
    if (created < from || created > now) continue;
    count(total, record); count(daily.get(day(created))!, record);
  }
  return { totals: total, daily: [...daily.values()], generated_at: new Date(now).toISOString(),
    truncated: snapshot.truncated, visitors: null, conversations: null };
}

type Cursor = { v: 1; r: OpsRange; a: number; t: string; i: string };
function decodeCursor(value: string, range: OpsRange, now: number): Cursor {
  const invalid = (): never => { throw new AccessError("invalid_request", 400); };
  if (value.length > 256 || !/^[A-Za-z0-9_-]+$/.test(value)) invalid();
  let parsed: unknown;
  try {
    const bytes = Buffer.from(value, "base64url");
    if (bytes.toString("base64url") !== value) invalid();
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch { invalid(); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
      JSON.stringify(Object.keys(parsed).sort()) !== JSON.stringify(["a", "i", "r", "t", "v"])) invalid();
  const c = parsed as Cursor;
  if (c.v !== 1 || c.r !== range || !Number.isInteger(c.a) || c.a > now || c.a <= now - QUERY_RETENTION_SECONDS * 1000 ||
      !timestamp(c.t) || !UUID.test(c.i) || Date.parse(c.t) > c.a || Date.parse(c.t) < start(range, c.a)) invalid();
  return c;
}
export async function opsRecords(range: OpsRange, limit = 25, cursor?: string,
  send: OpsSender = redis, now = Date.now()): Promise<OpsPage> {
  opsRange(range);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new AccessError("invalid_request", 400);
  const seek = cursor === undefined ? null : decodeCursor(cursor, range, now);
  const anchor = seek?.a ?? now, from = start(range, anchor), snapshot = await readSnapshot(send, now);
  const matches = snapshot.records.filter(record => {
    const created = Date.parse(record.created_at);
    return created >= from && created <= anchor && (!seek || record.created_at < seek.t ||
      (record.created_at === seek.t && record.record_id < seek.i));
  });
  const records = matches.slice(0, limit), last = records.at(-1);
  const next_cursor = matches.length > limit && last ? Buffer.from(JSON.stringify({ v: 1, r: range, a: anchor,
    t: last.created_at, i: last.record_id } satisfies Cursor)).toString("base64url") : null;
  return { records, next_cursor, truncated: snapshot.truncated };
}
