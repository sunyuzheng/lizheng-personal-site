import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import handler from "../api/ask-lizheng-auth";
import { decryptRecord, resolveIdentity } from "../shared/ask-access";
import { COOKIE_EMAIL } from "../shared/ask-email-otp";

const origin = "https://www.lizheng.ai";
const store = new Map<string, string>();
const expiry = new Map<string, number>();
const deliveries: { url: string; init: RequestInit; body: Record<string, unknown> }[] = [];
let memberTags: { id: number }[], circleCalls: number, mailResponse: (() => Promise<Response>) | undefined;
let now: number;
function get(key: string) {
  if ((expiry.get(key) ?? Infinity) <= Date.now()) { store.delete(key); expiry.delete(key); }
  return store.get(key) ?? null;
}
function del(key: string) { const exists = store.delete(key); expiry.delete(key); return exists ? 1 : 0; }
function increment(key: string, seconds: number) {
  const next = Number(get(key) ?? 0) + 1;
  store.set(key, String(next)); if (next === 1) expiry.set(key, Date.now() + seconds * 1_000);
}
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto); now = 1_800_000_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  for (const [name, value] of Object.entries({
    ASK_QUOTA_ENABLED: "true", ASK_AUTH_SECRET: "test-only-auth-secret-at-least-32-bytes",
    ASK_ADMISSION_SECRET: "test-only-admission-secret-at-least-32-bytes",
    ASK_AUTH_REDIS_REST_URL: "https://test-ask.upstash.io", ASK_AUTH_REDIS_REST_TOKEN: "test-only-redis-token",
    ASK_AUTH_EMAIL_API_KEY: "test-only-email-key", ASK_CIRCLE_ADMIN_V2_TOKEN: "test-only-circle-token",
    ASK_LOGTO_APP_ID: "", ASK_LOGTO_APP_SECRET: "", ASK_BACKEND_ORIGIN: "", ASK_AUTH_TEST_ORIGIN: "",
  })) vi.stubEnv(name, value);
  store.clear(); expiry.clear(); deliveries.length = 0; memberTags = [{ id: 271455 }]; circleCalls = 0; mailResponse = undefined;
  vi.stubGlobal("fetch", vi.fn(async (url: URL | string, init?: RequestInit) => {
    const destination = String(url);
    if (destination === "https://test-ask.upstash.io/") {
      const args = JSON.parse(String(init?.body)), command = args[0];
      let result: unknown = null;
      if (command === "SET") { store.set(args[1], args[2]); expiry.set(args[1], Date.now() + Number(args[4]) * 1_000); result = "OK"; }
      if (command === "GET") result = get(args[1]);
      if (command === "DEL") result = args.slice(1).reduce((n: number, key: string) => n + del(key), 0);
      if (command === "EVAL" && args[2] === 4) {
        const keys = args.slice(3, 7), values = args.slice(7);
        if (keys.slice(0, 3).some((key: string, i: number) => Number(get(key) ?? 0) >= Number(values[i])) || get(keys[3]) !== null) result = 0;
        else {
          keys.slice(0, 3).forEach((key: string) => increment(key, Number(values[3])));
          store.set(keys[3], "1"); expiry.set(keys[3], Date.now() + Number(values[4]) * 1_000); result = 1;
        }
      }
      if (command === "EVAL" && args[2] === 2) {
        const [key, attemptsKey, expected, valid, max] = args.slice(3);
        if (get(key) === null) result = "missing";
        else if (get(key) !== expected) result = "changed";
        else if (Number(get(attemptsKey) ?? 0) >= max) result = "locked";
        else if (valid === "1") { del(key); del(attemptsKey); result = "verified"; }
        else {
          increment(attemptsKey, 600); expiry.set(attemptsKey, expiry.get(key)!);
          if (Number(get(attemptsKey)) >= max) { del(key); result = "locked"; }
          else result = "invalid";
        }
      }
      return Response.json({ result });
    }
    if (destination === "https://api.resend.com/emails") {
      deliveries.push({ url: destination, init: init!, body: JSON.parse(String(init?.body)) });
      return mailResponse ? mailResponse() : Response.json({ id: "synthetic-delivery-id" });
    }
    if (destination.startsWith("https://app.circle.so/api/admin/v2/community_members/search?")) {
      circleCalls++;
      return Response.json({ id: 123, email: new URL(destination).searchParams.get("email"), active: true, community_id: 207583, member_tags: memberTags });
    }
    if (destination === "https://ask-lizheng.ai-builders.space/api/quota") return Response.json({ remaining: 3, reset_at: "2027-01-16T16:00:00Z" });
    throw new Error("Unexpected synthetic destination");
  }));
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

