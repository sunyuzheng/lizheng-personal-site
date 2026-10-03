import type { AskResult, AskSource } from "./ask-lizheng";

/** Published, de-identified questions people asked, curated in the separate Ops service. */
export type DiscoveryCard = {
  public_id: string; revision: number; topic_key?: string; topic_label: string; question: string; summary: string;
  published_at: string; asked_at?: string; topic_question_count: number; likes: number;
};
export type DiscoveryAnswer = {
  summary: string; sections: AskResult["sections"]; sources: AskSource[]; limitations?: string;
};
export type DiscoveryDetail = { public_id: string; revision: number; question: string; answer: DiscoveryAnswer };

// The pool a visit draws from: the most asked topics (one question each) and the newest questions.
const VIEWS = ["window=all&sort=frequent&limit=20", "window=all&sort=recent&limit=20"];
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text = (value: unknown) => typeof value === "string" && value.trim().length > 0;
const count = (value: unknown) => Number.isInteger(value) && (value as number) >= 0;
function card(value: unknown): value is DiscoveryCard {
  const v = value as Record<string, unknown>;
  return !!v && typeof v === "object" && typeof v.public_id === "string" && ID.test(v.public_id) && count(v.revision) &&
    (v.topic_key === undefined || typeof v.topic_key === "string") &&
    text(v.question) && typeof v.summary === "string" && typeof v.topic_label === "string" &&
    count(v.topic_question_count) && count(v.likes);
}

// The answer renders with the conversation's own components, so only the fields they read, as strings.
const SOURCE_FIELDS = ["id", "title", "url", "date", "excerpt", "author", "attribution_note", "public_copy_url", "reason", "source_type",
  "source_visibility", "text_access", "membership_platform", "membership_url", "membership_verified_at",
  "transcript_source_kind", "transcript_quality", "speaker_classification"] as const;
const KINDS = ["source", "synthesis", "application"];
function source(value: unknown): AskSource | null {
  const v = value as Record<string, unknown>;
  if (!v || typeof v.id !== "string" || !/^S\d+$/.test(v.id) || !text(v.title) || typeof v.url !== "string") return null;
  return Object.fromEntries(SOURCE_FIELDS.filter(key => typeof v[key] === "string").map(key => [key, v[key]])) as AskSource;
}
function section(value: unknown): AskResult["sections"][number] | null {
  const v = value as Record<string, unknown>;
  if (!v || typeof v.heading !== "string" || typeof v.body !== "string") return null;
  return {
    heading: v.heading, body: v.body,
    kind: (KINDS.includes(v.kind as string) ? v.kind : "synthesis") as AskResult["sections"][number]["kind"],
    source_ids: Array.isArray(v.source_ids) ? v.source_ids.filter((id): id is string => typeof id === "string" && /^S\d+$/.test(id)) : [],
  };
}

async function list(view: string, signal?: AbortSignal): Promise<DiscoveryCard[]> {
  try {
    const response = await fetch(`/api/ask-lizheng/discovery/questions?${view}`, { cache: "no-store", credentials: "omit", signal });
    if (!response.ok) return [];
    const value = await response.json();
    return Array.isArray(value?.items) ? value.items.filter(card) : [];
  } catch { return []; }
}

export async function discoveryPool(signal?: AbortSignal): Promise<DiscoveryCard[]> {
  const pool = new Map<string, DiscoveryCard>();
  for (const item of (await Promise.all(VIEWS.map(view => list(view, signal)))).flat()) {
    if (!pool.has(item.public_id)) pool.set(item.public_id, item);
  }
  return [...pool.values()];
}

// What this browser was shown before, oldest first. Without storage every visit is a first visit.
const SEEN = "ask-discovery-seen";
export function readSeen(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(SEEN) || "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && ID.test(id)) : [];
  } catch { return []; }
}
export function rememberSeen(seen: string[], shown: string[]) {
  try { localStorage.setItem(SEEN, JSON.stringify([...seen.filter(id => !shown.includes(id)), ...shown].slice(-60))); } catch {}
}

// When a question was asked, the way people say it: 刚刚, 23分钟前, 3小时前, 2天前, then the date.
// Ops gives the time to five minutes; a question shows up 15 to 30 minutes after it is asked.
export function askedAgo(iso: string, now = Date.now()): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  const minutes = Math.max(0, Math.floor((now - time) / 60000));
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}小时前`;
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / (24 * 60))}天前`;
  const date = new Date(time);
  return `${date.getFullYear() === new Date(now).getFullYear() ? "" : `${date.getFullYear()}年`}${date.getMonth() + 1}月${date.getDate()}日`;
}

