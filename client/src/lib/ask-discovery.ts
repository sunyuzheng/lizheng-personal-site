import { sameQuestion } from "../../../shared/ask-question-shape";
import type { AskResult, AskSource } from "./ask-lizheng";

/** Another question under a card of 最常问: what its row shows, and what a like needs. */
export type SimilarQuestion = {
  public_id: string; revision: number; question: string; published_at: string; asked_at?: string; likes: number;
};
/** Questions people asked, published as asked, curated in the separate Ops service. */
export type DiscoveryCard = {
  public_id: string; revision: number; topic_key?: string; topic_label: string; question: string; summary: string;
  published_at: string; asked_at?: string; topic_question_count: number; likes: number;
  /** Set on a pick: whether it was picked as the most recently asked or the most often asked. */
  role?: "fresh" | "common";
  /** Set on a pick: how many similar askings it stands for (see similarCount). */
  similar_count?: number;
  /** In Ops' 最常问, the topic's other questions, most liked first; on a pick of 最常问, the
   * questions that open under it (see discoveryView). */
  similar?: SimilarQuestion[];
};
export type DiscoveryAnswer = {
  summary: string; sections: AskResult["sections"]; sources: AskSource[]; limitations?: string;
};
export type DiscoveryDetail = { public_id: string; revision: number; question: string; answer: DiscoveryAnswer };

/** 最近问 and 最常问: two short lists, the same for every reader, so the CDN can serve them. */
export type DiscoveryLists = { recent: DiscoveryCard[]; frequent: DiscoveryCard[] };
export type DiscoveryView = "recent" | "frequent";
/** How many questions each list holds (Ops' DISCOVERY_LIST_SIZE). */
export const DISCOVERY_LIST_SIZE = 30;
/** Every published question has its own public page, which is what sharing one sends. */
export const discoveryPage = (id: string) => `https://www.lizheng.ai/ask/${id}`;
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
function similarRow(value: unknown): value is SimilarQuestion {
  const v = value as Record<string, unknown>;
  return !!v && typeof v === "object" && typeof v.public_id === "string" && ID.test(v.public_id) && count(v.revision) &&
    text(v.question) && typeof v.published_at === "string" && (v.asked_at === undefined || typeof v.asked_at === "string") && count(v.likes);
}
const row = ({ public_id, revision, question, published_at, asked_at, likes }: SimilarQuestion): SimilarQuestion =>
  ({ public_id, revision, question, published_at, likes, ...(asked_at ? { asked_at } : {}) });

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

