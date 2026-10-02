import LogtoClient, { type StorageKey } from "@logto/node";
import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { sanitizedLogtoRequester } from "../shared/ask-logto-requester.js";
import { COOKIE_EMAIL, emailLoginReady, requestEmailCode, verifyEmailCode } from "../shared/ask-email-otp.js";
import {
  ACCESS_HEADERS, AccessError, accessEnabled, admission, authCookie, backendOrigin,
  COOKIE_SESSION, COOKIE_TRANSACTION, createSession, decryptRecord, encryptRecord,
  lookupFounding, officialOrigin, opaqueSubject, randomId, readCookie, redis,
  redisKey, resolveIdentity, safeReturnPath, sameOrigin,
} from "../shared/ask-access.js";

type Transaction = { origin: string; returnPath: string; expiresAt: number; values: Record<string, string> };
function ssoReady() {
  return !!process.env.ASK_LOGTO_APP_ID?.trim() && !!process.env.ASK_LOGTO_APP_SECRET?.trim();
}
function logtoConfiguration() {
  // Pasted credentials can carry stray whitespace; the provider rejects them as wrong.
  const appId = process.env.ASK_LOGTO_APP_ID?.trim();
  const appSecret = process.env.ASK_LOGTO_APP_SECRET?.trim();
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
// The 立正 seal, as on lizheng.ai; inline because the page loads nothing else.
const SEAL = '<svg viewBox="0 0 1219.04 649.23" aria-hidden="true"><g transform="translate(-17.98,953.72) scale(0.1,-0.1)"><path d="M2555 9534c-148-22-200-45-219-98-11-30 108-234 195-334 116-134 197-334 234-582 28-187 91-280 233-348 213-101 471-15 724 241 163 164 193 243 176 467-21 269-409 563-838 635-91 16-440 29-505 19z"/><path d="M10920 8853c-22-4-96-31-295-108-283-110-1112-277-1830-370-297-39-319-42-460-65-71-11-161-24-200-29-89-11-118-25-150-72-88-126-14-261 334-610 189-189 255-206 516-134 368 102 423 116 510 134 49 11 92 18 96 15 22-13 50-179 71-429 13-148 20-2857 8-2868-3-2-106-14-230-26-124-12-236-24-249-27l-24-5 7 403c4 222 9 437 11 478 3 41 9 170 15 285 6 116 15 271 21 345 26 320 6 408-119 535-240 243-590 357-797 261-137-64-162-143-95-296 111-254 142-398 165-775 12-203 5-1336-9-1352-3-3-192-30-411-58-238-31-491-43-550-26-76 22-226 26-282 7-128-42-197-158-168-281 21-90 87-185 294-419 231-261 324-293 594-202 573 193 1180 330 1772 400 348 41 333 40 810 61 178 8 647 5 760-5 306-27 432-50 714-131 334-97 479-72 565 99 94 185 70 372-67 533-172 203-618 493-714 465-10-2-76-23-148-45-259-81-442-112-855-147-36-3-71-7-78-10-14-4-10 960 4 1211l6 100 76 1c43 1 154 13 247 28 94 15 303 40 465 56 367 36 404 46 512 148 114 106 162 275 110 379-34 66-170 182-352 298-203 130-271 133-516 24-187-83-506-190-522-175-9 10 16 379 38 548 48 383 0 504-266 672-128 81-118 75-113 80 21 21 595 102 964 136 375 35 415 45 507 135 117 115 162 313 94 416-69 103-199 196-465 331-182 92-213 100-321 81z"/><path d="M4090 8234c-30-8-104-31-164-50-235-76-471-128-1036-228-847-150-1321-208-1522-186-173 19-276-4-351-77-124-120-103-231 84-444 374-424 509-513 694-459 39 12 91 27 116 34 25 7 104 36 175 63 628 244 1608 430 2224 422 295-4 290-4 350 16 133 44 222 207 200 365-23 163-126 272-434 458-167 102-223 116-336 86z"/><path d="M3583 7060c-137-29-177-94-138-226 81-277-22-784-308-1519-133-341-387-874-448-941-16-17-44-24-152-38-72-10-240-33-372-52-132-19-409-59-615-89-608-88-927-115-1014-86-131 44-312-41-346-163-27-97-3-179 89-296 28-36 70-90 93-120 23-30 95-119 161-198 224-270 355-332 542-258 99 39 165 66 200 81 17 7 71 28 120 45 50 17 101 36 115 41 80 29 438 129 535 149 22 4 108 22 190 39 491 102 1123 161 1729 161 438 0 689-24 986-93 188-44 320-45 399-4 128 68 231 232 239 382 8 146-56 242-328 494-312 289-369 303-815 206-124-27-365-62-690-99-121-15-242-29-270-32l-50-7 76 84c314 350 594 792 749 1184 17 42 44 82 90 130 298 317 236 607-211 976-268 222-402 282-556 249z"/><path d="M1692 6530c-39-16-74-119-121-359-118-591-35-1006 272-1363 323-374 673-205 657 317-14 436 12 540 246 1015 74 150 134 276 134 281 0 34-42 9-177-106-191-164-309-259-407-329l-80-57-72 144c-170 342-332 505-452 457z"/></g></svg>';
// One look for every page the sign-in flow shows: lizheng.ai's ivory, forest
// green and serif title. The CSP allows inline styles and nothing else.
const PAGE_STYLE = `*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:48px 20px;background:#f8f5ee;color:#121613;font:16px/1.75 "PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}main{max-width:440px;margin:0 auto;padding:30px 28px 24px;border-radius:20px;background:#fcfbf7;box-shadow:0 0 0 1px #e2ddd1,0 30px 60px -44px rgba(20,30,20,.45)}.brand{display:flex;align-items:center;gap:10px;font:700 17px/1 "Noto Serif SC","Songti SC","STSong",serif;letter-spacing:.06em}.brand svg{width:40px;height:auto;fill:#238343}h1{margin:22px 0 0;font:900 26px/1.35 "Noto Serif SC","Songti SC","STSong",serif;letter-spacing:.02em}ol{display:flex;gap:20px;margin:14px 0 0;padding:0;list-style:none;font-size:13px;color:#8d9088}ol li{display:flex;align-items:center;gap:7px}ol li::before{content:attr(data-n);display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 1.5px #d6d0c2;font-size:12px;line-height:1}ol li.on{color:#1c6b37;font-weight:600}ol li.on::before{background:#238343;box-shadow:none;color:#fff}ol li.done{color:#343a35}ol li.done::before{content:"\\2713";background:#e4efe3;box-shadow:none;color:#1c6b37}p{margin:16px 0 0}.lead{color:#343a35}.alert{padding:10px 14px;border-radius:12px;background:#f7e6df;color:#8b3b25;font-size:14.5px}form{display:grid;gap:8px;margin-top:20px}label{font-size:14px;font-weight:600;color:#343a35}input{width:100%;height:50px;padding:0 16px;border:1px solid #d6d0c2;border-radius:12px;background:#f8f5ee;font:inherit;font-size:17px;color:#121613}input::placeholder{color:#a3a69d}input:focus{outline:none;border-color:#238343;background:#fff;box-shadow:0 0 0 4px rgba(35,131,67,.14)}input.code{height:60px;padding-left:.5em;text-align:center;font-size:28px;font-weight:700;letter-spacing:.5em;font-variant-numeric:tabular-nums}button{height:50px;margin-top:10px;border:0;border-radius:999px;background:#238343;color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer}button:hover{background:#1f7a3d}button:focus-visible,a:focus-visible{outline:2px solid #238343;outline-offset:3px}.note{font-size:13px;color:#6c7069}.sso{display:flex;align-items:center;justify-content:center;height:50px;margin-top:20px;border-radius:999px;background:#238343;color:#fff;font-weight:600;text-decoration:none}.sso:hover{background:#1f7a3d}.or{display:flex;align-items:center;gap:12px;margin:22px 0 0;font-size:13px;color:#8d9088}.or::before,.or::after{content:"";flex:1;height:1px;background:#e2ddd1}.or+form{margin-top:14px}.or+form button{background:#fcfbf7;color:#1c6b37;box-shadow:inset 0 0 0 1px #238343}.or+form button:hover{background:#f1f6ef}.links{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:20px;padding-top:16px;border-top:1px solid #e2ddd1;font-size:14px}.links a{color:#1c6b37;font-weight:500;text-decoration:none}.links a:hover{text-decoration:underline}.busy{opacity:.75;cursor:progress}@media (max-width:480px){body{padding:20px 12px}main{padding:24px 20px 20px}}`;
// Leaving for the Academy or sending a code can take a few seconds. Relabel the
// clicked link or button at once and ignore repeat clicks; going back restores
// it. In the sign-in popup, 返回提问 closes the popup instead of loading the site
// in it. Optional: every page works the same without it. The CSP allows it by hash.
const PAGE_SCRIPT = 'document.addEventListener("click",function(e){if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!e.target.closest)return;var back=window.opener&&e.target.closest("a[data-back]");if(back){e.preventDefault();window.close();setTimeout(function(){location.assign(back.href)},300);return}var a=e.target.closest("a[data-busy]");if(!a)return;if(a.hasAttribute("data-label")){e.preventDefault();return}hold(a)});document.addEventListener("submit",function(e){var b=e.target.querySelector("button[data-busy]");if(!b)return;if(b.hasAttribute("data-label")){e.preventDefault();return}hold(b)});addEventListener("pageshow",function(e){if(!e.persisted)return;var l=document.querySelectorAll("[data-label]");for(var i=0;i<l.length;i++){l[i].textContent=l[i].getAttribute("data-label");l[i].removeAttribute("data-label");l[i].removeAttribute("aria-disabled");l[i].classList.remove("busy")}});function hold(el){el.setAttribute("data-label",el.textContent);el.textContent=el.getAttribute("data-busy");el.setAttribute("aria-disabled","true");el.classList.add("busy")}';
const PAGE_CSP = `default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${createHash("sha256").update(PAGE_SCRIPT).digest("base64")}'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`;
function page(title: string, body: string) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>问问立正 · ${title}</title><style>${PAGE_STYLE}</style></head><body><main><div class="brand">${SEAL}<span>问问立正</span></div>${body}</main><script>${PAGE_SCRIPT}</script></body></html>`;
}
function emailPage(url: URL, verifying: boolean, message = "") {
  const params = new URLSearchParams({ return: safeReturnPath(url.searchParams.get("return")).startsWith("/en/") ? "/en/" : "/" });
  const popup = url.searchParams.get("popup") === "1";
  if (popup) params.set("popup", "1");
  const query = params.toString();
  const action = `/api/ask-lizheng/auth/${verifying ? "email-verify" : "email-request"}?${query}`;
  const returnPath = safeReturnPath(url.searchParams.get("return"));
  const control = verifying
    ? '<label for="code">邮箱里的6位验证码</label><input id="code" class="code" name="code" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="one-time-code" required autofocus>'
    : '<label for="email">邮箱</label><input id="email" name="email" type="email" maxlength="320" autocomplete="email" placeholder="你在超线性学院用的邮箱" required autofocus>';
  const lead = verifying
    ? "验证码已发到你的邮箱，10分钟内有效。没收到的话，看看垃圾邮件，或者重新发送。"
    : "输入你在超线性学院用的邮箱，我们发一个6位验证码。核验后，Founding Member每天提问不限次。";
  const note = verifying
    ? "验证码只能用一次；输错5次需要重新发送。"
    : "邮箱只用于核验身份。不是Founding Member也可以直接提问，每天3次。";
  const links = verifying
    ? `<a href="/api/ask-lizheng/auth/login?${query}">重新发送或换个邮箱</a><a href="${returnPath}"${popup ? " data-back" : ""}>返回提问</a>`
    : `<a href="${returnPath}"${popup ? " data-back" : ""}>返回提问</a>`;
  // With a dedicated Academy application, SSO leads and the email code is the fallback, as at Story Coffee.
  if (!verifying && ssoReady()) {
    const intro = message ? `<p class="alert" role="alert">${message}</p>` : '<p class="lead">用超线性学院账号登录，核验后Founding Member每天提问不限次。</p>';
    return page("验证Founding身份", `<h1>验证Founding Member身份</h1>${intro}<a class="sso" href="/api/ask-lizheng/auth/login?provider=logto&${query}" data-busy="正在前往超线性学院…">使用超线性学院账号登录</a><p class="or">没有学院账号？用邮箱收验证码</p><form action="${action}" method="post">${control.replace(" autofocus", "")}<button type="submit" data-busy="正在发送…">发送验证码</button></form><p class="note">${note}</p><p class="links">${links}</p>`);
  }
  return page("验证Founding身份", `<h1>验证Founding Member身份</h1><ol><li data-n="1" class="${verifying ? "done" : "on"}">输入邮箱</li><li data-n="2" class="${verifying ? "on" : ""}">填写验证码</li></ol>${message ? `<p class="alert" role="alert">${message}</p>` : `<p class="lead">${lead}</p>`}<form action="${action}" method="post">${control}<button type="submit" data-busy="${verifying ? "正在核验…" : "正在发送…"}">${verifying ? "确认验证码" : "发送验证码"}</button></form><p class="note">${note}</p><p class="links">${links}</p>`);
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
    res.setHeader("Content-Security-Policy", PAGE_CSP);
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
        login_ready: emailLoginReady() || ssoReady() });
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
      if (!emailLoginReady() && !ssoReady()) throw new AccessError("email_unavailable");
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
    // One line per failure: the step and an error class or code, never values or provider bodies.
    const kind = error instanceof Error ? [error.name, (error as { code?: unknown }).code].filter(Boolean).join(":") : typeof error;
    console.error(JSON.stringify({ event: "ask_auth_failure", action, code: failure.code, status: failure.status,
      detail: failure.detail ?? (error instanceof AccessError ? undefined : kind.slice(0, 120)) }));
    if ((action === "email-request" || action === "email-verify") && currentUrl &&
        String(req.headers["content-type"] || "").startsWith("application/x-www-form-urlencoded")) {
      const messages: Record<string, string> = {
        invalid_email: "请输入有效的邮箱地址。", invalid_code: "验证码未通过，请检查后再试。",
        email_expired: "验证码已过期，请重新发送。", email_locked: "验证码尝试次数已用完，请重新发送。",
        email_throttled: "验证码发送较频繁，请稍后再试。",
      };
      const fallback = action === "email-request" ? "验证码暂时没能发出，请稍后再试。" : "暂时未能完成核验，请稍后再试。";
      return html(failure.status, emailPage(currentUrl, action === "email-verify", messages[failure.code] || fallback));
    }
    if ((req.url || "").includes("callback") || (req.url || "").includes("/login") || (req.url || "").includes("__route=login")) {
      res.statusCode = failure.status;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(page("暂时未能完成登录", `<h1>暂时未能完成登录</h1><p class="lead">请回到提问页面再试。这次核验没有扣提问次数；如果是在当前页面跳转过来的，回去后未发送的问题还在。</p><button type="button" onclick="if(window.opener){window.close()}else{location.assign('/#ask-lizheng')}" style="width:100%">返回提问</button>`));
      return;
    }
    json(failure.status, { code: failure.code, message: "暂时无法完成身份核验，请返回原页面重试。问题不会扣次。" });
  }
}
