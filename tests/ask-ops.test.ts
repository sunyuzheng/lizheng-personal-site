import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
const auth = vi.hoisted(() => ({ require: vi.fn() }));
vi.mock("../shared/ask-access.js", async importOriginal => ({
  ...await importOriginal<typeof import("../shared/ask-access.js")>(), requireOpsOwner: auth.require,
}));
import { AccessError } from "../shared/ask-access";
import { OPS_READ_SCRIPT, opsRecords, opsSummary, type OpsSender } from "../shared/ask-ops-reader";
import handler from "../api/ask-lizheng-ops";

const NOW = Date.parse("2026-10-02T03:00:00.000Z");
const uuid = (n: number) => `${n.toString(16).padStart(8, "0")}-89ab-4cde-8f01-23456789abcd`;
const key = (n: number) => `ask-query:v1:${uuid(n)}`;
const row = (n: number, date = "2026-10-02T01:00:00.000Z", status = "answered", question = "synthetic 😀") =>
  [key(n), question, date, "deepseek-v4-flash", status, "1234"];
function fixture(rows: string[][], commands: (string | number)[][] = []): OpsSender {
  return async command => {
    commands.push(command);
    if (command[0] === "SCAN") return ["0", [...rows.map(r => r[0]), "ask:auth:session:synthetic", "ask-query:v2:synthetic"]];
    expect(command.slice(0, 3)).toEqual(["EVAL", OPS_READ_SCRIPT, command.length - 3]);
    return [rows.filter(r => command.slice(3).includes(r[0])), 0];
  };
}
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW); auth.require.mockResolvedValue({ email: "owner@example.test" }); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); auth.require.mockReset(); });

