/**
 * The follow-ups of a published question (2026-10-15, the owner: 多轮对话应该在同一个 URL 里边): a
 * question in 别人在问什么 is its whole conversation. The question and its answer are Ops' files; the
 * follow-ups asked after it are read from the live records (ask-share-link.ts SHARE_PAGE_SCRIPT,
 * never counted as a reader), for the www question page and for the answer 别人在问什么 opens in place.
 * When the database cannot say, there are none and the question stands alone.
 */
import { withPlainSourceLabels } from "./ask-source-labels.js";
import { isMoved, readShare, type SharedTurn } from "./ask-share-link.js";
import type { PageFollowUp, PublicAnswer } from "./ask-public-page.js";

const PAGE = /^https:\/\/ask\.lizheng\.ai\/s\/(\d{4}-\d{2}-\d{2})\/([a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,4})$/;

/** A follow-up as a public page shows it: the sources its answer cites, with plain source numbers. */
export function followUp(turn: SharedTurn): PageFollowUp {
  const { answer } = turn;
  const cited = new Set([
    ...answer.sections.flatMap(section => section.source_ids),
    ...[answer.summary, answer.limitations, ...answer.sections.map(section => section.body)]
      .flatMap(text => [...text.matchAll(/\[(S\d{1,2})\]/g)].map(match => match[1])),
  ]);
  const sources = answer.sources.filter(source => cited.has(source.id) && typeof source.title === "string" && typeof source.url === "string");
  return { question: turn.question, created_at: turn.created_at,
    answer: withPlainSourceLabels({ ...answer, sources } as unknown as PublicAnswer) };
}

/** The follow-ups of the conversation whose page this is (ask.lizheng.ai/s/<day>/<word>), oldest first. */
export async function followUpsOf(day: string, slug: string): Promise<PageFollowUp[]> {
  try {
    const share = await readShare(day, slug, { reader: false });
    return share && !isMoved(share) ? share.turns.map(followUp) : [];
  } catch { return []; }
}

/** The same, by the page's address; none for a question without one. */
export async function followUpsOfPage(url: unknown): Promise<PageFollowUp[]> {
  const parts = typeof url === "string" ? url.match(PAGE) : null;
  return parts ? followUpsOf(parts[1], parts[2]) : [];
}
