import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash, createHmac } from "node:crypto";
import { quotaCommand, runQuotaCommand, verifyQuotaStorageProof } from "../shared/ask-quota-storage";
import { QUOTA_SCRIPT } from "../shared/ask-quota-script";

const NOW = 1790870400;
const SECRET = "a".repeat(64);
const ATTEMPT = "01234567-89ab-4cde-8f01-23456789abcd";
const GRANT = "11234567-89ab-4cde-8f01-23456789abcd";
const day = new Date((NOW + 8 * 3600) * 1000).toISOString().slice(0, 10);
const reset = Date.parse(`${day}T00:00:00+08:00`) / 1000 + 86400;
const prefix = `ask-quota:v1:{${"b".repeat(64)}}:`;
const command = () => ["EVAL", QUOTA_SCRIPT, 3, `${prefix}${day}:used`, `${prefix}${day}:pending`,
  `${prefix}attempt:${ATTEMPT}`, "reserve", NOW, 3, ATTEMPT, GRANT, day, reset, 150, 172800];
const body = () => Buffer.from(JSON.stringify(command()));
function proof(value: Buffer, expiry = NOW + 45, secret = SECRET) {
  const hash = createHash("sha256").update(value).digest("hex");
  const signature = createHmac("sha256", secret).update(`ask-quota-store:v1:${expiry}:${hash}`).digest("hex");
  return `v1.${expiry}.${signature}`;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW * 1000);
  process.env.ASK_QUOTA_STORE_SECRET = SECRET;
  process.env.ASK_AUTH_REDIS_REST_URL = "https://synthetic.upstash.io";
  process.env.ASK_AUTH_REDIS_REST_TOKEN = "synthetic-store-token";
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Builder quota storage boundary", () => {
  it("accepts exact bytes and stores the fixed operation", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: ["OK", 0, 1] })));
    vi.stubGlobal("fetch", fetcher);
    expect(await runQuotaCommand(body(), proof(body()))).toEqual(["OK", 0, 1]);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(command());
  });
  it.each(["EXHAUSTED", "DUPLICATE", "EXPIRED"])("preserves authoritative %s results", async code => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: [code, 2, 1] }))));
    expect(await runQuotaCommand(body(), proof(body()))).toEqual([code, 2, 1]);
  });
  it("rejects altered body, wrong purpose/key, expired and overlong expiry proofs before storage", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    for (const candidate of [proof(Buffer.from("tampered")), proof(body(), NOW), proof(body(), NOW + 61),
      proof(body(), NOW + 45, "b".repeat(64)), "v1.1.invalid", undefined]) {
      await expect(runQuotaCommand(body(), candidate)).rejects.toMatchObject({ code: "invalid_admission", status: 403 });
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("fails closed without the server proof secret", () => {
    delete process.env.ASK_QUOTA_STORE_SECRET;
    expect(() => verifyQuotaStorageProof(body(), proof(body()))).toThrow("quota_unavailable");
  });
  it("rejects generic commands, arbitrary scripts and keys even with a valid caller signature", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const mutations: unknown[][] = [["PING"], ["GET", "ask:auth:session:private"]];
    for (const [index, value] of [[0, "GET"], [1, "return redis.call('GET',KEYS[1])"], [2, 2],
      [3, "ask:auth:session:private"], [4, `${prefix}${day}:used`], [5, `${prefix}attempt:other`],
      [6, "DEL"], [7, NOW - 61], [8, 10], [9, "not-a-uuid"], [10, ""], [11, "2026-02-30"],
      [12, reset + 3600], [13, 9999], [14, 9999999]] as const) {
      const c = command(); c[index] = value; mutations.push(c);
    }
    for (const c of mutations) {
      const data = Buffer.from(JSON.stringify(c));
      await expect(runQuotaCommand(data, proof(data))).rejects.toMatchObject({ code: "invalid_request", status: 400 });
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("allows unlimited and status metadata, and overnight completion with its original day", () => {
    const c = command(); c[8] = 0;
    expect(quotaCommand(Buffer.from(JSON.stringify(c)))[8]).toBe(0);
    c[6] = "status"; c[10] = "";
    expect(quotaCommand(Buffer.from(JSON.stringify(c)))[6]).toBe("status");
    c[6] = "commit"; c[10] = GRANT; c[7] = reset + 10;
    expect(quotaCommand(Buffer.from(JSON.stringify(c)), reset + 10)[11]).toBe(day);
    c[6] = "reserve";
    expect(() => quotaCommand(Buffer.from(JSON.stringify(c)), reset + 10)).toThrow("invalid_request");
  });
  it("keeps the original reserve/status day for a signed retry across midnight", () => {
    const c = command(); c[7] = reset - 1;
    expect(quotaCommand(Buffer.from(JSON.stringify(c)), reset + 1)[11]).toBe(day);
    c[6] = "status"; c[10] = "";
    expect(quotaCommand(Buffer.from(JSON.stringify(c)), reset + 1)[11]).toBe(day);
  });
  it("rejects malformed UTF8/JSON, oversized bodies and malformed store replies", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: ["OK", -1, 0] })));
    vi.stubGlobal("fetch", fetcher);
    expect(() => quotaCommand(Buffer.from([0xff]))).toThrow("invalid_request");
    expect(() => quotaCommand(Buffer.from("{}"))).toThrow("invalid_request");
    await expect(runQuotaCommand(Buffer.alloc(16385), undefined)).rejects.toMatchObject({ status: 413 });
    await expect(runQuotaCommand(body(), proof(body()))).rejects.toMatchObject({ code: "quota_unavailable" });
  });
});