describe("bounded v1-only Ops read", () => {
  it("counts all six completed states, Unicode question characters, and Beijing dates without inventing visitor metrics", async () => {
    const commands: (string | number)[][] = [];
    const rows = [row(1), row(2, "2026-10-01T16:00:00.000Z", "error"), row(3, "2026-10-01T15:59:59.999Z", "cancelled")];
    const summary = await opsSummary("today", fixture(rows, commands), NOW);
    expect(summary).toMatchObject({ totals: { questions: 2, completed: 2, duration_ms: 2468,
      question_chars: 22, status: { answered: 1, error: 1, cancelled: 0 } },
      daily: [{ date: "2026-10-02", questions: 2 }], visitors: null, conversations: null, truncated: false });
    expect(summary.generated_at).toBe(new Date(NOW).toISOString());
    expect(commands).toHaveLength(2);
    expect(commands[1].slice(3)).toEqual(rows.map(r => r[0]));
    expect(OPS_READ_SCRIPT).not.toMatch(/redis\.call\('(SET|HSET|DEL|EXPIRE)/);
    const all = await opsSummary("all", fixture(["answered", "clarify", "unsupported", "sources-only", "error", "cancelled"].map((s, i) => row(i + 1, undefined, s))), NOW);
    expect(all.totals.completed).toBe(6); expect(Object.values(all.totals.status)).toEqual([1, 1, 1, 1, 1, 1]);
  });
  it("deduplicates SCAN keys, hydrates at most 100 keys per fixed Lua, and never asks for auth or v2 data", async () => {
    const rows = Array.from({ length: 205 }, (_, i) => row(i + 1));
    const commands: (string | number)[][] = [];
    const send = fixture(rows, commands);
    const read: OpsSender = async command => command[0] === "SCAN"
      ? ["0", [...rows.map(r => r[0]), key(1), "ask:auth:session:synthetic"]] : send(command);
    const result = await opsRecords("all", 100, undefined, read, NOW);
    expect(result.records).toHaveLength(100); expect(result.next_cursor).not.toBeNull();
    expect(commands).toHaveLength(3);
    expect(commands.map(c => c[2])).toEqual([100, 100, 5]);
    expect(commands.some(c => c.includes("ask:auth:session:synthetic"))).toBe(false);
  });
  it("seeks by timestamp plus ID, anchors the range, and excludes newer records on later pages", async () => {
    const first = await opsRecords("today", 2, undefined, fixture([row(1), row(2), row(3)]), NOW);
    expect(first.records.map(r => r.record_id)).toEqual([uuid(3), uuid(2)]);
    const second = await opsRecords("today", 2, first.next_cursor!, fixture([row(1), row(2), row(3), row(4, "2026-10-02T03:00:01.000Z")]), NOW + 2000);
    expect(second.records.map(r => r.record_id)).toEqual([uuid(1)]); expect(second.next_cursor).toBeNull();
    await expect(opsRecords("7", 2, first.next_cursor!, fixture([]), NOW)).rejects.toMatchObject({ status: 400 });
  });
  it("rejects malformed, future, expired, out-of-range and oversized cursors before any read", async () => {
    const send = vi.fn();
    const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
    const c = { v: 1, r: "today", a: NOW, t: "2026-10-02T01:00:00.000Z", i: uuid(1) };
    for (const cursor of ["?", "a".repeat(257), encode({ ...c, v: 2 }), encode({ ...c, a: NOW + 1 }),
      encode({ ...c, a: NOW - 31 * 86400000 }), encode({ ...c, i: "auth-key" }),
      encode({ ...c, t: "2026-10-01T15:59:59.999Z" }), encode({ ...c, t: "2026-02-30T00:00:00.000Z" }), encode({ ...c, extra: true })]) {
      await expect(opsRecords("today", 25, cursor, send, NOW)).rejects.toMatchObject({ status: 400 });
    }
    expect(send).not.toHaveBeenCalled();
    await expect(opsRecords("all", 101, undefined, send, NOW)).rejects.toMatchObject({ status: 400 });
  });
  it("excludes malformed fields and unexpected/duplicate row IDs, reporting incomplete reads", async () => {
    const bad = [row(2, "2026-02-30T00:00:00.000Z"), row(3, undefined, "not-final"), row(4, undefined, "answered", "x".repeat(2001))];
    const send: OpsSender = async command => command[0] === "SCAN" ? ["0", [key(1), ...bad.map(r => r[0]), key(5), key(6)]]
      : [[row(1), row(1), row(99), ...bad], 0];
    const result = await opsSummary("all", send, NOW);
    expect(result.totals.questions).toBe(1); expect(result.truncated).toBe(true);
  });
  it("skips TTL-expired rows omitted by the atomic read without marking a complete scan as truncated", async () => {
    const result = await opsRecords("all", 25, undefined, async c => c[0] === "SCAN" ? ["0", [key(1)]] : [[], 0], NOW);
    expect(result).toEqual({ records: [], next_cursor: null, truncated: false });
  });
  it("caps endless SCAN at 100 rounds and key accumulation at 5000, marking both truncated", async () => {
    let scans = 0;
    const endless: OpsSender = async command => command[0] === "SCAN" ? [String(++scans), []] : [[], 0];
    expect((await opsSummary("all", endless, NOW)).truncated).toBe(true); expect(scans).toBe(100);
    let batches = 0;
    const capped: OpsSender = async command => {
      if (command[0] === "SCAN") return ["0", Array.from({ length: 5001 }, (_, i) => key(i + 1))];
      batches++; expect(Number(command[2])).toBeLessThanOrEqual(100); return [[], 0];
    };
    expect((await opsRecords("all", 25, undefined, capped, NOW)).truncated).toBe(true); expect(batches).toBe(50);
  });
  it("stops a hanging read at the total 15-second budget and returns explicit partial metadata", async () => {
    const result = opsSummary("all", () => new Promise(() => {}), NOW);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await result).toMatchObject({ totals: { questions: 0 }, truncated: true });
  });
  it("sanitizes store failures and malformed responses", async () => {
    await expect(opsSummary("all", async () => { throw new Error("synthetic private data"); }, NOW)).rejects.toMatchObject({ code: "ops_read_unavailable" });
    await expect(opsSummary("all", async () => ["0", null], NOW)).rejects.toMatchObject({ code: "ops_read_unavailable" });
  });
});

async function call(path: string, method = "GET", host = "www.lizheng.ai", cookie = "synthetic-cookie", origin?: string) {
  const result = { statusCode: 0, headers: {} as Record<string, unknown>, body: "",
    setHeader(name: string, value: unknown) { this.headers[name] = value; }, end(value: string) { this.body = value; } };
  await handler({ url: path, method, headers: { host, cookie, origin } } as unknown as IncomingMessage, result as unknown as ServerResponse);
  return { status: result.statusCode, headers: result.headers, value: JSON.parse(result.body) };
}
function mockedRedis() {
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic.upstash.io"); vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-not-live");
  const fetcher = vi.fn(async (_: unknown, init?: RequestInit) => {
    const c = JSON.parse(String(init?.body));
    return Response.json({ result: c[0] === "SCAN" ? ["0", []] : [[], 0] });
  }); vi.stubGlobal("fetch", fetcher); return fetcher;
}
describe("private Node Ops endpoint", () => {
  it.each([401, 403])("does no record read when owner authentication rejects %s", async status => {
    const fetcher = mockedRedis(); auth.require.mockRejectedValue(new AccessError("ops_forbidden", status));
    expect(await call("/api/ask-lizheng/ops/records")).toMatchObject({ status, value: { code: "ops_forbidden" } });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("returns owner session metadata without querying Builder or the question store", async () => {
    const fetcher = mockedRedis();
    expect(await call("/api/ask-lizheng-ops?__route=session")).toMatchObject({ status: 200,
      value: { owner: true, email: "owner@example.test", retention_days: 30 },
      headers: { "Cache-Control": "no-store, no-transform", "Vary": "Cookie", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
    expect(fetcher).not.toHaveBeenCalled();
    expect(auth.require.mock.calls[0][0].headers.get("Cookie")).toBe("synthetic-cookie");
  });
  it("restricts reads to www/GET and rejects missing delete method", async () => {
    const fetcher = mockedRedis();
    expect((await call("/api/ask-lizheng/ops/records", "POST")).status).toBe(405);
    expect((await call("/api/ask-lizheng/ops/records", "GET", "ask.lizheng.ai")).status).toBe(403);
    expect((await call("https://attacker.example/records")).status).toBe(403);
    expect((await call("/api/ask-lizheng/ops/records", "GET", "www.lizheng.ai", "", "https://attacker.example")).status).toBe(403);
    expect((await call("/api/ask-lizheng/ops/delete")).status).toBe(405); expect(fetcher).not.toHaveBeenCalled();
  });
  it("supports rewrite and public path actions with strict range/cursor handling", async () => {
    const fetcher = mockedRedis();
    expect((await call("/api/ask-lizheng-ops?__route=summary&range=today")).value.totals.questions).toBe(0);
    expect((await call("/api/ask-lizheng/ops/export?range=all")).value).toEqual({ records: [], next_cursor: null, truncated: false });
    const count = fetcher.mock.calls.length;
    expect((await call("/api/ask-lizheng/ops/records?range=forever")).status).toBe(400);
    expect((await call("/api/ask-lizheng/ops/records?cursor=%3F")).status).toBe(400);
    expect(fetcher).toHaveBeenCalledTimes(count);
  });
  it("does not expose arbitrary exception bodies", async () => {
    auth.require.mockRejectedValue(new Error("synthetic sensitive failure"));
    expect(await call("/api/ask-lizheng/ops/session")).toMatchObject({ status: 503, value: { code: "ops_read_unavailable" } });
  });
});
