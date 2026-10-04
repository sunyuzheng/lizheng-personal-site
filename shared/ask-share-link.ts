/**
 * 分享这条回答: the person who asked may give one answered question its own public page at
 * ask.lizheng.ai/s/<date>/<word>: the day it was asked (Beijing time, the record's own day) and an
 * English word for its topic, which the model gave the answer (word-2, word-3… when a day repeats
 * one). The page shows the question and the answer, never the situation (which is not kept). The
 * owner's rules (2026-10-04): what can be shared goes to search engines, every shared page; sharing
 * is a feature, not consent (asking already is), so a link stays and is never withdrawn by its asker.
 *
 * Builder hands the asking page, with each answered v4 result, the record id, the word and a proof
 * (HMAC-SHA256 of "ask-share:v1:<record_id>:<word>" under the quota-store key, which this site holds
 * as ASK_QUOTA_STORE_SECRET). Only that page can share the record, only under that word. A word, once
 * taken on a day, stays with its record: a deleted record never hands its address to another
 * question. The page reads the live record each time, so a record deleted in Ops is gone at once.
 *
 * A share may also give back one of today's questions: once a day per quota subject, only when one
 * was used, never for Founding Members (unlimited) and never inside WeChat or the iPhone app, where
 * the pages do not offer it. Ops' usage panel counts shares, bonuses and share page views, as numbers.
 * Fixed scripts over fixed keys; never an arbitrary Redis relay.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { AccessError, redis, type AskIdentity } from "./ask-access.js";
import { archivedAnswer, type ArchivedAnswer } from "./ask-archive-answer.js";
import { OPS_PREFIX } from "./ask-ops-storage.js";
import { USAGE_PREFIX, USAGE_TTL_SECONDS, usageDay } from "./ask-usage.js";

export const SHARE_ORIGIN = "https://ask.lizheng.ai";
export const SHARE_DAY = /^\d{4}-\d{2}-\d{2}$/;
/** The model's word: one to four lowercase English words. */
export const SHARE_WORD = /^[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,3}$/;
/** An address: the word, with -2, -3… when the day already had it. */
export const SHARE_SLUG = /^[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,4}$/;
export const SHARE_BODY_LIMIT = 2048;
export const SHARE_SURFACES = ["home", "ask", "app"] as const;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const QUOTA_LIMIT = 3;
// Every shared record, by when it was shared, for the sitemap.
const SHARES_KEY = `${OPS_PREFIX}shares`;
const QUOTA_RETENTION_SECONDS = 172_800;

export type ShareSurface = (typeof SHARE_SURFACES)[number];
export type ShareProof = { record_id: string; word: string; proof: string };
export type ShareRequest = ShareProof & { surface: ShareSurface; bonus: boolean };
export type ShareBonus = "granted" | "claimed" | "unused" | "unlimited" | "off";
type Sender = (command: (string | number)[]) => Promise<unknown>;

export const shareUrl = (day: string, slug: string) => `${SHARE_ORIGIN}/s/${day}/${slug}`;
const invalid = (): never => { throw new AccessError("invalid_request", 400); };
const unavailable = (): never => { throw new AccessError("share_unavailable"); };
const counting = () => process.env.ASK_USAGE_ENABLED !== "false";
const usageKeys = (now: number) => [`${USAGE_PREFIX}day:${usageDay(now)}`, `${USAGE_PREFIX}total`];

/** What a page may send to share one answer; nothing else. */
export function shareRequest(value: unknown, host: string): ShareRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const r = value as Record<string, unknown>;
  if (Object.keys(r).sort().join() !== "bonus,proof,record_id,surface,word" || typeof r.record_id !== "string" || !UUID.test(r.record_id) ||
      typeof r.word !== "string" || !SHARE_WORD.test(r.word) || r.word.length > 40 ||
      typeof r.proof !== "string" || !/^[a-f0-9]{64}$/.test(r.proof)) invalid();
  // The homepage shares from www; ask.lizheng.ai and the app (the same page) from ask.
  const surfaces: readonly string[] = host === "www.lizheng.ai" ? ["home"] : ["ask", "app"];
  if (!surfaces.includes(r.surface as string) || typeof r.bonus !== "boolean") invalid();
  return { record_id: r.record_id as string, word: r.word as string, proof: r.proof as string,
    surface: r.surface as ShareSurface, bonus: r.bonus as boolean };
}

