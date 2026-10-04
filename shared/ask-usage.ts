/**
 * Anonymous usage counts for the owner's Ops dashboard: how long the Ask pages are read, how far
 * they are scrolled, which parts are used, and whether browsers come back. Counts only: no
 * question text, no account or email, no address. The browser is the anonymous cookie the daily
 * limit already uses, stored only as a keyed digest kept apart from the question records. One
 * fixed script over fixed keys; never an arbitrary Redis relay.
 */
import { AccessError, authDigest, clientNetwork, readCookie, redis, resolveOpsVisitor } from "./ask-access.js";

export const USAGE_PREFIX = "ask-ops:{v3}:usage:";
export const USAGE_BODY_LIMIT = 1024;
export const USAGE_SURFACES = ["ask", "home", "app"] as const;
// Sent once per page view, the first time each happens: reading time (seconds), scroll depth
// (percent), seeing the homepage's Ask section, the list of questions others asked (shown,
// scrolled into view, a card opened, 问个类似的, 看更多问题, one shared), asking, an answer,
// opening a source, saving an image or PDF, and on the homepage which chapters came into view
// (selected work, the community map, conversations, public calls, writing, join).
export const USAGE_MARKS = [
  "t10", "t30", "t60", "t180", "t600", "s25", "s50", "s75", "s100",
  "h_seen", "d_shown", "d_seen", "d_open", "d_similar", "d_more", "d_share", "ask", "answer", "source", "export",
  "c_works", "c_city", "c_talks", "c_calls", "c_writing", "c_join",
] as const;
// Also counted as distinct browsers, for the funnel.
export const USAGE_UNIQUE_MARKS = ["h_seen", "d_seen", "d_open", "ask", "answer"] as const;
export const USAGE_TTL_SECONDS = 400 * 86_400;
export const USAGE_NETWORK_DAILY_LIMIT = 600;
const USAGE_FIRST_COOKIE = "__Secure-ask-first";
const MAX_ENGAGED_MS = 2 * 3_600_000;
// Crawlers, link previews and headless browsers (our own checks included) are not readers.
const NOT_A_READER = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|whatsapp|telegram|skype/i;

export type UsageSurface = (typeof USAGE_SURFACES)[number];
export type UsageMark = (typeof USAGE_MARKS)[number];
export type UsageEvent = { v: 1; surface: UsageSurface; view: 0 | 1; engaged_ms: number; marks: UsageMark[] };

/** Days since 1970-01-01 in Beijing time, the day the quota and the Ops dashboard use. */
export const usageDay = (now = Date.now()) => Math.floor((now + 8 * 3_600_000) / 86_400_000);

export function usageEvent(body: Buffer): UsageEvent {
  const invalid = (): never => { throw new AccessError("invalid_request", 400); };
  if (!body.byteLength || body.byteLength > USAGE_BODY_LIMIT) invalid();
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)); } catch { invalid(); }
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const r = value as Record<string, unknown>;
  if (Object.keys(r).sort().join() !== "engaged_ms,marks,surface,v,view" || r.v !== 1 ||
      !USAGE_SURFACES.includes(r.surface as UsageSurface) || (r.view !== 0 && r.view !== 1) ||
      typeof r.engaged_ms !== "number" || !Number.isInteger(r.engaged_ms) || r.engaged_ms < 0 || r.engaged_ms > MAX_ENGAGED_MS ||
      !Array.isArray(r.marks) || r.marks.length > USAGE_MARKS.length ||
      r.marks.some(mark => !USAGE_MARKS.includes(mark as UsageMark)) || new Set(r.marks).size !== r.marks.length) invalid();
  return r as UsageEvent;
}

