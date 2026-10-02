import { createHash, createHmac } from "node:crypto";
import { AccessError } from "./ask-access.js";
import { archivedAnswer, type ArchivedAnswer } from "./ask-archive-answer.js";

export const OPS_BACKEND_ORIGIN = "https://ask-lizheng-ops-yuzhengs-projects-9ae1e000.vercel.app";
export const OPS_GATEWAY_MAX_RESPONSE_BYTES = 4_400_000;
const DEADLINE_MS = 20_000;
type OpsRange = "today" | "7" | "30" | "all";
export const OPS_GATEWAY_BODY_LIMIT = 262_144;
export const OPS_UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export type DiscoverySaveParams = {
  public_id?: string; expected_revision?: number; record_id: string; topic_key?: string;
  topic_label: string; question: string; answer: ArchivedAnswer;
  consent_reference: string; consent_confirmed: boolean; review_confirmed: boolean;
};
export type OpsGatewayEnvelope = {
  v: 1; method: "GET" | "POST";
  action: "summary" | "records" | "export" | "delete" | "discovery-list" | "discovery-save" | "discovery-publish" | "discovery-withdraw";
  params: {
    range?: OpsRange; cursor?: string; conversation?: string; record_id?: string;
    public_id?: string; expected_revision?: number; topic_key?: string; topic_label?: string;
    question?: string; answer?: ArchivedAnswer; consent_reference?: string; consent_confirmed?: boolean; review_confirmed?: boolean;
  };
};
export const OPS_POST_ACTIONS = new Set(["delete", "discovery-save", "discovery-publish", "discovery-withdraw"]);
export function opsGatewayAction(url: URL) {
  return url.searchParams.get("__route") || url.pathname.split("/").at(-1) || "";
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, nonblank = true): value is string {
  return typeof value === "string" && Array.from(value).length <= max && (!nonblank || !!value.trim()) &&
    !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(value);
}
export function discoveryRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
export function discoveryCursor(value: string) { return !!value && value.length <= 512 && /^[A-Za-z0-9_-]+$/.test(value); }

function invalid(): never { throw new AccessError("invalid_request", 400); }

/** Only archive actions and their declared query parameters cross the gateway. */
export function opsGatewayEnvelope(url: URL, method: string, body?: unknown): OpsGatewayEnvelope | null {
  const query = url.searchParams;
  const action = opsGatewayAction(url);
  if (!["session", "summary", "records", "export", "delete", "discovery-list", "discovery-save", "discovery-publish", "discovery-withdraw"].includes(action)) invalid();
  const expectedMethod = OPS_POST_ACTIONS.has(action) ? "POST" : "GET";
  if (method !== expectedMethod) throw new AccessError("method_not_allowed", 405);
  const allowed = new Set(["__route", "dataset"]);
  if (action === "discovery-list") allowed.add("cursor");
  else if (action.startsWith("discovery-")) { /* Mutation parameters come only from the bounded body. */ }
  else if (action === "delete") allowed.add("record_id");
  else if (action !== "session") {
    allowed.add("range");
    if (action !== "summary") allowed.add("cursor");
    if (action === "records") allowed.add("conversation");
  }
  for (const key of query.keys())
    if (!allowed.has(key) || query.getAll(key).length !== 1) invalid();
  if (query.has("dataset") && query.get("dataset") !== "archive") invalid();
  if (action === "session") return null;
  if (action === "discovery-list") {
    const cursor = query.get("cursor");
    if (cursor !== null && !discoveryCursor(cursor)) invalid();
    return { v: 1, method: "GET", action, params: cursor === null ? {} : { cursor } };
  }
  if (action.startsWith("discovery-")) {
    const r = object(body);
    if (action === "discovery-save") {
      const required = ["record_id", "topic_label", "question", "answer", "consent_reference", "consent_confirmed", "review_confirmed"];
      if (required.some(k => !(k in r)) || Object.keys(r).some(k => ![...required, "public_id", "expected_revision", "topic_key"].includes(k)) ||
          typeof r.record_id !== "string" || !OPS_UUID.test(r.record_id) || !text(r.topic_label, 80) || !text(r.question, 300) ||
          !text(r.consent_reference, 500, false) || typeof r.consent_confirmed !== "boolean" || typeof r.review_confirmed !== "boolean" ||
          (("public_id" in r) !== ("expected_revision" in r)) ||
          ("public_id" in r && (typeof r.public_id !== "string" || !OPS_UUID.test(r.public_id) || !discoveryRevision(r.expected_revision))) ||
          ("topic_key" in r && (typeof r.topic_key !== "string" || !/^[a-f0-9]{32}$/.test(r.topic_key)))) invalid();
      archivedAnswer(r.answer);
      return { v: 1, method: "POST", action, params: r as DiscoverySaveParams };
    }
    if (Object.keys(r).sort().join() !== "expected_revision,public_id" ||
        typeof r.public_id !== "string" || !OPS_UUID.test(r.public_id) || !discoveryRevision(r.expected_revision)) invalid();
    return { v: 1, method: "POST", action: action as "discovery-publish" | "discovery-withdraw", params: { public_id: r.public_id, expected_revision: r.expected_revision } };
  }
  if (action === "delete") {
    const record_id = query.get("record_id") || "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(record_id)) invalid();
    return { v: 1, method: "POST", action, params: { record_id } };
  }
  const range = query.get("range") ?? "7";
  if (!["today", "7", "30", "all"].includes(range)) invalid();
  const params: OpsGatewayEnvelope["params"] = { range: range as OpsRange };
  if (query.has("cursor")) {
    const cursor = query.get("cursor")!;
    if (!cursor || cursor.length > 256 || !/^\d{1,16}:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(cursor)) invalid();
    params.cursor = cursor;
  }
  if (query.has("conversation")) {
    const conversation = query.get("conversation")!;
    if (!/^[0-9a-f]{64}$/.test(conversation)) invalid();
    params.conversation = conversation;
  }
  return { v: 1, method: "GET", action: action as "summary" | "records" | "export", params };
}

