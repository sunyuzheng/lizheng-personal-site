import { sameQuestion } from "../../../shared/ask-question-shape";
import type { AskResult, AskSource } from "./ask-lizheng";

/** Published, de-identified questions people asked, curated in the separate Ops service. */
export type DiscoveryCard = {
  public_id: string; revision: number; topic_key?: string; topic_label: string; question: string; summary: string;
  published_at: string; asked_at?: string; topic_question_count: number; likes: number;
  /** Set on a pick: whether it was picked as the most recently asked or the most often asked. */
  role?: "fresh" | "common";
  /** Set on a pick: how many similar askings it stands for (see similarCount). */
  similar_count?: number;
};
export type DiscoveryAnswer = {
  summary: string; sections: AskResult["sections"]; sources: AskSource[]; limitations?: string;
};
export type DiscoveryDetail = { public_id: string; revision: number; question: string; answer: DiscoveryAnswer };

// The pool a visit draws from: every topic once, most asked first, up to three pages of 20 (the
// common questions written fresh, asked once, rank last), and the 20 newest questions.
const VIEWS: [string, number][] = [["window=all&sort=frequent&limit=20", 3], ["window=all&sort=recent&limit=20", 1]];
const CURSOR = /^[A-Za-z0-9_-]{1,512}$/;
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

async function list(view: string, pages: number, signal?: AbortSignal): Promise<DiscoveryCard[]> {
  const items: DiscoveryCard[] = [];
  let cursor: string | null = null;
  try {
    for (let page = 0; page < pages; page++) {
      const response: Response = await fetch(`/api/ask-lizheng/discovery/questions?${view}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
        { cache: "no-store", credentials: "omit", signal });
      if (!response.ok) break;
      const value: { items?: unknown[]; next_cursor?: unknown } = await response.json();
      if (Array.isArray(value?.items)) items.push(...value.items.filter(card));
      cursor = typeof value?.next_cursor === "string" && CURSOR.test(value.next_cursor) ? value.next_cursor : null;
      if (!cursor) break;
    }
  } catch {}
  return items;
}

export async function discoveryPool(signal?: AbortSignal): Promise<DiscoveryCard[]> {
  const pool = new Map<string, DiscoveryCard>();
  for (const item of (await Promise.all(VIEWS.map(([view, pages]) => list(view, pages, signal)))).flat()) {
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

// One question asked in other words shows once (shared with the public answer pages).
export { sameQuestion };

const askedTime = (card: DiscoveryCard) => Date.parse(card.asked_at ?? "") || 0;

/**
 * How many similar askings a card stands for: its topic's count, plus the same question asked in
 * other words that the curation filed under another topic.
 */
export const similarCount = (card: DiscoveryCard, cards: DiscoveryCard[]) => card.topic_question_count + new Set(cards
  .filter(other => other.public_id !== card.public_id && other.topic_key !== card.topic_key && sameQuestion(other.question, card.question))
  .map(other => other.public_id)).size;

/**
 * One question asked in other words shows once: as the wording asked most recently (a common
 * question written fresh, never asked, counts as oldest), with the similar askings of them all.
 */
export function foldDiscovery(cards: DiscoveryCard[]): DiscoveryCard[] {
  const groups: DiscoveryCard[][] = [];
  for (const card of cards) {
    if (groups.some(group => group.some(other => other.public_id === card.public_id))) continue;
    const group = groups.find(group => group.some(other => sameQuestion(other.question, card.question)));
    if (group) group.push(card); else groups.push([card]);
  }
  return groups.map(group => {
    const card = group.reduce((a, b) => askedTime(b) > askedTime(a) ? b : a);
    return { ...card, similar_count: similarCount(card, group) };
  });
}

// How many published questions were asked in the last day. The pool holds the 20 newest, so
// below 20 the count is exact; at 20 there may be more, and the page says 20+.
export const askedLastDay = (pool: DiscoveryCard[], now = Date.now()) =>
  pool.filter(card => now - Date.parse(card.asked_at ?? "") < 24 * 3600000).length;

/**
 * The questions a visit shows, taking turns: the most recently asked (role fresh), then the most
 * often asked (role common). Each topic stands for itself once among the often asked, through the
 * question in it asked most recently, ranked by its similar askings, then likes, then a common
 * question written fresh before a single asking. In each, questions this browser has not seen come
 * first, then older ones, then the last set, so a refresh shows others while the pool allows. One
 * per topic while topics remain; one question asked two ways shows once.
 */
export function pickDiscovery(pool: DiscoveryCard[], seen: string[], count = 4): DiscoveryCard[] {
  const cards = foldDiscovery(pool);
  const before = new Set(seen), last = new Set(seen.slice(-count));
  const visit = (card: DiscoveryCard) => last.has(card.public_id) ? 2 : before.has(card.public_id) ? 1 : 0;
  const topic = (card: DiscoveryCard) => card.topic_key || card.public_id;
  const often = (a: DiscoveryCard, b: DiscoveryCard) => b.similar_count! - a.similar_count! || b.likes - a.likes
    || Number(!!askedTime(a)) - Number(!!askedTime(b)) || Date.parse(b.published_at) - Date.parse(a.published_at);
  const latest = new Map<string, DiscoveryCard>();
  for (const card of cards) {
    const current = latest.get(topic(card));
    if (!current || askedTime(card) > askedTime(current)) latest.set(topic(card), card);
  }
  const lists = {
    fresh: cards.filter(askedTime).sort((a, b) => visit(a) - visit(b) || askedTime(b) - askedTime(a)),
    common: [...latest.values()].sort((a, b) => visit(a) - visit(b) || often(a, b)),
  };
  // Once the topics run out, the rest in the same order, so a small pool still fills the list.
  const rest = [...cards].sort((a, b) => visit(a) - visit(b) || often(a, b));
  const picked: DiscoveryCard[] = [], topics = new Set<string>();
  const add = (card: DiscoveryCard, role: "fresh" | "common") => { picked.push({ ...card, role }); topics.add(topic(card)); return true; };
  const free = (card: DiscoveryCard) => !picked.some(other => other.public_id === card.public_id);
  const take = (role: "fresh" | "common") => {
    const card = lists[role].find(card => free(card) && !topics.has(topic(card)));
    return !!card && add(card, role);
  };
  const fill = () => { const card = rest.find(free); return !!card && add(card, askedTime(card) ? "fresh" : "common"); };
  while (picked.length < count) {
    const [role, other] = picked.length % 2 ? ["common", "fresh"] as const : ["fresh", "common"] as const;
    if (!(take(role) || take(other) || fill())) break;
  }
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
