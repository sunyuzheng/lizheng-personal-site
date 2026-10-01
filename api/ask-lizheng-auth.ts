import LogtoClient, { type StorageKey } from "@logto/node";
import type { IncomingMessage, ServerResponse } from "node:http";
import { sanitizedLogtoRequester } from "../shared/ask-logto-requester";
import { COOKIE_EMAIL, emailLoginReady, requestEmailCode, verifyEmailCode } from "../shared/ask-email-otp";
import {
  ACCESS_HEADERS, AccessError, accessEnabled, admission, authCookie, backendOrigin,
  COOKIE_SESSION, COOKIE_TRANSACTION, createSession, decryptRecord, encryptRecord,
  lookupFounding, officialOrigin, opaqueSubject, randomId, readCookie, redis,
  redisKey, resolveIdentity, safeReturnPath, sameOrigin,
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
async function authInput(req: IncomingMessage): Promise<Record<string, unknown>> {
  const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (!["application/json", "application/x-www-form-urlencoded"].includes(contentType))
    throw new AccessError("invalid_request", 400);
  const size = req.headers["content-length"];
  if (size && (typeof size !== "string" || !/^\d+$/.test(size) || Number(size) > 4_096))
    throw new AccessError("input_too_large", 413);
  let body = (req as IncomingMessage & { body?: unknown }).body;
  if (body === undefined) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      body = await Promise.race([
        (async () => {
          let count = 0;
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            count += bytes.length;
            if (count > 4_096) throw new AccessError("input_too_large", 413);
            chunks.push(bytes);
          }
          return Buffer.concat(chunks).toString("utf8");
        })(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => { req.destroy(); reject(new AccessError("invalid_request", 400)); }, 2_000);
        }),
      ]);
    } finally { clearTimeout(timer); }
  }
  try {
    if (Buffer.isBuffer(body)) body = body.toString("utf8");
    if (typeof body === "string") {
      if (Buffer.byteLength(body) > 4_096) throw new AccessError("input_too_large", 413);
      if (contentType === "application/json") body = JSON.parse(body);
      else {
        const params = new URLSearchParams(body);
        if (new Set(params.keys()).size !== [...params.keys()].length) throw new AccessError("invalid_request", 400);
        body = Object.fromEntries(params);
      }
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AccessError("invalid_request", 400);
    if (Buffer.byteLength(JSON.stringify(body)) > 4_096) throw new AccessError("input_too_large", 413);
    return body as Record<string, unknown>;
  } catch (error) {
    throw error instanceof AccessError ? error : new AccessError("invalid_request", 400);
  }
}
function clientAddress(req: IncomingMessage) {
  // Vercel overwrites these forwarded headers. Never persist the raw address.
  const value = req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"];
  return (typeof value === "string" ? value.split(",")[0] : req.socket?.remoteAddress || "unknown").trim().slice(0, 200);
}
function emailPage(url: URL, verifying: boolean, message = "") {
  const params = new URLSearchParams({ return: safeReturnPath(url.searchParams.get("return")).startsWith("/en/") ? "/en/" : "/" });
  if (url.searchParams.get("popup") === "1") params.set("popup", "1");
  const query = params.toString();
  const action = `/api/ask-lizheng/auth/${verifying ? "email-verify" : "email-request"}?${query}`;
  const control = verifying
    ? '<label for="code">邮箱验证码</label><input id="code" name="code" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="one-time-code" required autofocus>'
    : '<label for="email">邮箱</label><input id="email" name="email" type="email" maxlength="320" autocomplete="email" required autofocus>';
  return `<!doctype html><html lang="zh-CN"><meta name="viewport" content="width=device-width,initial-scale=1"><title>问问立正 · 邮箱核验</title><body style="font:16px/1.8 system-ui;max-width:440px;padding:40px 24px;margin:auto;color:#294835;background:#f8f6ef"><h1 style="font-size:24px">邮箱核验</h1><p>${message || (verifying ? "验证码已发送，10分钟内有效。" : "使用你的邮箱接收验证码。核验成功后，确认是否为Founding Member。")}</p><form action="${action}" method="post"><div>${control}</div><button type="submit" style="font:inherit;margin-top:18px;padding:8px 16px">${verifying ? "确认验证码" : "发送验证码"}</button></form><p><a href="/api/ask-lizheng/auth/login?${query}">重新发送</a> · <a href="${safeReturnPath(url.searchParams.get("return"))}">返回提问</a></p></body></html>`;
}
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  for (const [key, value] of Object.entries(ACCESS_HEADERS)) res.setHeader(key, value);
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  const json = (status: number, value: unknown) => {
    res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value));
  };
  const html = (status: number, value: string) => {
    res.statusCode = status; res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    res.end(value);
  };
  let action: string | undefined, currentUrl: URL | undefined;
  try {
    const request = requestFrom(req), url = new URL(request.url);
    currentUrl = url;
    action = url.searchParams.get("__route") || url.pathname.split("/").at(-1);
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
        login_ready: emailLoginReady() });
    }
    if (action === "logout") {
      if (request.method !== "POST" || request.headers.get("origin") !== origin)
        throw new AccessError("invalid_origin", 403);
      const id = readCookie(request, COOKIE_SESSION);
      if (id && /^[a-f0-9]{64}$/.test(id)) await redis(["DEL", await redisKey("session", id)]);
      res.setHeader("Set-Cookie", authCookie(COOKIE_SESSION, "", 0));
      return json(200, { signed_out: true });
    }
    if (action === "email-request" || action === "email-verify") {
      if (request.method !== "POST") throw new AccessError("method_not_allowed", 405);
      sameOrigin(request);
      const input = await authInput(req);
      const field = action === "email-request" ? "email" : "code";
      if (Object.keys(input).some(key => key !== field)) throw new AccessError("invalid_request", 400);
      const form = String(req.headers["content-type"] || "").startsWith("application/x-www-form-urlencoded");
      if (action === "email-request") {
        const challenge = await requestEmailCode(request, input.email, clientAddress(req));
        res.setHeader("Set-Cookie", challenge.cookie);
        return form ? html(200, emailPage(url, true)) : json(200, { ok: true, expires_in: challenge.expires_in });
      }
      const verified = await verifyEmailCode(request, input.code);
      const founding = await lookupFounding(verified.email);
      const cookie = await createSession(await opaqueSubject("user", `email:${verified.email}`), verified.email, founding);
      res.setHeader("Set-Cookie", [cookie, authCookie(COOKIE_EMAIL, "", 0)]);
      if (!form) return json(200, { ok: true, redirect: verified.redirect });
      res.statusCode = 303; res.setHeader("Location", verified.redirect); return res.end();
    }
    if (request.method !== "GET") throw new AccessError("method_not_allowed", 405);
    if (action !== "login" && action !== "callback") throw new AccessError("not_found", 404);
    if (action === "login" && url.searchParams.get("provider") !== "logto") {
      if (!emailLoginReady()) throw new AccessError("email_unavailable");
      return html(200, emailPage(url, false));
    }
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
    if ((action === "email-request" || action === "email-verify") && currentUrl &&
        String(req.headers["content-type"] || "").startsWith("application/x-www-form-urlencoded")) {
      const messages: Record<string, string> = {
        invalid_email: "请输入有效的邮箱地址。", invalid_code: "验证码未通过，请检查后再试。",
        email_expired: "验证码已过期，请重新发送。", email_locked: "验证码尝试次数已用完，请重新发送。",
        email_throttled: "验证码发送较频繁，请稍后再试。",
      };
      return html(failure.status, emailPage(currentUrl, action === "email-verify", messages[failure.code] || "暂时未能完成核验，请稍后再试。"));
    }
    if ((req.url || "").includes("callback") || (req.url || "").includes("/login") || (req.url || "").includes("__route=login")) {
      res.statusCode = failure.status;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(`<!doctype html><html lang="zh-CN"><meta name="viewport" content="width=device-width,initial-scale=1"><title>返回问问立正</title><body style="font:16px/1.8 system-ui;max-width:440px;padding:40px 24px;margin:auto;color:#294835;background:#f8f6ef"><h1 style="font-size:24px">暂时未能完成登录</h1><p>请返回提问页面再试。登录窗口中的核验失败不会影响原页；若用了当前页面跳转，可返回恢复未发送的草稿。这次身份核验不扣提问次数。</p><button onclick="if(window.opener){window.close()}else{location.assign('/#ask-lizheng')}" style="font:inherit;padding:8px 16px">返回提问</button></body></html>`);
      return;
    }
    json(failure.status, { code: failure.code, message: "暂时无法完成身份核验，请返回原页面重试。问题不会扣次。" });
  }
}