function unavailable(): AccessError { return new AccessError("ops_gateway_unavailable"); }
const SAFE_ERRORS: Record<string, number> = {
  invalid_request: 400, discovery_not_found: 404, source_unavailable: 422, source_not_public_eligible: 422, revision_conflict: 409,
  publication_requires_review: 422, publication_requires_consent: 422, publication_requires_source: 422, public_item_unavailable: 404,
  discovery_capacity: 422, discovery_cursor_expired: 409, vote_rate_limited: 429,
};
function safeFailure(value: unknown): value is AccessError {
  return value instanceof AccessError && SAFE_ERRORS[value.code] === value.status;
}
function configuredOrigin() {
  if (process.env.ASK_OPS_BACKEND_ORIGIN !== undefined && process.env.ASK_OPS_BACKEND_ORIGIN !== OPS_BACKEND_ORIGIN) throw unavailable();
}
export function gatewayProof(raw: string, domain: "ask-ops-gateway:v1" | "ask-discovery-vote:v1" = "ask-ops-gateway:v1") {
  configuredOrigin();
  const secret = process.env.ASK_OPS_GATEWAY_SECRET || "";
  if (!/^[a-f0-9]{64}$/.test(secret)) throw unavailable();
  const expiry = String(Math.floor(Date.now() / 1000) + 20);
  if (!/^\d{10}$/.test(expiry)) throw unavailable();
  const digest = createHash("sha256").update(raw, "utf8").digest("hex");
  const signature = createHmac("sha256", secret).update(`${domain}:${expiry}:${digest}`, "utf8").digest("hex");
  return `v1.${expiry}.${signature}`;
}
/** Server-fixed endpoints only; no caller-supplied headers or identity are inherited. */
export async function fetchOpsJson(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  configuredOrigin();
  const destination = new URL(path, OPS_BACKEND_ORIGIN);
  if (destination.origin !== OPS_BACKEND_ORIGIN || !["/api/ops", "/api/discovery", "/api/discovery-vote"].includes(destination.pathname) ||
      destination.username || destination.password || destination.hash) throw unavailable();
  const controller = new AbortController();
  const signal = AbortSignal.any([AbortSignal.timeout(DEADLINE_MS), controller.signal]);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let errorTimer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(unavailable()); }, DEADLINE_MS);
  });
  const operation = async () => {
    const response = await fetch(destination.href, { ...options, cache: "no-store", redirect: "manual", credentials: "omit", signal });
    const possibleSafeError = [400, 404, 409, 422, 429].includes(response.status);
    if (signal.aborted || (!possibleSafeError && response.status !== 200) || !response.body ||
        !/^application\/json\b/i.test(response.headers.get("content-type") || "")) {
      void response.body?.cancel().catch(() => {});
      throw unavailable();
    }
    const limit = possibleSafeError ? 4096 : OPS_GATEWAY_MAX_RESPONSE_BYTES;
    const length = response.headers.get("content-length");
    if (length && (!/^\d+$/.test(length) || Number(length) > limit)) {
      void response.body.cancel().catch(() => {});
      throw unavailable();
    }
    reader = response.body.getReader();
    const drain = async () => {
      let size = 0;
      const chunks: Buffer[] = [];
      while (true) {
        const { done, value } = await reader!.read();
        if (signal.aborted) throw unavailable();
        if (done) break;
        size += value.byteLength;
        if (size > limit) throw unavailable();
        chunks.push(Buffer.from(value));
      }
      return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, size))) as unknown;
    };
    try {
      const result = possibleSafeError
        ? await Promise.race([drain(), new Promise<never>((_, reject) => { errorTimer = setTimeout(() => reject(unavailable()), 1000); })])
        : await drain();
      if (!result || typeof result !== "object" || Array.isArray(result)) throw unavailable();
      if (possibleSafeError) {
        const code = (result as { code?: unknown }).code;
        if (typeof code === "string" && SAFE_ERRORS[code] === response.status) throw new AccessError(code, response.status);
        throw unavailable();
      }
      if ("error" in result || "code" in result || Buffer.byteLength(JSON.stringify(result), "utf8") > OPS_GATEWAY_MAX_RESPONSE_BYTES) throw unavailable();
      return result as Record<string, unknown>;
    } catch (error) {
      void reader.cancel().catch(() => {});
      throw error;
    } finally {
      clearTimeout(errorTimer);
      reader.releaseLock();
      reader = undefined;
    }
  };
  try { return await Promise.race([operation(), deadline]); }
  catch (error) {
    controller.abort();
    if (reader) void reader.cancel().catch(() => {});
    if (safeFailure(error)) throw error;
    throw unavailable();
  } finally { clearTimeout(timer); clearTimeout(errorTimer); }
}
/** Fixed signed RPC. No browser headers, cookies or identity enter this request. */
export async function proxyOps(envelope: OpsGatewayEnvelope): Promise<Record<string, unknown>> {
  const raw = JSON.stringify(envelope);
  if (Buffer.byteLength(raw, "utf8") > OPS_GATEWAY_BODY_LIMIT) throw new AccessError("input_too_large", 413);
  return fetchOpsJson("/api/ops", {
    method: "POST", headers: { "Content-Type": "application/octet-stream", "x-ask-ops-proof": gatewayProof(raw) }, body: raw,
  });
}