// KEYS[1]: this network's sends today, capped. ARGV: prefix, day, the browser's first day,
// surface, view (0|1), engaged ms, browser digest, ttl, cap, distinct marks (comma list), marks...
// Each count goes to the day, to the surface and to all; distinct browsers go to HyperLogLogs:
// the day's, the surface's, a few marks', and the cohort of the browser's first day, by days since.
export const USAGE_RECORD_SCRIPT = `
local P,day,first,surface=ARGV[1],ARGV[2],ARGV[3],ARGV[4]
local view,engaged,browser=tonumber(ARGV[5]),tonumber(ARGV[6]),ARGV[7]
local ttl,cap=tonumber(ARGV[8]),tonumber(ARGV[9])
local used=redis.call('INCR',KEYS[1])
if used==1 then redis.call('EXPIRE',KEYS[1],172800) end
if used>cap then return 0 end
redis.call('SET',P..'since',day,'NX')
local dayKey,total=P..'day:'..day,P..'total'
local function bump(field,n)
 redis.call('HINCRBY',dayKey,surface..':'..field,n)
 redis.call('HINCRBY',dayKey,'all:'..field,n)
 redis.call('HINCRBY',total,surface..':'..field,n)
 redis.call('HINCRBY',total,'all:'..field,n)
end
local function seen(key,expires)
 redis.call('PFADD',key,browser)
 if expires then redis.call('EXPIRE',key,ttl) end
end
if view==1 then bump('views',1) end
if engaged>0 then bump('engaged_ms',engaged) end
local distinct={}
for name in string.gmatch(ARGV[10],'[^,]+') do distinct[name]=true end
for i=11,#ARGV do
 bump(ARGV[i],1)
 if distinct[ARGV[i]] then
  seen(P..'mark:'..day..':'..ARGV[i],true)
  seen(P..'all-mark:'..ARGV[i],false)
 end
end
redis.call('EXPIRE',dayKey,ttl)
seen(P..'visitors:'..day,true)
seen(P..'visitors:'..day..':'..surface,true)
seen(P..'all-visitors',false)
seen(P..'all-visitors:'..surface,false)
local since=tonumber(day)-tonumber(first)
if since>=0 and since<=30 then seen(P..'cohort:'..first..':'..since,true) end
return 1
`;

/** Records one send from a page and returns the cookies to set: the anonymous browser, if new, and its first day. */
export async function recordUsage(request: Request, body: Buffer, now = Date.now()): Promise<string[]> {
  const event = usageEvent(body);
  // Off switch: set ASK_USAGE_ENABLED=false to stop counting without changing the pages.
  if (process.env.ASK_USAGE_ENABLED === "false" || NOT_A_READER.test(request.headers.get("user-agent") || "x-bot")) return [];
  const visitor = await resolveOpsVisitor(request);
  const today = usageDay(now);
  const saved = Number(readCookie(request, USAGE_FIRST_COOKIE));
  const first = Number.isInteger(saved) && saved <= today && saved > today - 4000 ? saved : today;
  const result = await redis(["EVAL", USAGE_RECORD_SCRIPT, 1,
    `${USAGE_PREFIX}net:${await authDigest(`usage-network:${clientNetwork(request)}`)}:${today}`,
    USAGE_PREFIX, today, first, event.surface, event.view, event.engaged_ms,
    await authDigest(`usage:v1:${visitor.sub}`), USAGE_TTL_SECONDS, USAGE_NETWORK_DAILY_LIMIT,
    USAGE_UNIQUE_MARKS.join(","), ...event.marks]);
  if (result !== 0 && result !== 1) throw new AccessError("usage_unavailable");
  const cookies = visitor.cookie ? [visitor.cookie] : [];
  if (first !== saved) {
    // The day this browser first came, shared by both hosts, so a later visit can tell it returned.
    const shared = ["www.lizheng.ai", "ask.lizheng.ai"].includes(new URL(request.url).hostname) ? "; Domain=lizheng.ai" : "";
    cookies.push(`${USAGE_FIRST_COOKIE}=${first}${shared}; Path=/; Max-Age=${USAGE_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`);
  }
  return cookies;
}