async function call(action: string, options: { body?: unknown; cookie?: string; method?: string; host?: string; requestOrigin?: string | null; form?: boolean; ip?: string; rawChunks?: string[] } = {}) {
  const host = options.host || "www.lizheng.ai", method = options.method || "POST";
  const result = { statusCode: 200, headers: new Map<string, unknown>(), body: "",
    setHeader(name: string, value: unknown) { this.headers.set(name.toLowerCase(), value); },
    end(value = "") { this.body = value; } };
  const req = options.rawChunks ? Readable.from(options.rawChunks) : {};
  Object.assign(req, { url: `/api/ask-lizheng/auth/${action}`, method,
    headers: { host, cookie: options.cookie, origin: options.requestOrigin === null ? undefined : options.requestOrigin || `https://${host}`,
      "content-type": options.form ? "application/x-www-form-urlencoded" : "application/json",
      "x-vercel-forwarded-for": options.ip || "192.0.2.1" },
    ...(options.rawChunks ? {} : { body: options.body }), socket: { remoteAddress: "192.0.2.1" } });
  await handler(req as IncomingMessage, result as unknown as ServerResponse);
  return result;
}
function cookieOf(result: Awaited<ReturnType<typeof call>>, name = COOKIE_EMAIL) {
  const values = result.headers.get("set-cookie");
  return (Array.isArray(values) ? values : [values]).map(String).find(value => value.startsWith(`${name}=`))!.split(";")[0];
}
function sentCode(index = deliveries.length - 1) { return String(deliveries[index].body.text).match(/\d{6}/)![0]; }
async function start(options: Parameters<typeof call>[1] = {}) { return call("email-request?popup=1&return=/en/", { body: { email: " Member@Example.com " }, ...options }); }

