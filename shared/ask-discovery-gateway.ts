import type { IncomingMessage } from "node:http";
import { AccessError } from "./ask-access.js";
import { discoveryCursor, discoveryRevision, fetchOpsJson, gatewayProof, OPS_UUID } from "./ask-ops-gateway.js";

function invalid(): never { throw new AccessError("invalid_request", 400); }
function parse(raw: Buffer): unknown {
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)); }
  catch { invalid(); }
}
/** Bound input independently of Vercel's octet-stream/string/JSON body representation. */
export async function discoveryRequestBody(req: IncomingMessage, limit: number): Promise<unknown> {
  const length = req.headers["content-length"];
  if (length && (typeof length !== "string" || !/^\d+$/.test(length) || Number(length) > limit))
    throw new AccessError("input_too_large", 413);
  const provided = (req as IncomingMessage & { body?: unknown }).body;
  if (provided !== undefined) {
    let raw: Buffer;
    try { raw = Buffer.isBuffer(provided) ? provided : typeof provided === "string" ? Buffer.from(provided, "utf8") : Buffer.from(JSON.stringify(provided), "utf8"); }
    catch { invalid(); }
    if (raw.length > limit) throw new AccessError("input_too_large", 413);
    return parse(raw);
  }
  const chunks: Buffer[] = [];
  let bytes = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const operation = (async () => {
    for await (const chunk of req) {
      const raw = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytes += raw.length;
      if (bytes > limit) throw new AccessError("input_too_large", 413);
      chunks.push(raw);
    }
    return parse(Buffer.concat(chunks, bytes));
  })();
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => {
      timer = setTimeout(() => { req.destroy(); reject(new AccessError("invalid_request", 400)); }, 3000);
    })]);
  } finally { clearTimeout(timer); }
}

export function discoveryReadPath(url: URL, action: string): string {
  const query = url.searchParams;
  const allowed = action === "questions" ? ["__route", "window", "sort", "limit", "cursor"] : ["__route", "public_id"];
  for (const key of query.keys()) if (!allowed.includes(key) || query.getAll(key).length !== 1) invalid();
  const out = new URLSearchParams({ action: action === "questions" ? "list" : "detail" });
  if (action === "detail") {
    const id = query.get("public_id") || "";
    if (!OPS_UUID.test(id)) invalid();
    out.set("public_id", id);
  } else if (action === "questions") {
    const window = query.get("window") ?? "this_week", sort = query.get("sort") ?? "recent", limit = query.get("limit") ?? "10";
    if (!["this_week", "7d", "all"].includes(window) || !["recent", "frequent", "liked"].includes(sort) || !/^(?:[1-9]|1[0-9]|20)$/.test(limit)) invalid();
    out.set("window", window); out.set("sort", sort); out.set("limit", limit);
    if (query.has("cursor")) {
      const cursor = query.get("cursor")!;
      if (!discoveryCursor(cursor)) invalid();
      out.set("cursor", cursor);
    }
  } else invalid();
  return `/api/discovery?${out}`;
}
export function discoveryVoteBody(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const r = value as Record<string, unknown>;
  if (Object.keys(r).sort().join() !== "expected_revision,public_id,vote" || typeof r.public_id !== "string" ||
      !OPS_UUID.test(r.public_id) || !discoveryRevision(r.expected_revision) || typeof r.vote !== "boolean") invalid();
  return { public_id: r.public_id, expected_revision: r.expected_revision, vote: r.vote };
}
export async function proxyDiscoveryVote(value: ReturnType<typeof discoveryVoteBody>, voter_key: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(voter_key)) throw new AccessError("access_unavailable");
  const raw = JSON.stringify({ ...value, voter_key });
  return fetchOpsJson("/api/discovery-vote", { method: "POST", body: raw,
    headers: { "Content-Type": "application/octet-stream", "x-ask-discovery-vote-proof": gatewayProof(raw, "ask-discovery-vote:v1") } });
}
