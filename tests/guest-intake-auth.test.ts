import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
const sdk = vi.hoisted(() => ({ calls: [] as { postRedirectUri: string }[] }));
vi.mock("@logto/node", () => ({ default: class {
  constructor(_config: unknown, private adapter: { storage: { setItem(key: string, value: string): Promise<void>; getItem(key: string): Promise<string | null> }; navigate(value: string): Promise<void> }) {}
  async signIn(value: { postRedirectUri: string }) { sdk.calls.push(value); await this.adapter.storage.setItem("signInSession", "synthetic-state"); await this.adapter.navigate("https://auth.superlinear.academy/oidc/auth?state=synthetic"); }
  async handleSignInCallback() { if (!await this.adapter.storage.getItem("signInSession")) throw new Error("missing state"); }
  async getIdTokenClaims() { return { sub: "synthetic-guest-admin", email: "admin@example.test", email_verified: true }; }
} }));
import handler from "../api/ask-lizheng-auth.js";
import { decryptRecord, requireOpsOwner, resolveIdentity, safeReturnPath, verifiedSessionEmail } from "../shared/ask-access.js";
import { requireGuestIntakeAdmin } from "../shared/guest-intake-storage.js";

const origin = "https://www.lizheng.ai", store = new Map<string, string>();
const deliveries: Record<string, unknown>[] = [];
let circleCalls = 0;
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto); store.clear(); deliveries.length = 0; circleCalls = 0; sdk.calls.length = 0;
  for (const [key, value] of Object.entries({ ASK_QUOTA_ENABLED: "true", ASK_AUTH_SECRET: "synthetic-auth-secret-at-least-32-bytes",
    ASK_ADMISSION_SECRET: "synthetic-admission-secret-at-least-32-bytes", ASK_AUTH_REDIS_REST_URL: "https://guest-auth.upstash.io", ASK_AUTH_REDIS_REST_TOKEN: "synthetic-redis-token",
    ASK_AUTH_EMAIL_API_KEY: "synthetic-mail-key", ASK_LOGTO_APP_ID: "synthetic-client", ASK_LOGTO_APP_SECRET: "synthetic-client-secret", ASK_CIRCLE_ADMIN_V2_TOKEN: "synthetic-circle-token",
    ASK_OPS_ENABLED: "true", ASK_OPS_ADMIN_EMAILS: "other-owner@example.test", GUEST_INTAKE_ADMIN_EMAILS: "admin@example.test", ASK_AUTH_TEST_ORIGIN: "" })) vi.stubEnv(key, value);
  vi.stubGlobal("fetch", vi.fn(async (url, init) => {
    const destination = String(url);
    if (destination === "https://guest-auth.upstash.io/") {
      const args = JSON.parse(String(init?.body)); let result: unknown = null;
      if (args[0] === "SET") { store.set(args[1], args[2]); result = "OK"; }
      if (args[0] === "GET") result = store.get(args[1]) ?? null;
      if (args[0] === "DEL") result = args.slice(1).reduce((count: number, key: string) => count + Number(store.delete(key)), 0);
      if (args[0] === "EVAL") {
        if (args[2] === 4) result = 1; // OTP send admission, all synthetic.
        else if (args[2] === 2) { // OTP atomic verification.
          if (store.get(args[3]) !== args[5]) result = "changed";
          else if (args[6] === "1") { store.delete(args[3]); result = "verified"; }
          else result = "invalid";
        } else if (String(args[1]).includes("INCR")) result = 1;
        else if (String(args[1]).includes("ARGV[2]")) {
          if (store.get(args[3]) === args[4]) { store.set(args[3], args[5]); result = 1; } else result = 0;
        } else { result = store.get(args[3]) ?? null; store.delete(args[3]); }
      }
      return Response.json({ result });
    }
    if (destination === "https://api.resend.com/emails") { deliveries.push(JSON.parse(String(init?.body))); return Response.json({ id: "synthetic-mail-id" }); }
    if (destination.startsWith("https://app.circle.so/")) { circleCalls++; return Response.json({ id: 123, email: "admin@example.test", active: true, member_tags: [{ id: 271455 }] }); }
    throw new Error("Unexpected external request in synthetic auth test");
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
async function call(path: string, options: { method?: string; body?: unknown; cookie?: string; form?: boolean } = {}) {
  const result = { statusCode: 200, headers: new Map<string, unknown>(), body: "", setHeader(name: string, value: unknown) { this.headers.set(name.toLowerCase(), value); }, end(value = "") { this.body = value; } };
  await handler({ url: `/api/ask-lizheng/auth/${path}`, method: options.method || "GET", body: options.body,
    headers: { host: "www.lizheng.ai", origin, cookie: options.cookie, "content-type": options.form ? "application/x-www-form-urlencoded" : "application/json", "x-vercel-forwarded-for": "192.0.2.1" },
  } as unknown as IncomingMessage, result as unknown as ServerResponse);
  return result;
}
function cookieOf(result: Awaited<ReturnType<typeof call>>, name: string) {
  const raw = result.headers.get("set-cookie");
  return (Array.isArray(raw) ? raw : [raw]).map(String).find(value => value.startsWith(`${name}=`))!.split(";")[0];
}
const adminRequest = (cookie: string) => new Request(`${origin}/api/guest-intake?__route=session`, { headers: { cookie } });

describe("guest-intake verified login without membership coupling", () => {
  it("allows only the exact new return path and leaves prior return behavior intact", () => {
    expect(safeReturnPath("/ops/guest-intake")).toBe("/ops/guest-intake");
    expect(safeReturnPath("/ops/ask-lizheng")).toBe("/ops/ask-lizheng");
    expect(safeReturnPath("/en/")).toBe("/en/#ask-lizheng");
    for (const path of ["/ops/guest-intake?next=evil", "//evil.example/ops/guest-intake", "https://www.lizheng.ai/ops/guest-intake", "/ops/guest-intake/", "/ops/other"]) expect(safeReturnPath(path)).toBe("/#ask-lizheng");
  });
  it("brands only the new admin login and returns SSO to the new path without Circle or Ask ops privileges", async () => {
    const choice = await call("login?return=%2Fops%2Fguest-intake");
    expect(choice.body).toContain("嘉宾池管理"); expect(choice.body).not.toContain("Founding"); expect(choice.body).not.toContain("问问立正");
    expect(choice.body).toContain("provider=logto&return=%2Fops%2Fguest-intake");
    expect(choice.body).toContain("email-request?return=%2Fops%2Fguest-intake");
    const login = await call("login?provider=logto&return=%2Fops%2Fguest-intake");
    expect(sdk.calls[0].postRedirectUri).toBe(`${origin}/ops/guest-intake`);
    const callback = await call("callback?code=synthetic&state=synthetic", { cookie: cookieOf(login, "__Host-ask-login") });
    expect(callback.statusCode).toBe(302); expect(callback.headers.get("location")).toBe(`${origin}/ops/guest-intake`);
    const cookie = cookieOf(callback, "__Host-ask-session");
    expect(await verifiedSessionEmail(adminRequest(cookie))).toEqual({ email: "admin@example.test" });
    expect(await requireGuestIntakeAdmin(adminRequest(cookie))).toEqual({ email: "admin@example.test" }); expect(circleCalls).toBe(0);
    await expect(requireOpsOwner(adminRequest(cookie))).rejects.toMatchObject({ status: 403 });
    expect((await call("login")).body).toContain("验证Founding Member身份");
    expect((await call("login?return=%2Fops%2Fask-lizheng")).body).toContain("登录运营后台");
  });
  it("preserves the new path through native OTP forms and defers membership until subsequent Ask use", async () => {
    vi.stubEnv("ASK_LOGTO_APP_ID", ""); vi.stubEnv("ASK_LOGTO_APP_SECRET", "");
    const choice = await call("login?return=%2Fops%2Fguest-intake");
    expect(choice.body).toContain("管理员邮箱"); expect(choice.body).not.toContain("Founding");
    const started = await call("email-request?return=%2Fops%2Fguest-intake", { method: "POST", form: true, body: "email=admin%40example.test" });
    expect(started.statusCode).toBe(200); expect(started.body).toContain("email-verify?return=%2Fops%2Fguest-intake");
    expect(started.body).not.toContain("问问立正"); expect(deliveries[0].subject).toBe("嘉宾池管理｜邮箱验证码");
    const code = String(deliveries[0].text).match(/\d{6}/)![0];
    const verified = await call("email-verify?return=%2Fops%2Fguest-intake", { method: "POST", form: true, body: `code=${code}`, cookie: cookieOf(started, "__Host-ask-email") });
    expect(verified.statusCode).toBe(303); expect(verified.headers.get("location")).toBe(`${origin}/ops/guest-intake`); expect(circleCalls).toBe(0);
    const cookie = cookieOf(verified, "__Host-ask-session");
    expect(await requireGuestIntakeAdmin(adminRequest(cookie))).toEqual({ email: "admin@example.test" });
    const saved = await decryptRecord([...store].find(([key]) => key.startsWith("ask:auth:session:"))![1]) as { checkedAt: number; founding: boolean };
    expect(saved).toMatchObject({ checkedAt: 0, founding: false });
    expect((await resolveIdentity(adminRequest(cookie))).tier).toBe("founding"); expect(circleCalls).toBe(1);
    const replay = await call("email-verify?return=%2Fops%2Fguest-intake", { method: "POST", body: { code }, cookie: cookieOf(started, "__Host-ask-email") });
    expect(replay.statusCode).toBe(401);
  });
});
