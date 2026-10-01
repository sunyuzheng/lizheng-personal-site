import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash, createHmac } from "node:crypto";
import { queryRecord, storeQueryRecord, verifyQueryProof, QUERY_WRITE_SCRIPT, QUERY_RETENTION_SECONDS } from "../shared/ask-query-storage";
import { readQueryRecords } from "../shared/ask-query-reader";
import handler from "../api/ask-lizheng-query";
import type { IncomingMessage, ServerResponse } from "node:http";

const NOW = 1790870400000, SECRET = "a".repeat(64);
const ID = "01234567-89ab-4cde-8f01-23456789abcd";
const row = () => ({ v: 1, record_id: ID, question: "synthetic submitted question", created_at: new Date(NOW).toISOString(),
  model: "deepseek-v4-flash", status: "answered", duration_ms: 1234 });
const body = () => Buffer.from(JSON.stringify(row()));
function proof(value: Buffer, expiry = NOW / 1000 + 45, prefix = "ask-query-store") {
  const hash = createHash("sha256").update(value).digest("hex");
  return `v1.${expiry}.${createHmac("sha256", SECRET).update(`${prefix}:v1:${expiry}:${hash}`).digest("hex")}`;
}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(NOW);
  vi.stubEnv("ASK_QUERY_LOG_ENABLED", "true"); vi.stubEnv("ASK_QUOTA_STORE_SECRET", SECRET);
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-not-live");
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("fixed submitted-question write boundary", () => {
  it("writes only authorized fields to a fixed namespace with 30-day absolute expiry", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: 1 }))); vi.stubGlobal("fetch", fetcher);
    expect(await storeQueryRecord(body(), proof(body()))).toEqual({ ok: true });
    const command = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(command).toEqual(["EVAL", QUERY_WRITE_SCRIPT, 1, `ask-query:v1:${ID}`, row().question,
      row().created_at, row().model, row().status, 1234, NOW / 1000 + QUERY_RETENTION_SECONDS]);
    expect(QUERY_RETENTION_SECONDS).toBe(2592000);
    expect(QUERY_WRITE_SCRIPT).toContain("EXPIREAT");
    expect(QUERY_WRITE_SCRIPT.indexOf("EXISTS")).toBeLessThan(QUERY_WRITE_SCRIPT.indexOf("HSET"));
    expect(fetcher.mock.calls[0][1].redirect).toBe("manual");
  });
  it("accepts the already-written result without rewriting expiration", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: 0 }))));
    expect(await storeQueryRecord(body(), proof(body()))).toEqual({ ok: true });
  });
  it("defaults off and fails closed without the key, before storage", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("ASK_QUERY_LOG_ENABLED", "false");
    await expect(storeQueryRecord(body(), proof(body()))).rejects.toMatchObject({ code: "query_storage_disabled" });
    vi.stubEnv("ASK_QUERY_LOG_ENABLED", "true"); vi.stubEnv("ASK_QUOTA_STORE_SECRET", "");
    await expect(storeQueryRecord(body(), proof(body()))).rejects.toMatchObject({ code: "query_storage_unavailable" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects forged, changed, expired, long-lived and quota-prefix proofs", () => {
    for (const signature of [undefined, "v1.1.invalid", proof(Buffer.from("tampered")), proof(body(), NOW / 1000),
      proof(body(), NOW / 1000 + 61), proof(body(), NOW / 1000 + 45, "ask-quota-store")]) {
      expect(() => verifyQueryProof(body(), signature)).toThrow("invalid_admission");
    }
  });
  it.each(["context", "history", "email", "subject", "ip", "command"])("rejects unapproved %s even with a valid signature", async field => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const data = Buffer.from(JSON.stringify({ ...row(), [field]: "synthetic private value" }));
    await expect(storeQueryRecord(data, proof(data))).rejects.toMatchObject({ code: "invalid_request" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("bounds schema, UTF8, dates, duration and question length", async () => {
    for (const mutation of [{ record_id: "arbitrary-redis-key" }, { status: "arbitrary" }, { model: "private model value" },
      { created_at: "2026-02-30T00:00:00.000Z" }, { duration_ms: -1 }, { duration_ms: 1.5 },
      { duration_ms: 600001 }, { question: " " }, { question: "a".repeat(2001) }, { question: "\ud800" }]) {
      expect(() => queryRecord(Buffer.from(JSON.stringify({ ...row(), ...mutation })))).toThrow("invalid_request");
    }
    expect(queryRecord(Buffer.from(JSON.stringify({ ...row(), question: "😀".repeat(2000) })))).toMatchObject({ status: "answered" });
    expect(() => queryRecord(Buffer.from([0xff]))).toThrow("invalid_request");
    await expect(storeQueryRecord(Buffer.alloc(16385), undefined)).rejects.toMatchObject({ status: 413 });
  });
  it("sanitizes redirects and upstream errors", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("synthetic-private-error", { status: 307, headers: { Location: "https://elsewhere.example" } }));
    vi.stubGlobal("fetch", fetcher);
    await expect(storeQueryRecord(body(), proof(body()))).rejects.toMatchObject({ code: "access_unavailable" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("Node handler restores exact raw bytes, rejects object parsing and has no public read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: 1 }))));
    async function request(payload: unknown, method = "POST") {
      let output = ""; const headers: Record<string, string> = {};
      const res = { statusCode: 0, setHeader: (key: string, value: string) => { headers[key] = value; }, end: (value: string) => { output = value; } };
      await handler({ method, headers: { host: "www.lizheng.ai", "content-type": "application/octet-stream", "x-ask-query-proof": proof(body()) }, body: payload } as unknown as IncomingMessage, res as unknown as ServerResponse);
      return { status: res.statusCode, value: JSON.parse(output), headers };
    }
    expect(await request(body().toString())).toMatchObject({ status: 200, value: { ok: true }, headers: { "Cache-Control": "no-store, no-transform" } });
    expect(await request({ question: "parsed" })).toMatchObject({ status: 400, value: { code: "invalid_request" } });
    expect(await request(body(), "GET")).toMatchObject({ status: 405 });
    expect(await request(Buffer.alloc(16385))).toMatchObject({ status: 413 });
  });
});

describe("owner-only local reader", () => {
  it.each([false, true])("only reads question with explicit includeQuestion=%s", async includeQuestion => {
    const commands: (string | number)[][] = [];
    const send = async (command: (string | number)[]) => {
      commands.push(command);
      if (command[0] === "SCAN") return ["0", [`ask-query:v1:${ID}`, "ask:auth:session:private"]];
      return [row().created_at, row().model, row().status, "1234", ...(includeQuestion ? ["synthetic question"] : [])];
    };
    const result = await readQueryRecords(20, includeQuestion, send);
    expect(result.records).toHaveLength(1);
    expect(commands[1]).toEqual(["HMGET", `ask-query:v1:${ID}`, "created_at", "model", "status", "duration_ms", ...(includeQuestion ? ["question"] : [])]);
    expect("question" in result.records[0]).toBe(includeQuestion);
    expect(commands.some(command => command.includes("ask:auth:session:private"))).toBe(false);
  });
  it("skips records that expired between scan and read", async () => {
    const result = await readQueryRecords(20, false, async command => command[0] === "SCAN" ? ["0", [`ask-query:v1:${ID}`]] : [null, null, null, null]);
    expect(result.records).toEqual([]);
  });
});