// Two questions that differ only in punctuation or a word or two read as one, even when the
// curation filed them under different topics; only one of them is shown.
const shape = (text: string) => String(text || "").replace(/[\s\p{P}\p{S}]/gu, "").toLowerCase();
const pairs = (text: string) => { const s = shape(text), out = new Set<string>(); for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2)); return out; };
export function sameQuestion(a: string, b: string): boolean {
  const x = pairs(a), y = pairs(b);
  if (!x.size || !y.size) return shape(a) === shape(b);
  let both = 0;
  for (const pair of x) if (y.has(pair)) both++;
  // Mostly the same characters, or the shorter one nearly contained in the longer (a question
  // with 「AI时代」 added). On the 46 questions published by 2026-10-03, this matched only three
  // rewordings of one question.
  return both / (x.size + y.size - both) >= 0.6 || (Math.min(x.size, y.size) >= 6 && both / Math.min(x.size, y.size) >= 0.8);
}

// How many published questions were asked in the last day. The pool holds the 20 newest, so
// below 20 the count is exact; at 20 there may be more, and the page says 20+.
export const askedLastDay = (pool: DiscoveryCard[], now = Date.now()) =>
  pool.filter(card => now - Date.parse(card.asked_at ?? "") < 24 * 3600000).length;

// The picks show the most recently asked first, so their times read like a feed. Seeds, common
// questions written fresh rather than asked, have no time and come last.
export const newestFirst = (cards: DiscoveryCard[]) =>
  [...cards].sort((a, b) => (Date.parse(b.asked_at ?? "") || 0) - (Date.parse(a.asked_at ?? "") || 0));

/**
 * The questions a visit shows. The most recently asked one this browser has not seen comes first,
 * so a visit shows what people are asking now. A first visit then gets the most asked topics.
 * Later visits put unseen questions first, then older ones, then the last set, each group in a
 * random order that leans toward common topics, so a refresh shows something else while the pool
 * allows. One per topic where possible, and never one question asked two ways.
 */
export function pickDiscovery(pool: DiscoveryCard[], seen: string[], count = 4, random = Math.random): DiscoveryCard[] {
  const weight = (item: DiscoveryCard) => 1 + Math.log2(1 + item.topic_question_count);
  const shuffled = (items: DiscoveryCard[]) => items.map(item => ({ item, key: random() ** (1 / weight(item)) }))
    .sort((a, b) => b.key - a.key).map(entry => entry.item);
  let order: DiscoveryCard[];
  if (!seen.length) order = [...pool].sort((a, b) => b.topic_question_count - a.topic_question_count);
  else {
    const before = new Set(seen), last = new Set(seen.slice(-count));
    order = [
      ...shuffled(pool.filter(item => !before.has(item.public_id))),
      ...shuffled(pool.filter(item => before.has(item.public_id) && !last.has(item.public_id))),
      ...shuffled(pool.filter(item => last.has(item.public_id))),
    ];
  }
  const newest = pool.filter(item => Date.parse(item.asked_at ?? "") && !seen.includes(item.public_id))
    .sort((a, b) => Date.parse(b.asked_at ?? "") - Date.parse(a.asked_at ?? ""))[0];
  if (newest) order = [newest, ...order.filter(item => item !== newest)];
  const picked: DiscoveryCard[] = [], topics = new Set<string>();
  const repeats = (item: DiscoveryCard) => picked.some(other => sameQuestion(other.question, item.question));
  for (const item of order) {
    const topic = item.topic_key || item.public_id;
    if (picked.length < count && !topics.has(topic) && !repeats(item)) { picked.push(item); topics.add(topic); }
  }
  for (const item of order) if (picked.length < count && !picked.includes(item) && !repeats(item)) picked.push(item);
  return picked;
}

export async function discoveryDetail(id: string, signal?: AbortSignal): Promise<DiscoveryDetail | null> {
  try {
    const response = await fetch(`/api/ask-lizheng/discovery/detail?public_id=${encodeURIComponent(id)}`,
      { cache: "no-store", credentials: "omit", signal });
    if (!response.ok) return null;
    const value = await response.json();
    const answer = value?.answer;
    if (!text(value?.question) || !answer || typeof answer.summary !== "string" || !Array.isArray(answer.sections) ||
        !Array.isArray(answer.sources)) return null;
    return {
      public_id: id, revision: count(value.revision) ? value.revision : 0, question: value.question,
      answer: {
        summary: answer.summary,
        sections: answer.sections.map(section).filter((item: unknown): item is AskResult["sections"][number] => !!item),
        sources: answer.sources.map(source).filter((item: unknown): item is AskSource => !!item),
        limitations: text(answer.limitations) ? answer.limitations : undefined,
      },
    };
  } catch { return null; }
}

/** Signed-in accounts only; the site derives the voter from its own session. */
export async function voteDiscovery(id: string, revision: number, vote: boolean):
  Promise<{ likes: number; voted: boolean } | null> {
  try {
    const response = await fetch("/api/ask-lizheng/discovery/vote", {
      method: "POST", credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: id, expected_revision: revision, vote }),
    });
    if (!response.ok) return null;
    const value = await response.json();
    return count(value?.likes) && typeof value?.voted === "boolean" ? { likes: value.likes, voted: value.voted } : null;
  } catch { return null; }
}
