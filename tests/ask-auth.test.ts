import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash, webcrypto } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
const sdk = vi.hoisted(() => ({
  claims: { sub: "test-user", email: "member@example.com", email_verified: true },
  calls: [] as { action: string; value: unknown }[],
}));
vi.mock("@logto/node", () => ({ default: class {
  constructor(private config: unknown, private adapter: { storage: { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void> }; navigate(url: string): Promise<void> }) {}
  async signIn(value: unknown) {
    sdk.calls.push({ action: "signIn", value });
    await this.adapter.storage.setItem("signInSession", "sdk-owned-state-and-pkce");
    await this.adapter.navigate("https://auth.superlinear.academy/oidc/auth?state=test-state");
  }
  async handleSignInCallback(value: string) {
    sdk.calls.push({ action: "callback", value });
    if (!await this.adapter.storage.getItem("signInSession")) throw new Error("untrusted private error");
  }
  async getIdTokenClaims() { return sdk.claims; }
} }));
import handler from "../api/ask-lizheng-auth";
import { decryptRecord } from "../shared/ask-access";
const store = new Map<string, string>();
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto); sdk.calls.length = 0;
  sdk.claims = { sub: "test-user", email: "member@example.com", email_verified: true };
  vi.stubEnv("ASK_QUOTA_ENABLED", "true");
  vi.stubEnv("ASK_AUTH_SECRET", "test-auth-secret-with-at-least-32-bytes");
  vi.stubEnv("ASK_ADMISSION_SECRET", "test-admission-secret-with-at-least-32-bytes");
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://test-ask.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "test-only-redis-token");
  vi.stubEnv("ASK_CIRCLE_ADMIN_V2_TOKEN", "test-only-circle-token");
  vi.stubEnv("ASK_LOGTO_APP_ID", "test-client"); vi.stubEnv("ASK_LOGTO_APP_SECRET", "test-only-client-secret");
  store.clear();
  vi.stubGlobal("fetch", vi.fn(async (url: URL | string, init?: RequestInit) => {
    if (String(url).includes("upstash.io")) {
      const command = JSON.parse(String(init?.body));
      let result: unknown = null;
      if (command[0] === "SET") { store.set(command[1], command[2]); result = "OK"; }
      if (command[0] === "GET") result = store.get(command[1]) ?? null;
      if (command[0] === "DEL") result = store.delete(command[1]) ? 1 : 0;
      if (command[0] === "EVAL") { result = store.get(command[3]) ?? null; store.delete(command[3]); }
      return Response.json({ result });
    }
    if (String(url).includes("ai-builders.space")) return Response.json({ remaining: 3, reset_at: "2026-10-02T16:00:00Z" });
    return Response.json({ id: 123, email: "member@example.com", member_tags: [{ id: 271455 }] });
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
async function call(url: string, cookie?: string, method = "GET", host = "www.lizheng.ai", origin?: string) {
  const result = { statusCode: 200, headers: new Map<string, unknown>(), body: "",
    setHeader(name: string, value: unknown) { this.headers.set(name.toLowerCase(), value); },
    end(value = "") { this.body = value; } };
  const req = { url, method, headers: { host, cookie, origin } };
  await handler(req as unknown as IncomingMessage, result as unknown as ServerResponse);
  return result;
}
describe("Academy SSO boundary", () => {
  it("uses a dedicated Traditional Web client and fixed SDK callback, with no redirect injection", async () => {
    const login = await call("/api/ask-lizheng/auth/login?provider=logto&return=https://attacker.example&popup=1");
    expect(login.statusCode).toBe(302);
    expect(sdk.calls[0].value).toEqual({ redirectUri: "https://www.lizheng.ai/api/ask-lizheng/auth/callback", postRedirectUri: "https://www.lizheng.ai/?ask_login=done#ask-lizheng", firstScreen: "sign_in" });
    expect(login.headers.get("location")).toContain("auth.superlinear.academy");
    expect(login.headers.get("set-cookie")).toContain("HttpOnly; Secure; SameSite=Lax");
    expect(login.body).not.toContain("test-only-client-secret");
  });
  it("consumes login transactions once and reconstructs the registered callback after a Vercel rewrite", async () => {
    const login = await call("/api/ask-lizheng/auth/login?provider=logto&popup=1");
    const cookie = String(login.headers.get("set-cookie")).split(";")[0];
    const callback = "/api/ask-lizheng-auth?__route=callback&code=valid&state=test-state";
    const result = await call(callback, cookie);
    expect(result.statusCode).toBe(302);
    expect(sdk.calls.at(-1)?.value).toBe("https://www.lizheng.ai/api/ask-lizheng/auth/callback?code=valid&state=test-state");
    expect(result.headers.get("location")).toBe("https://www.lizheng.ai/?ask_login=done#ask-lizheng");
    const session = String((result.headers.get("set-cookie") as string[])[0]);
    expect(session).toContain("__Host-ask-session="); expect(session).not.toContain("Domain=");
    const values = [...store.values()]; expect(values).toHaveLength(1);
    const record = await decryptRecord(values[0]) as Record<string, unknown>;
    expect(record.founding).toBe(true);
    expect(record).not.toHaveProperty("values"); expect(record).not.toHaveProperty("idToken");
    expect((await call(callback, cookie)).statusCode).toBe(401);
  });
  it("does not query Circle or create a session for an unverified email", async () => {
    const login = await call("/api/ask-lizheng/auth/login?provider=logto");
    sdk.claims.email_verified = false;
    const cookie = String(login.headers.get("set-cookie")).split(";")[0];
    const result = await call("/api/ask-lizheng/auth/callback?code=valid&state=test-state", cookie);
    expect(result.statusCode).toBe(403);
    expect(store.size).toBe(0);
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes("circle.so"))).toBe(false);
  });
  it("rejects callback host changes, cross-origin logout and redirects from foreign hosts", async () => {
    const login = await call("/api/ask-lizheng/auth/login?provider=logto");
    const cookie = String(login.headers.get("set-cookie")).split(";")[0];
    expect((await call("/api/ask-lizheng/auth/callback?code=x", cookie, "GET", "ask.lizheng.ai")).statusCode).toBe(401);
    expect((await call("/api/ask-lizheng/auth/logout", undefined, "POST", "www.lizheng.ai", "https://attacker.example")).statusCode).toBe(403);
    expect((await call("/api/ask-lizheng/auth/login", undefined, "GET", "attacker.example")).statusCode).toBe(403);
  });
  it("marks the clicked sign-in control busy with a script the page CSP allows only by hash", async () => {
    const popup = await call("/api/ask-lizheng/auth/login?return=/&popup=1");
    const scripts = [...popup.body.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
    expect(scripts).toHaveLength(1);
    const csp = String(popup.headers.get("content-security-policy"));
    expect(csp).toContain(`script-src 'sha256-${createHash("sha256").update(scripts[0]).digest("base64")}'`);
    expect(csp.split(";").find(part => part.trim().startsWith("script-src"))).not.toContain("unsafe");
    expect(popup.body).not.toMatch(/ on[a-z]+=/);
    expect(popup.body).toContain('data-busy="正在前往超线性学院…">使用超线性学院账号登录</a>');
    expect(popup.body).toContain('data-busy="正在发送…">发送验证码</button>');
    // Only the popup closes itself on 返回提问; a same-tab sign-in navigates back.
    expect(popup.body).toContain("data-back>返回提问</a>");
    const tab = await call("/api/ask-lizheng/auth/login?return=/en/");
    expect(tab.body).toContain('<a href="/en/#ask-lizheng">返回提问</a>');
    expect(tab.body).not.toContain(" data-back>");
  });
  it("leaves the current public experience unchanged until access is enabled", async () => {
    vi.stubEnv("ASK_QUOTA_ENABLED", "false");
    const result = await call("/api/ask-lizheng/auth/session");
    expect(JSON.parse(result.body)).toEqual({ enabled: false });
    expect(fetch).not.toHaveBeenCalled();
  });
});
