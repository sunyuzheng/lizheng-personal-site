/**
 * Every published question's card, read once from Ops' public index (the files Ops writes when it
 * changes, shared/ask-public-files.ts) and kept for five minutes in a warm function, so a crawl of many
 * pages, or many readers of the answers' own pages, read it once.
 *
 * The public answer pages on www.lizheng.ai use it to list, link and find a question by its address,
 * and ask.lizheng.ai's answer pages to tell whether an answer is one of them (its search page is then
 * on www.lizheng.ai, 2026-10-14).
 */
import { AccessError } from "./ask-access.js";
import { publicJson, type PublicSource } from "./ask-public-files.js";
import { publicCard, wwwPagePath, type PublicCard } from "./ask-public-page.js";

let memo: { at: number; cards: PublicCard[]; source: PublicSource } | undefined;

export async function loadPublicCards(onSource: (source: PublicSource) => void = () => {}): Promise<PublicCard[]> {
  if (memo && Date.now() - memo.at < 300_000) { onSource(memo.source); return memo.cards; }
  let source: PublicSource = "ops";
  const value = await publicJson("/api/discovery?action=index", { onSource: heard => { source = heard; } });
  onSource(source);
  if (!Array.isArray(value.items)) throw new AccessError("ops_gateway_unavailable");
  const cards: PublicCard[] = [];
  for (const item of value.items) { const card = publicCard(item); if (card) cards.push(card); }
  memo = { at: Date.now(), cards, source };
  return cards;
}

/** The published question whose own page is this answer page (ask.lizheng.ai/s/<day>/<word>), if any. */
export function publicCardOf(cards: PublicCard[], shareUrl: string): PublicCard | undefined {
  return cards.find(card => card.share_url === shareUrl);
}

/** Its search page on www.lizheng.ai, when this answer page is a published question's. */
export async function wwwPageOf(shareUrl: string): Promise<string | null> {
  try {
    const card = publicCardOf(await loadPublicCards(), shareUrl);
    return card ? `https://www.lizheng.ai${wwwPagePath(card)}` : null;
  } catch { return null; }
}

/** For tests: forget what was read. */
export function forgetPublicCards() { memo = undefined; }
