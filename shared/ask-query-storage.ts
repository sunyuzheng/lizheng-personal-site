/** Fixed submitted-question storage. Never an arbitrary Redis command relay. */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { AccessError, redis } from "./ask-access.js";

export const QUERY_BODY_LIMIT = 16_384;
export const QUERY_RETENTION_SECONDS = 30 * 86400;
export const QUERY_PREFIX = "ask-query:v1:";
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const FIELDS = ["v", "record_id", "question", "created_at", "model", "status", "duration_ms"].sort();
const STATUSES = new Set(["answered", "clarify", "unsupported", "sources-only", "error", "cancelled"]);
export type QueryRecord = {
  v: 1; record_id: string; question: string; created_at: string;
  model: string; status: string; duration_ms: number;
};
// A retry is harmless and never extends retention or changes the first record.
export const QUERY_WRITE_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('HSET', KEYS[1], 'question', ARGV[1], 'created_at', ARGV[2], 'model', ARGV[3], 'status', ARGV[4], 'duration_ms', ARGV[5])
redis.call('EXPIREAT', KEYS[1], ARGV[6])
return 1
`;

export function verifyQueryProof(body: Buffer, proof: unknown, now = Math.floor(Date.now() / 1000)) {
  const secret = process.env.ASK_QUOTA_STORE_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) throw new AccessError("query_storage_unavailable");
  if (typeof proof !== "string" || !/^v1\.[0-9]{10}\.[a-f0-9]{64}$/.test(proof))
    throw new AccessError("invalid_admission", 403);
  const [, expiry, signature] = proof.split(".");
  if (Number(expiry) <= now || Number(expiry) > now + 60) throw new AccessError("invalid_admission", 403);
  const hash = createHash("sha256").update(body).digest("hex");
  const expected = createHmac("sha256", secret).update(`ask-query-store:v1:${expiry}:${hash}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) throw new AccessError("invalid_admission", 403);
}

export function queryRecord(body: Buffer, now = Date.now()): QueryRecord {
  const invalid = (): never => { throw new AccessError("invalid_request", 400); };
  let record: unknown;
  try { record = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)); } catch { invalid(); }
  if (!record || typeof record !== "object" || Array.isArray(record) ||
      JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(FIELDS)) invalid();
  const r = record as QueryRecord;
  if (r.v !== 1 || typeof r.record_id !== "string" || !UUID.test(r.record_id) ||
      typeof r.question !== "string" || !r.question.trim() || Array.from(r.question).length > 2000 ||
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(r.question) ||
      typeof r.created_at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.created_at) ||
      typeof r.model !== "string" || !/^[a-z0-9][a-z0-9._:/-]{0,100}$/.test(r.model) ||
      !STATUSES.has(r.status) || typeof r.duration_ms !== "number" || !Number.isInteger(r.duration_ms) ||
      r.duration_ms < 0 || r.duration_ms > 600_000) invalid();
  const created = Date.parse(r.created_at);
  if (!Number.isFinite(created) || new Date(created).toISOString() !== r.created_at ||
      created > now + 60_000 || created < now - 900_000) invalid();
  return r;
}

export async function storeQueryRecord(body: Buffer, proof: unknown) {
  if (process.env.ASK_QUERY_LOG_ENABLED !== "true") throw new AccessError("query_storage_disabled");
  if (body.byteLength > QUERY_BODY_LIMIT) throw new AccessError("input_too_large", 413);
  verifyQueryProof(body, proof);
  const r = queryRecord(body);
  const result = await redis(["EVAL", QUERY_WRITE_SCRIPT, 1, QUERY_PREFIX + r.record_id,
    r.question, r.created_at, r.model, r.status, r.duration_ms,
    Math.floor(Date.parse(r.created_at) / 1000) + QUERY_RETENTION_SECONDS]);
  if (result !== 0 && result !== 1) throw new AccessError("query_storage_unavailable");
  return { ok: true };
}
