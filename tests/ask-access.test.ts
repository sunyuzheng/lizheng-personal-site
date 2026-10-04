import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { admission, authCookie, CIRCLE_MONTHLY_LIMIT, COOKIE_SESSION, createSession, decryptRecord, encryptRecord,
  foundingStatus, lookupFounding, memberBudgetKey, resolveIdentity, safeReturnPath, sameOrigin, officialOrigin, backendOrigin } from "../shared/ask-access";

const store = new Map<string, string>();
const FOUNDING = () => Response.json({ id: 123, email: "member@example.com", community_id: 207583, active: true, member_tags: [{ id: 271455 }] });
const NOT_FOUNDING = () => Response.json({ id: 123, email: "member@example.com", community_id: 207583, active: true, member_tags: [] });
// What Circle answers, and how many times it was asked.
let circle: () => Response | Promise<Response>;
let asked = 0;
beforeEach(() => {
  circle = FOUNDING;
  asked = 0;
  vi.stubGlobal("crypto", webcrypto);
  vi.stubEnv("ASK_QUOTA_ENABLED", "true");
  vi.stubEnv("ASK_AUTH_SECRET", "test-auth-secret-with-at-least-32-bytes");
  vi.stubEnv("ASK_ADMISSION_SECRET", "test-admission-secret-with-at-least-32-bytes");
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://test-ask.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "test-only-redis-token");
  vi.stubEnv("ASK_CIRCLE_ADMIN_V2_TOKEN", "test-only-circle-token");
  store.clear();
  vi.stubGlobal("fetch", vi.fn(async (url: URL | string, init?: RequestInit) => {
    if (String(url).includes("upstash.io")) {
      const args = JSON.parse(String(init?.body));
      const [command, key, value] = args;
      let result: unknown = null;
      if (command === "SET") { store.set(key, value); result = "OK"; }
      else if (command === "GET") result = store.get(key) ?? null;
      else if (command === "DEL") { result = store.delete(key) ? 1 : 0; }
      else if (command === "EVAL" && String(args[1]).includes("INCR")) {
        result = Number(store.get(args[3]) ?? 0) + 1; store.set(args[3], String(result));
      } else if (command === "EVAL") {
        if (store.get(args[3]) === args[4]) { store.set(args[3], args[5]); result = 1; }
        else result = 0;
      }
      return Response.json({ result });
    }
    asked++;
    return circle();
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const request = (cookie?: string) => new Request("https://www.lizheng.ai/api/ask-lizheng/ask", {
  headers: cookie ? { cookie } : undefined,
});

describe("Founding access and anonymous continuity", () => {
  it("allows immediate anonymous identity and shares only an opaque guest cookie across the two entries", async () => {
    const first = await resolveIdentity(request());
    expect(first.tier).toBe("public");
    expect(first.authenticated).toBe(false);
    expect(first.cookie).toContain("Domain=lizheng.ai");
    expect(first.cookie).toContain("HttpOnly; Secure; SameSite=Lax");
    const cookie = first.cookie!.split(";")[0];
    const other = await resolveIdentity(new Request("https://ask.lizheng.ai/api/ask", { headers: { cookie } }));
    expect(other.sub).toBe(first.sub);
    expect(other.cookie).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not reset the guest counter on a non-Founding login", async () => {
    const guest = await resolveIdentity(request());
    const session = await createSession(`user:${"a".repeat(43)}`, "member@example.com", false);
    const signedIn = await resolveIdentity(request(`${guest.cookie!.split(";")[0]}; ${session.split(";")[0]}`));
    expect(signedIn.sub).toBe(guest.sub);
    expect(signedIn.tier).toBe("public");
    expect(signedIn.authenticated).toBe(true);
  });
  it("uses a verified Founding session, never a browser tier or email header", async () => {
    const cookie = await createSession(`user:${"b".repeat(43)}`, "member@example.com", true);
    const identity = await resolveIdentity(request(cookie.split(";")[0]));
    expect(identity.tier).toBe("founding");
    expect(cookie).not.toContain("Domain=");
    const fake = await resolveIdentity(new Request("https://ask.lizheng.ai/api/ask", { headers: { "X-Founding": "true", "X-Email": "member@example.com" } }));
    expect(fake.tier).toBe("public");
  });
  it("rejects forged session storage and refreshes stale Founding status", async () => {
    const cookie = await createSession(`user:${"c".repeat(43)}`, "member@example.com", true);
    const [key, encrypted] = [...store.entries()][0];
    const value = await decryptRecord(encrypted) as Record<string, unknown>;
    value.checkedAt = Math.floor(Date.now() / 1000) - 3601;
    store.set(key, await encryptRecord(value));
    circle = NOT_FOUNDING;
    expect((await resolveIdentity(request(cookie.split(";")[0]))).tier).toBe("public");
    expect(asked).toBe(1);
    store.set(key, "forged.storage");
    await expect(resolveIdentity(request(cookie.split(";")[0]))).rejects.toMatchObject({ code: "access_unavailable" });
  });
  it("encrypts identifying metadata and requires exact verified-email lookup", async () => {
    const encrypted = await encryptRecord({ email: "member@example.com" });
    expect(encrypted).not.toContain("member@example.com");
    expect(await decryptRecord(encrypted)).toEqual({ email: "member@example.com" });
    expect(await lookupFounding(" Member@Example.com ")).toBe(true);
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ id: 123, email: "other@example.com", member_tags: [{ id: 271455 }] }));
    await expect(lookupFounding("member@example.com")).rejects.toMatchObject({ code: "membership_unavailable" });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(lookupFounding("member@example.com")).rejects.toMatchObject({ code: "membership_unavailable" });
  });
  it("does not resurrect a session when logout happens during a membership refresh", async () => {
    const cookie = await createSession(`user:${"d".repeat(43)}`, "member@example.com", true);
    const [key, encrypted] = [...store.entries()][0];
    const value = await decryptRecord(encrypted) as Record<string, unknown>;
    value.checkedAt = Math.floor(Date.now() / 1000) - 3601;
    store.set(key, await encryptRecord(value));
    let resume!: (value: Response) => void;
    let started!: () => void;
    const paused = new Promise<void>(resolve => { started = resolve; });
    circle = () => { started(); return new Promise<Response>(resolve => { resume = resolve; }); };
    const refreshing = resolveIdentity(request(cookie.split(";")[0]));
    await paused;
    store.delete(key);
    resume(Response.json({ id: 123, email: "member@example.com", member_tags: [{ id: 271455 }] }));
    const identity = await refreshing;
    expect(identity.tier).toBe("public"); expect(identity.authenticated).toBe(false);
    expect(store.has(key)).toBe(false);
  });
  it("treats missing Founding tag or inactive account as public, but schema errors as unavailable", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect(await lookupFounding("member@example.com")).toBe(false);
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ id: 123, email: "member@example.com", active: false, member_tags: [{ id: 271455 }] }));
    expect(await lookupFounding("member@example.com")).toBe(false);
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ id: 123, email: "member@example.com", member_tags: ["Founding Member"] }));
    await expect(lookupFounding("member@example.com")).rejects.toMatchObject({ code: "membership_unavailable" });
  });
});
describe("asking Circle rarely", () => {
  const NOW = Math.floor(Date.parse("2026-10-05T12:00:00Z") / 1000);
  const DAY = 24 * 60 * 60;
  it("answers from what Circle said while it is fresh: a week for Founding", async () => {
    expect(await foundingStatus(" Member@Example.com ", { signIn: true, now: NOW })).toBe(true);
    expect(await foundingStatus("member@example.com", { now: NOW + 6 * DAY })).toBe(true);
    expect(asked).toBe(1);
    circle = NOT_FOUNDING;
    expect(await foundingStatus("member@example.com", { now: NOW + 7 * DAY })).toBe(false);
    expect(asked).toBe(2);
    // Nothing that names the member is kept.
    expect([...store].flat().join(" ")).not.toContain("member@example.com");
  });
  it("asks again after a day when not Founding, and after an hour at sign-in", async () => {
    circle = NOT_FOUNDING;
    expect(await foundingStatus("member@example.com", { now: NOW })).toBe(false);
    expect(await foundingStatus("member@example.com", { now: NOW + 23 * 3600 })).toBe(false);
    expect(asked).toBe(1);
    circle = FOUNDING;
    expect(await foundingStatus("member@example.com", { signIn: true, now: NOW + 3601 })).toBe(true);
    expect(asked).toBe(2);
  });
  it("never asks more than the month's limit; past it, the last answer stands", async () => {
    store.set(memberBudgetKey("2026-10"), String(CIRCLE_MONTHLY_LIMIT));
    expect(await foundingStatus("member@example.com", { signIn: true, now: NOW })).toBe(false);
    expect(await foundingStatus("member@example.com", { known: true, now: NOW })).toBe(true);
    expect(asked).toBe(0);
    // A new month starts a new count.
    expect(await foundingStatus("member@example.com", { signIn: true, now: Math.floor(Date.parse("2026-11-01T00:00:00Z") / 1000) })).toBe(true);
    expect(asked).toBe(1);
    expect(store.get(memberBudgetKey("2026-11"))).toBe("1");
  });
  it("keeps the last answer while Circle cannot answer, and a first sign-in still stops as before", async () => {
    expect(await foundingStatus("member@example.com", { now: NOW })).toBe(true);
    circle = () => new Response(null, { status: 500 });
    expect(await foundingStatus("member@example.com", { now: NOW + 8 * DAY })).toBe(true);
    await expect(foundingStatus("other@example.com", { signIn: true, now: NOW })).rejects.toMatchObject({ code: "membership_unavailable" });
    expect(await foundingStatus("other@example.com", { known: false, now: NOW })).toBe(false);
  });
});
describe("request-bound admission", () => {
  it("signs the body, endpoint, identity and deadline without question text", async () => {
    const identity = await resolveIdentity(request());
    const body = new TextEncoder().encode('{"question":"test question"}');
    const proof = await admission(identity, "POST", "/api/ask", body);
    const [version, encoded, signature] = proof.split(".");
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    expect(version).toBe("v1"); expect(signature).toHaveLength(43);
    expect(payload.sub).toBe(identity.sub); expect(payload.tier).toBe("public");
    expect(payload.method).toBe("POST"); expect(payload.path).toBe("/api/ask");
    expect(payload.body_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
    expect(JSON.stringify(payload)).not.toContain("test question");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(process.env.ASK_ADMISSION_SECRET!), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    expect(await crypto.subtle.verify("HMAC", key, Buffer.from(signature, "base64url"), new TextEncoder().encode(`v1.${encoded}`))).toBe(true);
  });
  it("rejects cross-origin requests and unregistered return paths", () => {
    expect(() => sameOrigin(new Request("https://www.lizheng.ai/api/ask", { headers: { origin: "https://attacker.example" } }))).toThrow();
    expect(safeReturnPath("https://attacker.example")).toBe("/#ask-lizheng");
    expect(safeReturnPath("/en/")).toBe("/en/#ask-lizheng");
    expect(authCookie(COOKIE_SESSION, "opaque", 600)).not.toContain("Domain=");
  });
  it("allows only an exact configured staging origin and never derives an upstream from the caller", async () => {
    expect(() => officialOrigin("https://test-ask.vercel.app/")).toThrow();
    vi.stubEnv("ASK_AUTH_TEST_ORIGIN", "https://test-ask.vercel.app/");
    expect(officialOrigin("https://test-ask.vercel.app/api/ask")).toBe("https://test-ask.vercel.app");
    const staged = await resolveIdentity(new Request("https://test-ask.vercel.app/api/ask"));
    expect(staged.cookie).not.toContain("Domain=");
    expect(() => officialOrigin("https://other-test.vercel.app/")).toThrow();
    vi.stubEnv("ASK_BACKEND_ORIGIN", "https://ask-lizheng-test.ai-builders.space/");
    expect(backendOrigin()).toBe("https://ask-lizheng-test.ai-builders.space");
    vi.stubEnv("ASK_BACKEND_ORIGIN", "https://attacker.example/");
    expect(() => backendOrigin()).toThrow();
  });
});
