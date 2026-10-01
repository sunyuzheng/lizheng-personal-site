/** Owner CLI only: never imported by a public endpoint. */
import { AccessError, redis } from "./ask-access.js";
import { QUERY_PREFIX } from "./ask-query-storage.js";

type Sender = (command: (string | number)[]) => Promise<unknown>;
const KEY = /^ask-query:v1:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const METADATA = ["created_at", "model", "status", "duration_ms"];

export async function readQueryRecords(limit = 20, includeQuestion = false, send: Sender = redis) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new AccessError("invalid_request", 400);
  const keys = new Set<string>();
  let cursor = "0", scans = 0, truncated = false;
  do {
    const page = await send(["SCAN", cursor, "MATCH", QUERY_PREFIX + "*", "COUNT", 100]);
    if (!Array.isArray(page) || page.length !== 2 || typeof page[0] !== "string" || !/^\d+$/.test(page[0]) ||
        !Array.isArray(page[1]) || page[1].some(key => typeof key !== "string")) throw new AccessError("query_read_failed");
    cursor = page[0];
    for (const key of page[1]) if (KEY.test(key)) keys.add(key);
    if (++scans >= 100 || keys.size >= 1000) { truncated = cursor !== "0" || keys.size > 1000; break; }
  } while (cursor !== "0");
  const fields = includeQuestion ? [...METADATA, "question"] : METADATA;
  const selected = [...keys].slice(0, 1000), records: Record<string, string | number>[] = [];
  for (let offset = 0; offset < selected.length; offset += 8) {
    const batch = await Promise.all(selected.slice(offset, offset + 8).map(async key => {
      const row = await send(["HMGET", key, ...fields]);
      if (!Array.isArray(row) || row.length !== fields.length || row.some(value => value !== null && typeof value !== "string"))
        throw new AccessError("query_read_failed");
      if (row.some(value => value === null)) return null; // TTL can expire between SCAN and HMGET.
      const record: Record<string, string | number> = { record_id: key.slice(QUERY_PREFIX.length) };
      fields.forEach((field, index) => { record[field] = field === "duration_ms" ? Number(row[index]) : row[index]; });
      return record;
    }));
    records.push(...batch.filter(record => record !== null));
  }
  records.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return { records: records.slice(0, limit), truncated, question_included: includeQuestion };
}
