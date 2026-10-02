/** Server-only Ask admission, sessions and the Coffee Founding Member lookup. */
const encoder = new TextEncoder();
const COOKIE_GUEST = "__Secure-ask-guest";
export const COOKIE_SESSION = "__Host-ask-session";
export const COOKIE_TRANSACTION = "__Host-ask-login";
export const ACCESS_HEADERS = { "Cache-Control": "no-store, no-transform" };
const ORIGINS = new Set(["https://www.lizheng.ai", "https://ask.lizheng.ai"]);
export const FOUNDING_TAG = 271455;
const SESSION_SECONDS = 12 * 60 * 60;
const FOUNDING_CACHE_SECONDS = 15 * 60;

export class AccessError extends Error {
  /** `detail` is for server logs only (a step and status, never provider bodies). */
  constructor(readonly code: string, readonly status = 503, readonly detail?: string) {
    super(code);
  }
}
export function accessEnabled() {
  return process.env.ASK_QUOTA_ENABLED === "true";
}
export function officialOrigin(url: string) {
  const origin = new URL(url).origin;
  let testOrigin: string | undefined;
  try {
    const configured = new URL(process.env.ASK_AUTH_TEST_ORIGIN || "");
    if (configured.protocol === "https:" && !configured.username && !configured.password &&
        !configured.port && !configured.search && !configured.hash && configured.pathname === "/")
      testOrigin = configured.origin;
  } catch {}
  if (!ORIGINS.has(origin) && origin !== testOrigin) throw new AccessError("invalid_origin", 403);
  return origin;
}
export function backendOrigin() {
  const url = new URL(process.env.ASK_BACKEND_ORIGIN || "https://ask-lizheng.ai-builders.space");
  if (url.protocol !== "https:" || !/^[a-z0-9][a-z0-9-]*\.ai-builders\.space$/.test(url.hostname) ||
      url.username || url.password || url.port || url.search || url.hash || url.pathname !== "/")
    throw new AccessError("access_unavailable");
  return url.origin;
}
export function sameOrigin(request: Request) {
  const origin = officialOrigin(request.url);
  if (request.headers.get("origin") !== origin)
    throw new AccessError("invalid_origin", 403);
  return origin;
}
function secret(name: string) {
  const value = process.env[name];
  if (!value || encoder.encode(value).length < 32)
    throw new AccessError("access_unavailable");
  return value;
}
export function randomId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b =>
    b.toString(16).padStart(2, "0")
  ).join("");
}
export function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode64(value: string) {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function hmac(value: string, key = secret("ASK_AUTH_SECRET")) {
  const imported = await crypto.subtle.importKey(
    "raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", imported, encoder.encode(value))));
}
export async function authDigest(value: string) {
  return hmac(value);
}
export async function opaqueSubject(realm: "guest" | "user", value: string) {
  return `${realm}:${await hmac(`${realm}:${value}`)}`;
}
export async function redisKey(realm: "session" | "transaction" | "otp", value: string) {
  const digest = await hmac(`${realm}:${value}`);
  return `ask:auth:${realm}:${realm === "otp" ? `{${digest}}` : digest}`;
}
export async function redis(command: (string | number)[]): Promise<unknown> {
  const endpoint = process.env.ASK_AUTH_REDIS_REST_URL;
  const token = process.env.ASK_AUTH_REDIS_REST_TOKEN;
  if (!endpoint || !token) throw new AccessError("access_unavailable");
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".upstash.io") ||
      url.username || url.password || url.port || url.search || url.hash ||
      !["", "/"].includes(url.pathname)) throw new AccessError("access_unavailable");
  try {
    const response = await fetch(url, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command), cache: "no-store", redirect: "manual",
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) throw new Error();
    const value = await response.json();
    if (!value || value.error || !("result" in value)) throw new Error();
    return value.result;
  } catch { throw new AccessError("access_unavailable"); }
}
async function encryptionKey() {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret("ASK_AUTH_SECRET")));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
export async function encryptRecord(value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(), encoder.encode(JSON.stringify(value)));
  return `${base64url(iv)}.${base64url(new Uint8Array(data))}`;
}
export async function decryptRecord(value: unknown): Promise<unknown> {
  if (typeof value !== "string" || value.length > 24_000) throw new AccessError("access_unavailable");
  try {
    const [iv, data, extra] = value.split(".");
    if (!iv || !data || extra) throw new Error();
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode64(iv) }, await encryptionKey(), decode64(data));
    return JSON.parse(new TextDecoder().decode(plain));
  } catch { throw new AccessError("access_unavailable"); }
}
export function readCookie(request: Request, name: string) {
  const matches = (request.headers.get("cookie") || "").split(";")
    .map(part => part.trim()).filter(part => part.startsWith(`${name}=`));
  return matches.length === 1 ? matches[0].slice(name.length + 1) : undefined;
}
export function authCookie(name: string, value: string, seconds: number) {
  return `${name}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Lax`;
}
export function safeReturnPath(value: string | null) {
  if (value === "/ops/ask-lizheng") return value;
  return value === "/en" || value === "/en/" ? "/en/#ask-lizheng" : "/#ask-lizheng";
}
export async function lookupFounding(rawEmail: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new AccessError("identity_unverified", 403);
  const token = process.env.ASK_CIRCLE_ADMIN_V2_TOKEN;
  if (!token) throw new AccessError("membership_unavailable");
  const url = new URL("https://app.circle.so/api/admin/v2/community_members/search");
  url.searchParams.set("email", email);
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Token ${token}`, Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" },
      cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(3_000),
    });
    if (response.status === 404) return false;
    if (!response.ok) throw new Error();
    const member = await response.json();
    if (!member || !Number.isInteger(member.id) || member.id <= 0 ||
        typeof member.email !== "string" || member.email.trim().toLowerCase() !== email ||
        !Array.isArray(member.member_tags) ||
        member.member_tags.some((tag: unknown) => !tag || typeof tag !== "object" ||
          !("id" in tag) || !Number.isInteger(tag.id) || Number(tag.id) <= 0) ||
        (member.community_id !== undefined && member.community_id !== 207583)) throw new Error();
    return member.active !== false && member.member_tags.some((tag: { id: number }) => tag.id === FOUNDING_TAG);
  } catch { throw new AccessError("membership_unavailable"); }
}
export type SessionRecord = {
  subject: string; email: string; founding: boolean; checkedAt: number; expiresAt: number;
};
export async function createSession(subject: string, email: string, founding: boolean) {
  const now = Math.floor(Date.now() / 1000);
  const id = randomId();
  const record: SessionRecord = { subject, email, founding, checkedAt: now, expiresAt: now + SESSION_SECONDS };
  await redis(["SET", await redisKey("session", id), await encryptRecord(record), "EX", SESSION_SECONDS]);
  return authCookie(COOKIE_SESSION, id, SESSION_SECONDS);
}
async function loadSession(request: Request, now: number, retry = 0, refreshMembership = true): Promise<SessionRecord | null> {
  const id = readCookie(request, COOKIE_SESSION);
  if (!id || !/^[a-f0-9]{64}$/.test(id)) return null;
  const key = await redisKey("session", id);
  const stored = await redis(["GET", key]);
  if (stored === null) return null;
  const value = await decryptRecord(stored) as SessionRecord;
  if (!value || !/^user:[A-Za-z0-9_-]{43}$/.test(value.subject) || typeof value.email !== "string" ||
      typeof value.founding !== "boolean" || !Number.isInteger(value.expiresAt) ||
      !Number.isInteger(value.checkedAt)) throw new AccessError("access_unavailable");
  if (value.expiresAt <= now) return null;
  if (refreshMembership && now - value.checkedAt >= FOUNDING_CACHE_SECONDS) {
    value.founding = await lookupFounding(value.email);
    value.checkedAt = now;
    const changed = await redis(["EVAL", "if redis.call('GET',KEYS[1]) ~= ARGV[1] then return 0 end; redis.call('SET',KEYS[1],ARGV[2],'EX',ARGV[3]); return 1", 1, key, stored as string, await encryptRecord(value), value.expiresAt - now]);
    if (changed !== 1) {
      if (retry >= 1) throw new AccessError("access_unavailable");
      // Logout or another refresh won the race; never resurrect the old identity.
      return loadSession(request, now, retry + 1, refreshMembership);
    }
  }
  return value;
}
/**
 * The guest quota counts by cookie, so a client that drops cookies (a script,
 * a blocked or cross-site browser) would be a new guest on every request. Each
 * network therefore also has a daily cap on guest questions, generous enough
 * for a room of people sharing one Wi-Fi.
 */
export const GUEST_NETWORK_DAILY_LIMIT = 300;
export class NetworkQuotaError extends AccessError {
  constructor(readonly resetAt: string) {
    super("quota_exhausted", 429);
  }
}
export function clientNetwork(request: Request) {
  // Vercel overwrites these forwarded headers. Never persist the raw address.
  const raw = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "")
    .split(",")[0].trim().toLowerCase().slice(0, 100);
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(raw);
  if (mapped) return mapped[1];
  if (!raw.includes(":")) return raw || "unknown";
  // An IPv6 client usually controls a whole /64, so count the prefix.
  const [head, tail] = raw.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = tail === undefined ? left : [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];
  return `${groups.slice(0, 4).map(group => group.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}
/** Counts one guest question for the network; the returned function gives it back when no answer was made. */
export async function reserveGuestNetwork(request: Request, now = Date.now()) {
  const day = new Date(now + 8 * 3_600_000).toISOString().slice(0, 10); // Beijing day, like the quota
  const key = `ask:net:v1:${await hmac(`network:${clientNetwork(request)}`)}:${day}`;
  const used = await redis(["EVAL",
    "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n",
    1, key, 172_800]);
  if (typeof used !== "number" || !Number.isInteger(used)) throw new AccessError("access_unavailable");
  if (used > GUEST_NETWORK_DAILY_LIMIT)
    throw new NetworkQuotaError(new Date(Date.parse(`${day}T00:00:00+08:00`) + 86_400_000).toISOString());
  let released = false;
  return async () => {
    if (released) return;
    released = true;
    try { await redis(["DECR", key]); } catch { /* The count expires with the day. */ }
  };
}
export type AskIdentity = { sub: string; tier: "public" | "founding"; authenticated: boolean; cookie?: string };
export async function resolveIdentity(request: Request): Promise<AskIdentity> {
  officialOrigin(request.url);
  secret("ASK_ADMISSION_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const session = await loadSession(request, now);
  if (session?.founding) return { sub: session.subject, tier: "founding", authenticated: true };
  const guest = await resolveOpsVisitor(request);
  // Non-Founding sign-in preserves its existing browser counter.
  return { ...guest, tier: "public", authenticated: !!session };
}

/** Verified account ownership only; neither guest quota nor membership enters voting. */
export async function resolveDiscoveryVoter(request: Request): Promise<string> {
  officialOrigin(request.url);
  const session = await loadSession(request, Math.floor(Date.now() / 1000), 0, false);
  if (!session) throw new AccessError("discovery_login_required", 401);
  const email = session.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320)
    throw new AccessError("discovery_login_required", 401);
  // Logto requires email_verified; the Coffee path consumes a valid OTP before createSession.
  return authDigest(`discovery-vote:v1:${email}`);
}

/** Anonymous browser identity, independent of membership/account/email. */
export async function resolveOpsVisitor(request: Request): Promise<{ sub: string; cookie?: string }> {
  officialOrigin(request.url);
  const previous = readCookie(request, COOKIE_GUEST);
  const [oldId, oldSig] = (previous || "").split(".");
  let id = oldId, cookie: string | undefined;
  const expected = /^[a-f0-9]{64}$/.test(oldId || "") ? await hmac(`guest-cookie:${oldId}`) : "";
  // Compare signatures via HMAC verification, including strict decoded length.
  let valid = false;
  if (oldSig && oldSig.length === 43 && expected) {
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret("ASK_AUTH_SECRET")), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    try { valid = await crypto.subtle.verify("HMAC", key, decode64(oldSig), encoder.encode(`guest-cookie:${oldId}`)); } catch {}
  }
  if (!valid) {
    id = randomId();
    const sharedDomain = ["www.lizheng.ai", "ask.lizheng.ai"].includes(new URL(request.url).hostname) ? "; Domain=lizheng.ai" : "";
    cookie = `${COOKIE_GUEST}=${id}.${await hmac(`guest-cookie:${id}`)}${sharedDomain}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
  }
  return { sub: await opaqueSubject("guest", id), cookie };
}
export async function admission(identity: AskIdentity, method: "GET" | "POST", path: "/api/quota" | "/api/ask", body: Uint8Array, ops?: { visitor: string; entrypoint: "home" | "standalone" }) {
  if (ops && (method !== "POST" || path !== "/api/ask" || !/^guest:[A-Za-z0-9_-]{43}$/.test(ops.visitor) || !["home", "standalone"].includes(ops.entrypoint))) throw new AccessError("invalid_request", 400);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", body));
  const proof = { v: 1, sub: identity.sub, tier: identity.tier, attempt: crypto.randomUUID(),
    exp: Math.floor(Date.now() / 1000) + 60, method, path,
    body_sha256: Array.from(digest, b => b.toString(16).padStart(2, "0")).join(""), ...(ops || {}) };
  const encoded = base64url(encoder.encode(JSON.stringify(proof)));
  return `v1.${encoded}.${await hmac(`v1.${encoded}`, secret("ASK_ADMISSION_SECRET"))}`;
}

/** Separate operator authorization: Founding membership never grants this access. */
export async function requireOpsOwner(request: Request) {
  officialOrigin(request.url);
  if (!accessEnabled() || process.env.ASK_OPS_ENABLED !== "true") throw new AccessError("ops_unavailable");
  const emails = (process.env.ASK_OPS_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  if (!emails.length || emails.some(e => e.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) throw new AccessError("ops_unavailable");
  const session = await loadSession(request, Math.floor(Date.now() / 1000), 0, false);
  if (!session) throw new AccessError("ops_login_required", 401);
  if (!emails.includes(session.email.trim().toLowerCase())) throw new AccessError("ops_forbidden", 403);
  return { email: session.email };
}
