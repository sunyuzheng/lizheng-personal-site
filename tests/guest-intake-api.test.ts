import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID, webcrypto } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import handler from "../api/guest-intake.js";
import { createSession, decryptRecord, encryptRecord, opaqueSubject, requireOpsOwner } from "../shared/ask-access.js";
import { INTAKE_CREATE_SCRIPT, INTAKE_NETWORK_LIMIT, INTAKE_PREFIX, INTAKE_UPDATE_SCRIPT, openIntake, sealIntake } from "../shared/guest-intake-storage.js";
import type { IntakeRecord } from "../shared/guest-intake.js";

const origin = "https://www.lizheng.ai";
const strings = new Map<string, string>(), expiries = new Map<string, number>(), index = new Set<string>();
const commands: (string | number)[][] = [];
let conflict: ((record: IntakeRecord) => IntakeRecord) | undefined;
const answer = (submissionKey = randomUUID()) => ({ name: "合成验证用户", contactMethod: "email", contact: "synthetic@example.test", industry: "测试行业", work: "合成接口测试内容",
  topics: ["测试主题"], membership: "stay", consent: true, submissionKey });
function execute(args: (string | number)[]): unknown {
  commands.push(args);
  const [command] = args;
  if (command === "SET") { strings.set(String(args[1]), String(args[2])); if (args[3] === "EX") expiries.set(String(args[1]), Number(args[4])); return "OK"; }
  if (command === "GET") return strings.get(String(args[1])) ?? null;
  if (command === "MGET") return args.slice(1).map(key => strings.get(String(key)) ?? null);
  if (command === "ZREVRANGEBYLEX") {
    const max = String(args[2]);
    return [...index].sort().reverse().filter(member => max === "+" || member < max.slice(1)).slice(Number(args[5]), Number(args[5]) + Number(args[6]));
  }
  if (command === "EVAL" && args[1] === INTAKE_CREATE_SCRIPT) {
    const [submission, record, , network] = args.slice(3, 7).map(String);
    const [id, sealed, member, , limit, ttl] = args.slice(7);
    if (strings.has(submission)) return ["existing", strings.get(submission)];
    if (strings.has(record)) return ["collision"];
    const used = Number(strings.get(network) ?? 0);
    if (used >= Number(limit)) return ["limited"];
    strings.set(network, String(used + 1)); if (!used) expiries.set(network, Number(ttl));
    strings.set(record, String(sealed)); strings.set(submission, String(id)); index.add(String(member));
    return ["created", id];
  }
  if (command === "EVAL" && args[1] === INTAKE_UPDATE_SCRIPT) {
    const key = String(args[3]), current = strings.get(key);
    if (!current) return -1;
    if (conflict) {
      const modify = conflict; conflict = undefined;
      const id = key.slice(-36); strings.set(key, sealIntake(modify(openIntake(current, id))));
    }
    if (strings.get(key) !== args[4]) return 0;
    strings.set(key, String(args[5])); return 1;
  }
  throw new Error("Unexpected mocked Redis command");
}
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto); strings.clear(); expiries.clear(); index.clear(); commands.length = 0; conflict = undefined;
  for (const [key, value] of Object.entries({ ASK_AUTH_SECRET: "test-only-auth-secret-at-least-32-bytes", GUEST_INTAKE_ENCRYPTION_KEY: "test-only-guest-intake-encryption-at-least-32-bytes",
    ASK_AUTH_REDIS_REST_URL: "https://guest-test.upstash.io", ASK_AUTH_REDIS_REST_TOKEN: "synthetic-redis-token", GUEST_INTAKE_ADMIN_EMAILS: "admin@example.test",
    ASK_OPS_ENABLED: "true", ASK_QUOTA_ENABLED: "true", ASK_OPS_ADMIN_EMAILS: "ask-owner@example.test", ASK_AUTH_TEST_ORIGIN: "" })) vi.stubEnv(key, value);
  vi.stubGlobal("fetch", vi.fn(async (url, init) => {
    if (String(url) !== "https://guest-test.upstash.io/") throw new Error("External services are forbidden in guest intake tests");
    return Response.json({ result: execute(JSON.parse(String(init?.body))) });
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
async function call(action: string, options: { method?: string; body?: unknown; cookie?: string; headers?: Record<string, unknown> } = {}) {
  const result = { statusCode: 200, headers: new Map<string, unknown>(), body: "", setHeader(name: string, value: unknown) { this.headers.set(name.toLowerCase(), value); }, end(value = "") { this.body = value; } };
  const method = options.method ?? (action.startsWith("submit") ? "POST" : action.startsWith("update") ? "PATCH" : "GET");
  await handler({ url: `/api/guest-intake?__route=${action}`, method, body: options.body,
    headers: { host: "www.lizheng.ai", origin, cookie: options.cookie, "content-type": "application/json", "x-vercel-forwarded-for": "192.0.2.1", ...options.headers },
  } as unknown as IncomingMessage, result as unknown as ServerResponse);
  return { status: result.statusCode, headers: Object.fromEntries(result.headers), text: result.body, value: () => JSON.parse(result.body) };
}
async function adminCookie(email = "admin@example.test", founding = false) {
  return (await createSession(await opaqueSubject("user", `synthetic:${email}`), email, founding)).split(";")[0];
}
describe("independent guest intake administration", () => {
  it("fails closed without a valid allowlist before session Redis access", async () => {
    for (const value of ["", "not-an-email", "admin@example.test,invalid"]) {
      vi.stubEnv("GUEST_INTAKE_ADMIN_EMAILS", value);
      expect((await call("list")).status).toBe(503);
    }
    expect(commands).toHaveLength(0);
  });
  it("denies missing/forged sessions and Founding or Ask ops ownership alone", async () => {
    for (const action of ["list", "session", "export", `update&id=${randomUUID()}`]) expect((await call(action, { body: { status: "contacted" } })).status).toBe(401);
    expect((await call("session", { headers: { "x-email": "admin@example.test", "oai-authenticated-user-email": "admin@example.test" } })).status).toBe(401);
    const cookie = await adminCookie("ask-owner@example.test", true);
    expect((await call("list", { cookie })).status).toBe(403);
    const request = new Request(`${origin}/api/ask-lizheng/ops/session`, { headers: { cookie } });
    expect(await requireOpsOwner(request)).toEqual({ email: "ask-owner@example.test" });
  });
  it("authorizes only its own allowlist and never refreshes Circle or grants Ask ops access", async () => {
    const cookie = await adminCookie();
    const [key, sealed] = [...strings].find(([key]) => key.startsWith("ask:auth:session:"))!;
    const session = await decryptRecord(sealed) as Record<string, unknown>;
    strings.set(key, await encryptRecord({ ...session, checkedAt: 0 }));
    vi.stubEnv("GUEST_INTAKE_ADMIN_EMAILS", " OTHER@EXAMPLE.TEST, ADMIN@EXAMPLE.TEST ");
    expect((await call("session", { cookie })).value()).toEqual({ admin: true, email: "admin@example.test" });
    await expect(requireOpsOwner(new Request(`${origin}/api/ask-lizheng/ops/session`, { headers: { cookie } }))).rejects.toMatchObject({ status: 403 });
    expect(vi.mocked(fetch).mock.calls.every(([url]) => String(url).includes("upstash.io"))).toBe(true);
  });
});
describe("guest intake endpoint and atomic storage", () => {
  it("saves once under concurrent retries, encrypted and without durable TTLs or raw networks", async () => {
    const payload = answer();
    const results = await Promise.all([call("submit", { body: payload }), call("submit", { body: { ...payload, name: "Retry must not overwrite" } })]);
    expect(results.map(result => result.status).sort()).toEqual([200, 201]);
    expect(results[0].value().id).toBe(results[1].value().id); expect(index.size).toBe(1);
    const id = results[0].value().id, sealed = strings.get(`${INTAKE_PREFIX}record:${id}`)!;
    expect(openIntake(sealed, id).name).toBe(payload.name);
    expect(JSON.stringify([...strings])).not.toContain(payload.contact); expect(JSON.stringify([...strings])).not.toContain("192.0.2.1");
    expect([...expiries.keys()].every(key => key.startsWith(`${INTAKE_PREFIX}rate:`))).toBe(true);
    expect([...strings.keys()].filter(key => key.startsWith(INTAKE_PREFIX))).toHaveLength(3);
  });
  it("limits only new submissions by an expiring purpose-bound network digest", async () => {
    const payload = answer();
    expect((await call("submit", { body: payload })).status).toBe(201);
    for (let i = 1; i < INTAKE_NETWORK_LIMIT; i++) expect((await call("submit", { body: answer() })).status).toBe(201);
    const blocked = await call("submit", { body: answer() });
    expect(blocked.status).toBe(429); expect(blocked.headers["retry-after"]).toBe("600");
    expect((await call("submit", { body: payload })).status).toBe(200); expect(index.size).toBe(INTAKE_NETWORK_LIMIT);
    expect([...expiries.values()]).toEqual([1200]);
  });
  it("rejects browser origin/host/method/query mistakes and invalid input before storage", async () => {
    for (const headers of [{ origin: "https://evil.example" }, { origin: undefined }, { host: "evil.example" }, { "sec-fetch-site": "same-site" }]) expect((await call("submit", { body: answer(), headers })).status).toBe(403);
    expect((await call("submit", { method: "GET" })).status).toBe(405);
    expect((await call("submit&url=https://evil.example", { body: answer() })).status).toBe(400);
    expect((await call("submit&__route=list", { body: answer() })).status).toBe(400);
    const invalid = await call("submit", { body: { ...answer(), consent: false } });
    expect(invalid.status).toBe(400); expect(invalid.value().fieldErrors.consent).toHaveLength(1);
    expect((await call("submit", { body: { ...answer(), work: "中".repeat(20_000) } })).status).toBe(413);
    expect((await call("submit", { body: { website: "https://spam.example" } })).status).toBe(201);
    expect(commands).toHaveLength(0); expect(index.size).toBe(0);
  });
  it("paginates every record without silent export truncation or cursor overlaps", async () => {
    const cookie = await adminCookie();
    for (let i = 0; i < 51; i++) expect((await call("submit", { body: answer(), headers: { "x-vercel-forwarded-for": `192.0.2.${i + 1}` } })).status).toBe(201);
    const first = (await call("list", { cookie })).value();
    expect(first.records).toHaveLength(50); expect(first.nextCursor).toBeTypeOf("string");
    const second = (await call(`list&cursor=${encodeURIComponent(first.nextCursor)}`, { cookie })).value();
    expect(second.records).toHaveLength(1); expect(second.nextCursor).toBeNull();
    expect(new Set([...first.records, ...second.records].map(record => record.id)).size).toBe(51);
    expect((await call("list&cursor=invalid", { cookie })).status).toBe(400);
    const csv = await call("export", { cookie });
    expect(csv.status).toBe(200); expect(csv.text.charCodeAt(0)).toBe(0xfeff); expect(csv.headers["x-guest-intake-complete"]).toBe("false"); expect(csv.headers["x-guest-intake-next-cursor"]).toBe(first.nextCursor);
  });
  it("updates only status/notes, retries a concurrent edit without losing another field, and exports safely", async () => {
    const created = await call("submit", { body: answer() }), id = created.value().id, cookie = await adminCookie();
    expect((await call(`update&id=${id}`, { cookie, body: { name: "rewrite" } })).status).toBe(400);
    conflict = record => ({ ...record, status: "matched" });
    const edited = await call(`update&id=${id}`, { cookie, body: { notes: '=HYPERLINK("https://example.invalid","测试")' } });
    expect(edited.status).toBe(200); expect(edited.value().record.status).toBe("matched");
    expect((await call(`update&id=${id}`, { cookie, body: { notes: " " } })).value().record.notes).toBe("");
    await call(`update&id=${id}`, { cookie, body: { notes: "=1+1", status: "contacted" } });
    const csv = await call("export", { cookie }); expect(csv.text).toContain('"\'=1+1"'); expect(csv.headers["x-guest-intake-complete"]).toBe("true");
    expect((await call(`update&id=${randomUUID()}`, { cookie, body: { status: "archived" } })).status).toBe(404);
    expect((await call(`update&id=${id}`, { cookie, method: "POST", body: { notes: "wrong method" } })).status).toBe(405);
  });
  it("sanitizes Redis failures and fails closed without the dedicated encryption key", async () => {
    vi.stubEnv("GUEST_INTAKE_ENCRYPTION_KEY", "");
    expect((await call("submit", { body: answer() })).status).toBe(503); expect(index.size).toBe(0);
    const cookie = await adminCookie();
    vi.spyOn(console, "error").mockImplementation(() => {}); vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("synthetic-network-error")));
    const failed = await call("list", { cookie }); expect(failed.status).toBe(503); expect(failed.text).not.toContain("synthetic-network-error"); expect(failed.text).not.toContain("synthetic-redis-token");
  });
});
