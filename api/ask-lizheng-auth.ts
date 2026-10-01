import LogtoClient, { type StorageKey } from "@logto/node";
import type { IncomingMessage, ServerResponse } from "node:http";
import { sanitizedLogtoRequester } from "../shared/ask-logto-requester";
import {
  ACCESS_HEADERS, AccessError, accessEnabled, admission, authCookie, backendOrigin,
  COOKIE_SESSION, COOKIE_TRANSACTION, createSession, decryptRecord, encryptRecord,
  lookupFounding, officialOrigin, opaqueSubject, randomId, readCookie, redis,
  redisKey, resolveIdentity, safeReturnPath,
} from "../shared/ask-access";

type Transaction = { origin: string; returnPath: string; expiresAt: number; values: Record<string, string> };
function logtoConfiguration() {
  const appId = process.env.ASK_LOGTO_APP_ID;
  const appSecret = process.env.ASK_LOGTO_APP_SECRET;
  if (!appId || !appSecret) throw new AccessError("login_unavailable");
  return { endpoint: "https://auth.superlinear.academy", appId, appSecret,
    scopes: ["openid", "profile", "email"], includeReservedScopes: false };
}
function requestFrom(req: IncomingMessage) {
  const host = req.headers.host;
  if (!host) throw new AccessError("invalid_origin", 403);
  const url = new URL(req.url || "/", `https://${host}`);
  officialOrigin(url.href);
  const headers = new Headers();
  for (const name of ["cookie", "origin"]) {
    const value = req.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }
  return new Request(url, { method: req.method || "GET", headers });
}
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  for (const [key, value] of Object.entries(ACCESS_HEADERS)) res.setHeader(key, value);
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const json = (status: number, value: unknown) => {
    res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value));
  };
  try {
    const request = requestFrom(req), url = new URL(request.url);
    const action = url.searchParams.get("__route") || url.pathname.split("/").at(-1);
    if (!accessEnabled()) {
      if (action === "session") return json(200, { enabled: false });
      throw new AccessError("login_unavailable");
    }
    const origin = officialOrigin(request.url);
    if (action === "session") {
      if (request.method !== "GET") throw new AccessError("method_not_allowed", 405);
      const identity = await resolveIdentity(request);
      if (identity.cookie) res.setHeader("Set-Cookie", identity.cookie);
      const upstream = await fetch(`${backendOrigin()}/api/quota`, {
        headers: { "X-Ask-Admission": await admission(identity, "GET", "/api/quota", new Uint8Array()) },
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(3_000),
      });
      if (!upstream.ok) throw new AccessError("access_unavailable");
      const quota = await upstream.json();
      if (typeof quota.remaining !== "number" && quota.remaining !== null) throw new AccessError("access_unavailable");
      return json(200, { enabled: true, authenticated: identity.authenticated,
        founding: identity.tier === "founding", remaining: quota.remaining,
        reset_at: quota.reset_at, limit: identity.tier === "founding" ? null : 3,
        login_ready: !!process.env.ASK_LOGTO_APP_ID && !!process.env.ASK_LOGTO_APP_SECRET });
    }
    if (action === "logout") {
      if (request.method !== "POST" || request.headers.get("origin") !== origin)
        throw new AccessError("invalid_origin", 403);
      const id = readCookie(request, COOKIE_SESSION);
      if (id && /^[a-f0-9]{64}$/.test(id)) await redis(["DEL", await redisKey("session", id)]);
      res.setHeader("Set-Cookie", authCookie(COOKIE_SESSION, "", 0));
      return json(200, { signed_out: true });
    }
    if (request.method !== "GET") throw new AccessError("method_not_allowed", 405);
    if (action !== "login" && action !== "callback") throw new AccessError("not_found", 404);
    let transaction: Transaction, id: string;
    if (action === "login") {
      id = randomId();
      transaction = { origin, returnPath: safeReturnPath(url.searchParams.get("return")),
        expiresAt: Math.floor(Date.now() / 1000) + 600, values: {} };
      if (url.searchParams.get("popup") === "1")
        transaction.returnPath = transaction.returnPath.replace("#", "?ask_login=done#");
    } else {
      id = readCookie(request, COOKIE_TRANSACTION) || "";
      if (!/^[a-f0-9]{64}$/.test(id)) throw new AccessError("login_expired", 401);
      // Consume once before exchanging a code, preventing callback replay.
      const encrypted = await redis(["EVAL", "local v=redis.call('GET',KEYS[1]); if v then redis.call('DEL',KEYS[1]); end; return v", 1, await redisKey("transaction", id)]);
      if (encrypted === null) throw new AccessError("login_expired", 401);
      transaction = await decryptRecord(encrypted) as Transaction;
      if (!transaction || transaction.origin !== origin || transaction.expiresAt <= Date.now() / 1000 ||
          !transaction.values || typeof transaction.values !== "object") throw new AccessError("login_expired", 401);
    }
    let redirect: string | undefined;
    const configuration = logtoConfiguration();
    const client = new LogtoClient(configuration, {
      requester: sanitizedLogtoRequester(configuration.appId, configuration.appSecret),
      storage: {
        getItem: async (key: StorageKey) => transaction.values[key] || null,
        setItem: async (key: StorageKey, value: string) => { transaction.values[key] = value; },
        removeItem: async (key: StorageKey) => { delete transaction.values[key]; },
      },
      navigate: async value => { redirect = value; },
    });
    if (action === "login") {
      await client.signIn({ redirectUri: `${origin}/api/ask-lizheng/auth/callback`,
        postRedirectUri: `${origin}${transaction.returnPath}`, firstScreen: "sign_in" });
      if (!redirect || new URL(redirect).origin !== "https://auth.superlinear.academy") throw new AccessError("login_unavailable");
      await redis(["SET", await redisKey("transaction", id), await encryptRecord(transaction), "EX", 600]);
      res.setHeader("Set-Cookie", authCookie(COOKIE_TRANSACTION, id, 600));
    } else {
      const callback = new URL(`${origin}/api/ask-lizheng/auth/callback`);
      callback.search = url.search;
      callback.searchParams.delete("__route");
      await client.handleSignInCallback(callback.href);
      const claims = await client.getIdTokenClaims();
      if (!claims.sub || typeof claims.email !== "string" || claims.email_verified !== true)
        throw new AccessError("identity_unverified", 403);
      const email = claims.email.trim().toLowerCase();
      const founding = await lookupFounding(email);
      const cookie = await createSession(await opaqueSubject("user", claims.sub), email, founding);
      res.setHeader("Set-Cookie", [cookie, authCookie(COOKIE_TRANSACTION, "", 0)]);
      redirect = `${origin}${transaction.returnPath}`;
      // ID/access tokens are discarded; only the encrypted verified identity remains.
      transaction.values = {};
    }
    res.statusCode = 302; res.setHeader("Location", redirect!); res.end();
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("login_unavailable");
    if ((req.url || "").includes("callback") || (req.url || "").includes("/login") || (req.url || "").includes("__route=login")) {
      res.statusCode = failure.status;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end('<!doctype html><html lang="zh-CN"><meta name="viewport" content="width=device-width,initial-scale=1"><title>返回问问立正</title><body style="font:16px/1.8 system-ui;max-width:440px;padding:40px 24px;margin:auto;color:#294835;background:#f8f6ef"><h1 style="font-size:24px">暂时未能完成登录</h1><p>请关闭这个窗口，回到提问页面再试。原页面的问题和材料仍在；这次身份核验不扣提问次数。</p><button onclick="window.close()" style="font:inherit;padding:8px 16px">关闭并返回</button></body></html>');
      return;
    }
    json(failure.status, { code: failure.code, message: "暂时无法完成身份核验，请返回原页面重试。问题不会扣次。" });
  }
}