describe("Coffee email ownership flow", () => {
  it("defaults to a self-contained mailbox form without a Logto app or secret disclosure", async () => {
    const response = await call("login?popup=1&return=https://attacker.example", { method: "GET" });
    expect(response.statusCode).toBe(200); expect(response.body).toContain("email-request");
    expect(response.body).not.toContain("attacker.example"); expect(response.body).not.toContain("test-only-");
    expect(response.headers.get("content-security-policy")).toContain("form-action 'self'");
    expect(fetch).not.toHaveBeenCalled();
    const session = await call("session", { method: "GET" });
    expect(JSON.parse(session.body).login_ready).toBe(true);
  });
  it("sends only a code to the fixed provider, then stores encrypted challenge metadata", async () => {
    const response = await start();
    expect(response.statusCode).toBe(200); expect(JSON.parse(response.body)).toEqual({ ok: true, expires_in: 600 });
    expect(circleCalls).toBe(0); expect(deliveries).toHaveLength(1);
    const delivery = deliveries[0];
    expect(delivery.body).toMatchObject({ from: "立正 <podcast@notify.lizheng.ai>", to: ["member@example.com"], reply_to: "sunyuzheng@gmail.com" });
    expect(delivery.init.redirect).toBe("manual"); expect(delivery.init.headers).not.toHaveProperty("Cookie");
    expect(JSON.stringify(delivery.body)).not.toMatch(/question|history/);
    const challengeValue = [...store.entries()].find(([key]) => key.startsWith("ask:auth:otp:"))![1];
    expect(challengeValue).not.toContain("member@example.com"); expect(challengeValue).not.toContain(sentCode());
    const challenge = await decryptRecord(challengeValue) as Record<string, unknown>;
    expect(challenge.codeHash).toMatch(/^[A-Za-z0-9_-]{43}$/); expect(challenge).not.toHaveProperty("code");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly; Secure; SameSite=Lax");
    expect(response.headers.get("set-cookie")).not.toContain("Domain=");
    expect(JSON.stringify([...store])).not.toContain("192.0.2.1");
  });
  it("verifies Founding only after consuming the code, fixes redirect and rejects replay", async () => {
    const started = await start(), cookie = cookieOf(started), code = sentCode();
    const verified = await call("email-verify", { cookie, body: { code } });
    expect(verified.statusCode).toBe(200);
    expect(JSON.parse(verified.body)).toEqual({ ok: true, redirect: `${origin}/en/?ask_login=done#ask-lizheng` });
    expect(circleCalls).toBe(1);
    const session = cookieOf(verified, "__Host-ask-session");
    expect((await resolveIdentity(new Request(`${origin}/api/ask-lizheng/ask`, { headers: { cookie: session } }))).tier).toBe("founding");
    expect((await call("email-verify", { cookie, body: { code } })).statusCode).toBe(401);
    expect(circleCalls).toBe(1);
  });
  it("retains the anonymous subject after verifying a non-Founding mailbox", async () => {
    memberTags = [];
    const guest = await resolveIdentity(new Request(`${origin}/api/ask-lizheng/ask`));
    const started = await start();
    const verified = await call("email-verify", { cookie: cookieOf(started), body: { code: sentCode() } });
    const identity = await resolveIdentity(new Request(`${origin}/api/ask-lizheng/ask`, { headers: { cookie: `${guest.cookie!.split(";")[0]}; ${cookieOf(verified, "__Host-ask-session")}` } }));
    expect(identity).toMatchObject({ sub: guest.sub, tier: "public", authenticated: true });
  });
  it("works as native forms and redirects after completion without client JavaScript", async () => {
    const started = await start({ form: true, body: "email=member%40example.com" });
    expect(started.headers.get("content-type")).toContain("text/html"); expect(started.body).toContain("email-verify");
    const verified = await call("email-verify", { form: true, body: `code=${sentCode()}`, cookie: cookieOf(started) });
    expect(verified.statusCode).toBe(303); expect(verified.headers.get("location")).toBe(`${origin}/en/?ask_login=done#ask-lizheng`);
  });
  it.each([undefined, "https://attacker.example", "https://ask.lizheng.ai"])("rejects missing or foreign Origin before sending (%s)", async badOrigin => {
    const response = await start({ requestOrigin: badOrigin ?? null });
    expect(response.statusCode).toBe(403); expect(fetch).not.toHaveBeenCalled();
  });
  it("binds a challenge to its original host", async () => {
    const started = await start();
    const response = await call("email-verify", { host: "ask.lizheng.ai", cookie: cookieOf(started), body: { code: sentCode() } });
    expect(response.statusCode).toBe(401); expect(circleCalls).toBe(0);
  });
  it("allows at most five failed code attempts and no subsequent successful reuse", async () => {
    const started = await start(), cookie = cookieOf(started), code = sentCode(), wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) {
      const response = await call("email-verify", { cookie, body: { code: wrong } });
      expect(response.statusCode).toBe(401);
      if (i === 4) expect(JSON.parse(response.body).code).toBe("email_locked");
    }
    expect((await call("email-verify", { cookie, body: { code } })).statusCode).toBe(401); expect(circleCalls).toBe(0);
  });
  it("atomically consumes a correct code under concurrent verification", async () => {
    const started = await start(), cookie = cookieOf(started), code = sentCode();
    const results = await Promise.all([call("email-verify", { cookie, body: { code } }), call("email-verify", { cookie, body: { code } })]);
    expect(results.map(result => result.statusCode).sort()).toEqual([200, 401]); expect(circleCalls).toBe(1);
  });
  it("expires after ten minutes and rejects forged cookies and malformed codes", async () => {
    const started = await start(), cookie = cookieOf(started), code = sentCode();
    expect((await call("email-verify", { cookie, body: { code: "x12345" } })).statusCode).toBe(400);
    expect((await call("email-verify", { cookie: `${COOKIE_EMAIL}=forged`, body: { code } })).statusCode).toBe(401);
    now += 601_000;
    expect((await call("email-verify", { cookie, body: { code } })).statusCode).toBe(401); expect(circleCalls).toBe(0);
  });
  it("limits resends and mailbox sends before provider calls", async () => {
    expect((await start()).statusCode).toBe(200);
    expect((await start()).statusCode).toBe(429);
    for (let i = 0; i < 2; i++) { now += 61_000; expect((await start()).statusCode).toBe(200); }
    now += 61_000; expect((await start()).statusCode).toBe(429); expect(deliveries).toHaveLength(3);
  });
  it("limits one hashed address to twenty sends per window", async () => {
    for (let i = 0; i < 20; i++) expect((await start({ body: { email: `synthetic${i}@example.com` } })).statusCode).toBe(200);
    expect((await start({ body: { email: "synthetic-over@example.com" } })).statusCode).toBe(429); expect(deliveries).toHaveLength(20);
  });
  it("enforces a global bucket across different mailboxes and addresses", async () => {
    for (let i = 0; i < 100; i++) expect((await start({ body: { email: `synthetic${i}@example.com` }, ip: `192.0.2.${i + 1}` })).statusCode).toBe(200);
    expect((await start({ body: { email: "synthetic-over@example.com" }, ip: "198.51.100.1" })).statusCode).toBe(429); expect(deliveries).toHaveLength(100);
  });
  it("invalidates an older challenge only after a successful resend", async () => {
    const first = await start(), oldCookie = cookieOf(first), oldCode = sentCode();
    now += 61_000;
    expect((await start({ cookie: oldCookie })).statusCode).toBe(200);
    expect((await call("email-verify", { cookie: oldCookie, body: { code: oldCode } })).statusCode).toBe(401);
  });
  it("sanitizes provider errors, cancels failures and deletes unsent challenges", async () => {
    const logs = vi.spyOn(console, "error").mockImplementation(() => {}), cancel = vi.fn();
    mailResponse = async () => new Response(new ReadableStream({ cancel }), { status: 500 });
    const response = await start();
    expect(response.statusCode).toBe(503); expect(JSON.parse(response.body).code).toBe("email_unavailable");
    expect(cancel).toHaveBeenCalledOnce(); expect(logs).not.toHaveBeenCalled();
    expect([...store.keys()].filter(key => key.startsWith("ask:auth:otp:"))).toHaveLength(0);
    expect(circleCalls).toBe(0);
  });
  it.each(["redirect", "oversized"])("rejects %s delivery responses without exposing raw body", async mode => {
    mailResponse = async () => mode === "redirect"
      ? new Response(null, { status: 302, headers: { Location: "https://attacker.example" } })
      : new Response("synthetic-private-error".repeat(1_000));
    const response = await start();
    expect(response.statusCode).toBe(503); expect(response.body).not.toContain("synthetic-private-error"); expect(deliveries).toHaveLength(1);
  });
  it("stops an idle delivery body at the five second deadline", async () => {
    vi.useFakeTimers();
    let begun!: () => void;
    const started = new Promise<void>(resolve => { begun = resolve; });
    const cancel = vi.fn();
    mailResponse = async () => { begun(); return new Response(new ReadableStream({ cancel })); };
    const pending = start();
    await started; await vi.advanceTimersByTimeAsync(5_001);
    const response = await pending;
    expect(response.statusCode).toBe(503); expect(cancel).toHaveBeenCalled();
  });
  it("bounds chunked form input and rejects invalid email/extra fields before any outbound call", async () => {
    expect((await start({ body: { email: "not-email" } })).statusCode).toBe(400);
    expect((await start({ body: { email: "member@example.com", url: "https://attacker.example" } })).statusCode).toBe(400);
    expect((await start({ form: true, rawChunks: ["email=", "x".repeat(4_097)] })).statusCode).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("fails closed without email configuration and keeps access disabled without provider calls", async () => {
    vi.stubEnv("ASK_AUTH_EMAIL_API_KEY", "");
    expect((await start()).statusCode).toBe(503);
    expect(JSON.parse((await call("session", { method: "GET" })).body).login_ready).toBe(false);
    vi.stubEnv("ASK_QUOTA_ENABLED", "false");
    const response = await call("session", { method: "GET" });
    expect(JSON.parse(response.body)).toEqual({ enabled: false });
    expect(deliveries).toHaveLength(0);
  });
});