/** Both lists in one read; null when they cannot be read (other hosts, Ops down). */
export async function discoveryLists(signal?: AbortSignal): Promise<DiscoveryLists | null> {
  try {
    const response = await fetch("/api/ask-lizheng/discovery/lists", { credentials: "omit", signal });
    if (!response.ok) return null;
    const value = await response.json();
    if (!Array.isArray(value?.recent) || !Array.isArray(value?.frequent)) return null;
    return { recent: value.recent.filter(card), frequent: value.frequent.filter(card).map((item: DiscoveryCard) =>
      ({ ...item, similar: Array.isArray(item.similar) ? item.similar.filter(similarRow).map(row) : [] })) };
  } catch { return null; }
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

const askedTime = (card: { asked_at?: string }) => Date.parse(card.asked_at ?? "") || 0;
type Ranked = { asked_at?: string; likes: number };
// Most recently asked first (a common question written fresh, never asked, counts as oldest); or
// most liked first, then most recently asked.
const askedFirst = (a: Ranked, b: Ranked) => askedTime(b) - askedTime(a);
const likedFirst = (a: Ranked, b: Ranked) => b.likes - a.likes || askedFirst(a, b);
/** How many questions open under a card of 最常问 at most (Ops' DISCOVERY_SIMILAR_SIZE). */
export const DISCOVERY_SIMILAR_SIZE = 8;

/**
 * How many similar askings a card stands for: its topic's count, plus the same question asked in
 * other words that the curation filed under another topic.
 */
export const similarCount = (card: DiscoveryCard, cards: DiscoveryCard[]) => card.topic_question_count + new Set(cards
  .filter(other => other.public_id !== card.public_id && other.topic_key !== card.topic_key && sameQuestion(other.question, card.question))
  .map(other => other.public_id)).size;

// One question asked in other words, as groups: each shown once, through the wording that comes
// first (the first given among equals), with the similar askings of them all.
function fold(cards: DiscoveryCard[], first: (a: DiscoveryCard, b: DiscoveryCard) => number) {
  const groups: DiscoveryCard[][] = [];
  for (const card of cards) {
    if (groups.some(group => group.some(other => other.public_id === card.public_id))) continue;
    const group = groups.find(group => group.some(other => sameQuestion(other.question, card.question)));
    if (group) group.push(card); else groups.push([card]);
  }
  return groups.map(group => {
    const card = [...group].sort(first)[0];
    return { card: { ...card, similar_count: similarCount(card, group) }, group };
  });
}
/**
 * One question asked in other words shows once: as the wording asked most recently (a common
 * question written fresh, never asked, counts as oldest), with the similar askings of them all.
 */
export const foldDiscovery = (cards: DiscoveryCard[]): DiscoveryCard[] => fold(cards, askedFirst).map(({ card }) => card);

// How many published questions were asked in the last day. 最近问 holds the 30 newest, so
// below 30 the count is exact; at 30 there may be more, and the page says 30+.
export const askedLastDay = (pool: DiscoveryCard[], now = Date.now()) =>
  pool.filter(card => now - Date.parse(card.asked_at ?? "") < 24 * 3600000).length;

const topicOf = (card: DiscoveryCard) => card.topic_key || card.public_id;
const often = (a: DiscoveryCard, b: DiscoveryCard) => b.similar_count! - a.similar_count! || b.likes - a.likes
  || Number(!!askedTime(a)) - Number(!!askedTime(b)) || Date.parse(b.published_at) - Date.parse(a.published_at);

/**
 * What a list shows, the same for everyone (over both lists); one question asked two ways shows once,
 * counting the similar askings of them all.
 * 最近问 (recent): the questions people asked, most recently asked first, each as its wording asked
 * most recently; a common question written fresh was never asked and is left to 最常问.
 * 最常问 (frequent): each topic once, through its most liked question, the most recently asked among
 * equals (2026-10-05, the user: likes decide which question stands for its topic), ranked by similar
 * askings, then likes, then a common question written fresh before a single asking, then newest.
 * Under it, `similar`: the topic's other questions and its other wordings, most liked first.
 */
export function discoveryView(lists: DiscoveryLists, view: DiscoveryView): DiscoveryCard[] {
  const pool = new Map<string, DiscoveryCard>();
  for (const card of [...lists.frequent, ...lists.recent]) if (!pool.has(card.public_id)) pool.set(card.public_id, card);
  if (view === "recent")
    return foldDiscovery([...pool.values()]).filter(askedTime).sort(askedFirst).map(card => ({ ...card, role: "fresh" as const }));
  // Every question known of each topic: the cards, and those Ops gives under its cards of 最常问.
  const known = new Map<string, { item: SimilarQuestion; topic: string }>();
  for (const card of pool.values()) known.set(card.public_id, { item: row(card), topic: topicOf(card) });
  for (const card of lists.frequent)
    for (const item of card.similar ?? []) if (!known.has(item.public_id)) known.set(item.public_id, { item, topic: topicOf(card) });
  const picks = new Map<string, ReturnType<typeof fold>[number]>();
  for (const entry of fold([...pool.values()], likedFirst)) {
    const current = picks.get(topicOf(entry.card));
    if (!current || likedFirst(entry.card, current.card) < 0) picks.set(topicOf(entry.card), entry);
  }
  return [...picks.values()].map(({ card, group }) => {
    const folded = new Set(group.map(other => other.public_id));
    const similar = [...known.values()]
      .filter(({ item, topic }) => item.public_id !== card.public_id && (topic === topicOf(card) || folded.has(item.public_id)))
      .map(({ item }) => item).sort(likedFirst).slice(0, DISCOVERY_SIMILAR_SIZE);
    return { ...card, similar };
  }).sort(often).map(card => ({ ...card, role: "common" as const }));
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

/** Anyone may like, counted by browser: the site keys the vote to this browser's anonymous cookie. */
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

/** Which questions this browser liked, and the count each vote came back with, kept on this device
 * only (the server keeps no list of what a browser liked that the page could read). */
export type LikeMemory = Record<string, { voted: boolean; likes: number; at: number }>;
const LIKES_KEY = "ask-discovery-likes";
// The lists reach readers a few minutes after a vote; until then the vote's own count shows.
const LIKE_FRESH_MS = 10 * 60_000;
export function readLikes(): LikeMemory {
  try {
    const value = JSON.parse(localStorage.getItem(LIKES_KEY) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value as Record<string, LikeMemory[string]>).filter(([id, item]) => ID.test(id) && !!item &&
      typeof item.voted === "boolean" && count(item.likes) && Number.isFinite(item.at)));
  } catch { return {}; }
}
/** Keeps a vote's result, the 300 most recent; returns what was kept. */
export function rememberLike(memory: LikeMemory, id: string, result: { voted: boolean; likes: number }, now = Date.now()): LikeMemory {
  const next = Object.fromEntries(Object.entries({ ...memory, [id]: { ...result, at: now } })
    .sort((a, b) => b[1].at - a[1].at).slice(0, 300));
  try { localStorage.setItem(LIKES_KEY, JSON.stringify(next)); } catch { /* Shown for this visit only. */ }
  return next;
}
/** How a question's like shows here: the lists' count, unless a vote from this browser in the last
 * ten minutes is newer than the lists. */
export function likeState(memory: LikeMemory, id: string, listed: number, now = Date.now()) {
  const mine = memory[id];
  if (!mine) return { voted: false, likes: listed };
  if (now - mine.at < LIKE_FRESH_MS) return { voted: mine.voted, likes: mine.voted ? Math.max(listed, mine.likes) : Math.min(listed, mine.likes) };
  // Long since: the lists count it, unless the question was edited since, which clears its likes.
  return { voted: mine.voted && listed > 0, likes: listed };
}
