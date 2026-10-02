import { createHash, createHmac } from "node:crypto";
import { AccessError } from "./ask-access.js";

export const OPS_BACKEND_ORIGIN = "https://ask-lizheng-ops-yuzhengs-projects-9ae1e000.vercel.app";
export const OPS_GATEWAY_MAX_RESPONSE_BYTES = 4_400_000;
const DEADLINE_MS = 20_000;
type OpsRange = "today" | "7" | "30" | "all";
export type OpsGatewayEnvelope = {
  v: 1;
  method: "GET" | "POST";
  action: "summary" | "records" | "export" | "delete";
  params: { range?: OpsRange; cursor?: string; conversation?: string; record_id?: string };
};

function invalid(): never { throw new AccessError("invalid_request", 400); }

/** Only archive actions and their declared query parameters cross the gateway. */
export function opsGatewayEnvelope(url: URL, method: string): OpsGatewayEnvelope | null {
  const query = url.searchParams;
  const action = query.get("__route") || url.pathname.split("/").at(-1);
  if (!["session", "summary", "records", "export", "delete"].includes(action || "")) invalid();
  const expectedMethod = action === "delete" ? "POST" : "GET";
  if (method !== expectedMethod) throw new AccessError("method_not_allowed", 405);
  const allowed = new Set(["__route", "dataset"]);
  if (action === "delete") allowed.add("record_id");
  else if (action !== "session") {
    allowed.add("range");
    if (action !== "summary") allowed.add("cursor");
    if (action === "records") allowed.add("conversation");
  }
  for (const key of query.keys())
    if (!allowed.has(key) || query.getAll(key).length !== 1) invalid();
  if (query.has("dataset") && query.get("dataset") !== "archive") invalid();
  if (action === "session") return null;
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

/** Fixed signed RPC. No browser headers, cookies or identity enter this request. */
export async function proxyOps(envelope: OpsGatewayEnvelope): Promise<Record<string, unknown>> {
  const configuredOrigin = process.env.ASK_OPS_BACKEND_ORIGIN;
  const secret = process.env.ASK_OPS_GATEWAY_SECRET || "";
  if ((configuredOrigin !== undefined && configuredOrigin !== OPS_BACKEND_ORIGIN) ||
      !/^[0-9a-f]{64}$/.test(secret)) throw unavailable();
  const raw = JSON.stringify(envelope);
  const expiry = String(Math.floor(Date.now() / 1000) + 20);
  if (!/^\d{10}$/.test(expiry)) throw unavailable();
  const digest = createHash("sha256").update(raw, "utf8").digest("hex");
  const signature = createHmac("sha256", secret)
    .update(`ask-ops-gateway:v1:${expiry}:${digest}`, "utf8").digest("hex");
  const controller = new AbortController();
  const signal = AbortSignal.any([AbortSignal.timeout(DEADLINE_MS), controller.signal]);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(unavailable());
    }, DEADLINE_MS);
  });
  const operation = async () => {
    const response = await fetch(`${OPS_BACKEND_ORIGIN}/api/ops`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream", "x-ask-ops-proof": `v1.${expiry}.${signature}` },
      body: raw,
      cache: "no-store",
      redirect: "manual",
      credentials: "omit",
      signal,
    });
    if (signal.aborted) {
      void response.body?.cancel().catch(() => {});
      throw unavailable();
    }
    if (response.status !== 200 || !response.body ||
        !/^application\/json\b/i.test(response.headers.get("content-type") || "")) {
      void response.body?.cancel().catch(() => {});
      throw unavailable();
    }
    const length = response.headers.get("content-length");
    if (length && (!/^\d+$/.test(length) || Number(length) > OPS_GATEWAY_MAX_RESPONSE_BYTES)) {
      void response.body.cancel().catch(() => {});
      throw unavailable();
    }
    reader = response.body.getReader();
    let size = 0;
    const chunks: Buffer[] = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (signal.aborted) throw unavailable();
        if (done) break;
        size += value.byteLength;
        if (size > OPS_GATEWAY_MAX_RESPONSE_BYTES) throw unavailable();
        chunks.push(Buffer.from(value));
      }
      const result: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true })
        .decode(Buffer.concat(chunks, size)));
      if (!result || typeof result !== "object" || Array.isArray(result) ||
          "error" in result || "code" in result) throw unavailable();
      return result as Record<string, unknown>;
    } catch (error) {
      void reader.cancel().catch(() => {});
      throw error;
    } finally {
      reader.releaseLock();
      reader = undefined;
    }
  };
  try {
    return await Promise.race([operation(), deadline]);
  } catch {
    controller.abort();
    if (reader) void reader.cancel().catch(() => {});
    throw unavailable();
  } finally {
    clearTimeout(timer);
  }
}
