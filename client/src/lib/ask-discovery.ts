import type { AskResult, AskSource } from "./ask-lizheng";

/** Published, de-identified questions people asked, curated in the separate Ops service. */
export type DiscoveryCard = {
  public_id: string; revision: number; topic_key?: string; topic_label: string; question: string; summary: string;
  published_at: string; topic_question_count: number; likes: number;
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
const SOURCE_FIELDS = ["id", "title", "url", "date", "excerpt", "author", "attribution_note", "public_copy_url", "reason"] as const;
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

/**
 * The questions a visit shows. A first visit gets the most asked topics. Later visits put unseen
 * questions first, then older ones, then the last set, each group in a random order that leans
 * toward common topics, so a refresh shows something else while the pool allows. One per topic
 * where possible.
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
  const picked: DiscoveryCard[] = [], topics = new Set<string>();
  for (const item of order) {
    const topic = item.topic_key || item.public_id;
    if (picked.length < count && !topics.has(topic)) { picked.push(item); topics.add(topic); }
  }
  for (const item of order) if (picked.length < count && !picked.includes(item)) picked.push(item);
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