/** Builder's proof that this page received this record, and this word with it. */
export function verifyShareProof(request: ShareProof) {
  const secret = process.env.ASK_QUOTA_STORE_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) unavailable();
  const expected = createHmac("sha256", secret!).update(`ask-share:v1:${request.record_id}:${request.word}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(request.proof, "hex"))) throw new AccessError("invalid_share", 403);
}

// KEYS: the record, its deletion tombstone, the list of shared records. ARGV: prefix, record id,
// word, time, count (0|1), surface, usage day key, usage total key, ttl, time (ms). Only an answered
// v4 record, still there, can be shared. A shared record keeps its address; otherwise it takes the
// first free word of its day (word, word-2…). Counts each record's share once.
export const SHARE_SCRIPT = `
if redis.call('EXISTS',KEYS[2])==1 or redis.call('EXISTS',KEYS[1])==0 then return {'GONE','',''} end
local row=redis.call('HMGET',KEYS[1],'status','notice_version','answer','day','share_slug')
local day=row[4]
if row[1]~='answered' or row[2]~='v4' or not row[3] or row[3]=='' or not day or day=='' then return {'UNSHAREABLE','',''} end
if row[5] and row[5]~='' then return {'SHARED',row[5],day} end
local slug=''
for n=1,500 do
 local candidate=ARGV[3]
 if n>1 then candidate=candidate..'-'..n end
 local key=ARGV[1]..'share:'..day..':'..candidate
 local owner=redis.call('GET',key)
 if not owner or owner==ARGV[2] then redis.call('SET',key,ARGV[2]) slug=candidate break end
end
if slug=='' then return {'FULL','',''} end
redis.call('HSET',KEYS[1],'share_slug',slug,'shared_at',ARGV[4])
redis.call('ZADD',KEYS[3],tonumber(ARGV[10]),ARGV[2])
if ARGV[5]=='1' then
 for _,key in ipairs({ARGV[7],ARGV[8]}) do
  redis.call('HINCRBY',key,ARGV[6]..':share',1)
  redis.call('HINCRBY',key,'all:share',1)
 end
 redis.call('EXPIRE',ARGV[7],tonumber(ARGV[9]))
end
return {'NEW',slug,day}`;

// KEYS: the address. ARGV: prefix, day, slug, count (0|1), usage day key, usage total key, ttl.
// The page exists only while its record does, still shared under this address and day, answered
// under the v4 notice.
export const SHARE_PAGE_SCRIPT = `
local id=redis.call('GET',KEYS[1])
if not id or redis.call('EXISTS',ARGV[1]..'deleted:'..id)==1 then return {'MISSING'} end
local row=redis.call('HMGET',ARGV[1]..'record:'..id,'share_slug','day','status','notice_version','question','answer','intent','created_at')
if row[1]~=ARGV[3] or row[2]~=ARGV[2] or row[3]~='answered' or row[4]~='v4' or not row[5] or not row[6] then return {'MISSING'} end
if ARGV[4]=='1' then
 redis.call('HINCRBY',ARGV[5],'all:share_view',1)
 redis.call('EXPIRE',ARGV[5],tonumber(ARGV[7]))
 redis.call('HINCRBY',ARGV[6],'all:share_view',1)
end
return {'OK',row[5],row[6],row[7] or '',row[8] or ''}`;

// KEYS: today's used count, pending reservations and bonus mark of one quota subject (the keys
// Builder's quota script keeps). ARGV: now (seconds), when the mark expires. One question back a
// day, only when one was used: the count never goes below zero.
export const SHARE_BONUS_SCRIPT = `
local used=tonumber(redis.call('GET',KEYS[1]) or '0')
local pending=redis.call('ZCOUNT',KEYS[2],'('..ARGV[1],'+inf')
if redis.call('EXISTS',KEYS[3])==1 then return {'CLAIMED',used,pending} end
if used<1 then return {'UNUSED',used,pending} end
redis.call('DECR',KEYS[1])
redis.call('SET',KEYS[3],'1')
redis.call('EXPIREAT',KEYS[3],tonumber(ARGV[2]))
return {'GRANTED',used-1,pending}`;

// KEYS: usage day, usage total. ARGV: ttl, then the fields to count once.
export const SHARE_COUNT_SCRIPT = `
for i=2,#ARGV do
 redis.call('HINCRBY',KEYS[1],ARGV[i],1)
 redis.call('HINCRBY',KEYS[2],ARGV[i],1)
end
redis.call('EXPIRE',KEYS[1],tonumber(ARGV[1]))
return 1`;

/** Marks the record shared, or finds its address; returns where it is and whether it is new. */
export async function createShare(request: ShareRequest, now = Date.now(), send: Sender = redis) {
  verifyShareProof(request);
  const [dayKey, totalKey] = usageKeys(now);
  const result = await send(["EVAL", SHARE_SCRIPT, 3, `${OPS_PREFIX}record:${request.record_id}`, `${OPS_PREFIX}deleted:${request.record_id}`,
    SHARES_KEY, OPS_PREFIX, request.record_id, request.word, new Date(now).toISOString(), counting() ? 1 : 0, request.surface,
    dayKey, totalKey, USAGE_TTL_SECONDS, now]);
  if (!Array.isArray(result) || result.length !== 3 || result.some(value => typeof value !== "string")) unavailable();
  const [code, slug, day] = result as string[];
  if (code === "GONE" || code === "UNSHAREABLE") throw new AccessError("share_not_found", 404);
  if (!["NEW", "SHARED"].includes(code) || !SHARE_SLUG.test(slug) || !SHARE_DAY.test(day)) unavailable();
  return { url: shareUrl(day, slug), day, slug, first: code === "NEW" };
}

/** The Beijing day the quota counts, and when its keys expire (as Builder's quota script sets them). */
export function quotaDay(now = Date.now()) {
  const day = new Date(now + 8 * 3_600_000).toISOString().slice(0, 10);
  const reset = Date.parse(`${day}T00:00:00+08:00`) / 1000 + 86_400;
  return { day, expires: reset + QUOTA_RETENTION_SECONDS };
}
function bonusKeys(subject: string, day: string) {
  // Builder's quota keys: ask-quota:v1:{sha256(subject)}:<day>:used and :pending (server/quota.py).
  const prefix = `ask-quota:v1:{${createHash("sha256").update(subject, "ascii").digest("hex")}}:${day}:`;
  return [`${prefix}used`, `${prefix}pending`, `${prefix}share-bonus`];
}

/** Gives back one of today's questions for a share, at most once a day. */
export async function claimShareBonus(identity: AskIdentity, surface: ShareSurface, now = Date.now(), send: Sender = redis):
  Promise<{ bonus: ShareBonus; remaining?: number }> {
  if (identity.tier === "founding") return { bonus: "unlimited" };
  const { day, expires } = quotaDay(now);
  const result = await send(["EVAL", SHARE_BONUS_SCRIPT, 3, ...bonusKeys(identity.sub, day), Math.floor(now / 1000), expires]);
  if (!Array.isArray(result) || result.length !== 3 || !["GRANTED", "CLAIMED", "UNUSED"].includes(result[0]) ||
      result.slice(1).some(value => typeof value !== "number" || !Number.isInteger(value) || value < 0)) unavailable();
  const [code, used, pending] = result as [string, number, number];
  if (code === "GRANTED" && counting()) {
    try {
      await send(["EVAL", SHARE_COUNT_SCRIPT, 2, ...usageKeys(now), USAGE_TTL_SECONDS, `${surface}:share_bonus`, "all:share_bonus"]);
    } catch { /* A missed count never takes the question back. */ }
  }
  return { bonus: code === "GRANTED" ? "granted" : code === "CLAIMED" ? "claimed" : "unused",
    remaining: Math.max(0, QUOTA_LIMIT - used - pending) };
}

/** Whether a share today would still give a question back (the count line's offer); undefined when unknown. */
export async function shareBonusOpen(identity: AskIdentity, now = Date.now(), send: Sender = redis): Promise<boolean | undefined> {
  if (identity.tier === "founding") return false;
  try {
    const result = await send(["EXISTS", bonusKeys(identity.sub, quotaDay(now).day)[2]]);
    return result === 0 ? true : result === 1 ? false : undefined;
  } catch { return undefined; }
}

export type SharedAnswer = {
  day: string; slug: string; question: string; answer: ArchivedAnswer; intent: string; created_at: string;
};

/** The shared question and answer behind an address, or null when there is none. */
export async function readShare(day: string, slug: string, options: { reader: boolean; now?: number; send?: Sender }):
  Promise<SharedAnswer | null> {
  if (!SHARE_DAY.test(day) || !SHARE_SLUG.test(slug) || slug.length > 120) return null;
  const now = options.now ?? Date.now(), send = options.send ?? redis;
  const [dayKey, totalKey] = usageKeys(now);
  const result = await send(["EVAL", SHARE_PAGE_SCRIPT, 1, `${OPS_PREFIX}share:${day}:${slug}`,
    OPS_PREFIX, day, slug, options.reader && counting() ? 1 : 0, dayKey, totalKey, USAGE_TTL_SECONDS]);
  if (!Array.isArray(result) || typeof result[0] !== "string") unavailable();
  const values = result as string[];
  if (values[0] !== "OK") return null;
  if (values.length !== 5 || values.some(value => typeof value !== "string")) unavailable();
  const [, question, raw, intent, created] = values;
  let answer: ArchivedAnswer;
  try { answer = archivedAnswer(JSON.parse(raw)); } catch { return null; }
  if (answer.status !== "answered" || !question.trim()) return null;
  return { day, slug, question: question.trim(), answer, intent, created_at: created };
}

// KEYS: the list of shared records. ARGV: prefix, how many. Newest shared first: each shared record
// that is still there, with its address and when it was shared. A record deleted in Ops leaves the list.
export const SHARE_LIST_SCRIPT = `
local out={}
for _,id in ipairs(redis.call('ZREVRANGE',KEYS[1],0,tonumber(ARGV[2])-1)) do
 local row=redis.call('HMGET',ARGV[1]..'record:'..id,'share_slug','day','status','notice_version','shared_at')
 if not row[3] then
  redis.call('ZREM',KEYS[1],id)
 elseif row[1] and row[1]~='' and row[3]=='answered' and row[4]=='v4' and redis.call('EXISTS',ARGV[1]..'deleted:'..id)==0 then
  out[#out+1]={row[2],row[1],row[5] or ''}
 end
end
return out`;

export type ShareListing = { day: string; slug: string; shared_at: string };

/** Shared pages, newest first, for the sitemap: every one of them goes to search engines. */
export async function listShares(limit = 1000, send: Sender = redis): Promise<ShareListing[]> {
  const result = await send(["EVAL", SHARE_LIST_SCRIPT, 1, SHARES_KEY, OPS_PREFIX, limit]);
  if (!Array.isArray(result)) unavailable();
  const out: ShareListing[] = [];
  for (const row of result as unknown[]) {
    if (!Array.isArray(row) || row.length !== 3 || row.some(value => typeof value !== "string")) unavailable();
    const [day, slug, shared_at] = row as string[];
    if (SHARE_DAY.test(day) && SHARE_SLUG.test(slug)) out.push({ day, slug, shared_at });
  }
  return out;
}
