import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { publicJson } from "../shared/ask-public-files.js";
import { loadPublicCards, publicCardOf } from "../shared/ask-public-cards.js";
import { detailWithPlainSourceLabels, withPlainSourceLabels } from "../shared/ask-source-labels.js";
import { isMoved, readShare, type SharedTurn } from "../shared/ask-share-link.js";
import {
  indexable, publicDetail, PUBLIC_ID, relatedCards, renderIndexPage, renderMissingPage, renderQuestionPage,
  renderSitemap, representatives, similarAskings, wwwPagePath, type PageFollowUp, type PublicAnswer, type PublicCard,
} from "../shared/ask-public-page.js";

// The public answer pages on www.lizheng.ai (vercel.json): /ask/<day>/<word> (page), /ask (index)
// and /ask/sitemap.xml (sitemap), read from Ops' public index: the files Ops writes when it changes,
// so the pages stay up while the database or Ops is down (shared/ask-public-files.ts). The CDN keeps a page for ten
// minutes, so a question withdrawn in Ops leaves search results' pages within about that long.
//
// Since 2026-10-14 (the owner: ask.lizheng.ai is part of lizheng.ai; one question, its address used
// on ask.lizheng.ai, its search page on the main site) a question's page here has the address of its
// own page in 问问立正: ask.lizheng.ai/s/<day>/<word> is what people share and continue in, and points
// search engines here, at www.lizheng.ai/ask/<day>/<word>. The pages before then, /ask/<public_id>,
// move here for good (301). A question is its whole conversation (2026-10-15): the follow-ups asked
// after it come from the live records, under its answer.
const CACHE = "public, max-age=0, s-maxage=600, stale-while-revalidate=600";

/** A follow-up as the page shows it: the sources its answer cites, with plain source numbers. */
function followUp(turn: SharedTurn): PageFollowUp {
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

/** The follow-ups asked after a published question, read from its live records (2026-10-15); none
 * when the database cannot say, so the page stands on Ops' files alone. */
async function followUpsOf(day: string, slug: string): Promise<PageFollowUp[]> {
  try {
    const share = await readShare(day, slug, { reader: false });
    return share && !isMoved(share) ? share.turns.map(followUp) : [];
  } catch { return []; }
}
const POLICY = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,4}$/;

function send(res: ServerResponse, status: number, type: string, body: string, headers: Record<string, string> = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.end(body);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", "https://www.lizheng.ai");
  const route = url.searchParams.get("__route") || "";
  const html = "text/html; charset=utf-8";
  // Only www.lizheng.ai is the page's address; copies on deployment hosts stay out of search.
  const own: Record<string, string> = req.headers.host === "www.lizheng.ai" ? {} : { "X-Robots-Tag": "noindex" };
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "text/plain; charset=utf-8", "Method not allowed", { Allow: "GET, HEAD", "Cache-Control": "no-store" });
    return;
  }
  try {
    if (route === "page") {
      const missing = () => send(res, 404, html, renderMissingPage(), { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY });
      const day = url.searchParams.get("day") || "", slug = url.searchParams.get("slug") || "";
      let id = url.searchParams.get("id") || "";
      let cards: PublicCard[] | undefined;
      if (day || slug) {
        // A question by its address: the published one whose own page that is.
        if (!DAY.test(day) || !SLUG.test(slug)) { missing(); return; }
        cards = await loadPublicCards(source => res.setHeader("X-Ask-Public-Source", source));
        const card = publicCardOf(cards, `https://ask.lizheng.ai/s/${day}/${slug}`);
        if (!card) { missing(); return; }
        id = card.public_id;
      } else if (!PUBLIC_ID.test(id)) { missing(); return; }
      let detail;
      try {
        detail = publicDetail(detailWithPlainSourceLabels(await publicJson(`/api/discovery?${new URLSearchParams({ action: "detail", public_id: id })}`,
          { onSource: source => res.setHeader("X-Ask-Public-Source", source) })));
      } catch (error) {
        if (error instanceof AccessError && error.status === 404) { missing(); return; }
        throw error;
      }
      if (!detail) throw new AccessError("ops_gateway_unavailable");
      // Its page by number moves to its page by address, for good.
      const path = wwwPagePath(detail);
      if (!(day || slug) && path !== `/ask/${id}`) {
        send(res, 301, "text/plain; charset=utf-8", path, { ...own, "Cache-Control": CACHE, Location: path });
        return;
      }
      // Every question, to find its rewordings, its similar askings and what to read next.
      cards ??= await loadPublicCards().catch(() => [] as PublicCard[]);
      const reps = representatives(cards);
      const card = cards.find(other => other.public_id === id);
      send(res, 200, html, renderQuestionPage(detail, {
        card, related: relatedCards(detail, cards), similar: card ? similarAskings(card, cards, reps) : 0,
        indexable: indexable(detail, reps.get(id)), followUps: await followUpsOf(day, slug),
      }), { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY });
      return;
    }
    if (route === "index") {
      send(res, 200, html, renderIndexPage(await loadPublicCards(source => res.setHeader("X-Ask-Public-Source", source))), { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY });
      return;
    }
    if (route === "sitemap") {
      send(res, 200, "application/xml; charset=utf-8", renderSitemap(await loadPublicCards(source => res.setHeader("X-Ask-Public-Source", source))),
        { ...own, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600" });
      return;
    }
    send(res, 404, html, renderMissingPage(), { ...own, "Cache-Control": "no-store", "Content-Security-Policy": POLICY });
  } catch {
    // Ops did not answer: ask crawlers to come back rather than cache an error.
    send(res, 503, "text/plain; charset=utf-8", "问问立正的问题列表暂时读不到，请稍后再试。", { ...own, "Cache-Control": "no-store", "Retry-After": "120" });
  }
}
