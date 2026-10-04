import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { fetchOpsJson } from "../shared/ask-ops-gateway.js";
import {
  indexable, publicCard, publicDetail, PUBLIC_ID, relatedCards, renderIndexPage, renderMissingPage, renderQuestionPage,
  renderSitemap, representatives, similarAskings, type PublicCard,
} from "../shared/ask-public-page.js";

// The public answer pages on www.lizheng.ai (vercel.json): /ask/<public_id> (page), /ask (index)
// and /ask/sitemap.xml (sitemap), read from Ops' public index. The CDN keeps a page for ten
// minutes, so a question withdrawn in Ops leaves search results' pages within about that long.
const CACHE = "public, max-age=0, s-maxage=600, stale-while-revalidate=600";
const POLICY = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
// Every published card, newest first, in one read of Ops' index, kept for five minutes in a warm
// function so a crawl of many pages reads it once.
let memo: { at: number; cards: PublicCard[] } | undefined;
async function loadCards(): Promise<PublicCard[]> {
  if (memo && Date.now() - memo.at < 300_000) return memo.cards;
  const value = await fetchOpsJson("/api/discovery?action=index", { method: "GET" });
  if (!Array.isArray(value.items)) throw new AccessError("ops_gateway_unavailable");
  const cards: PublicCard[] = [];
  for (const item of value.items) { const card = publicCard(item); if (card) cards.push(card); }
  memo = { at: Date.now(), cards };
  return cards;
}

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
      const id = url.searchParams.get("id") || "";
      if (!PUBLIC_ID.test(id)) {
        send(res, 404, html, renderMissingPage(), { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY });
        return;
      }
      let detail;
      try {
        detail = publicDetail(await fetchOpsJson(`/api/discovery?${new URLSearchParams({ action: "detail", public_id: id })}`, { method: "GET" }));
      } catch (error) {
        if (error instanceof AccessError && error.status === 404) {
          send(res, 404, html, renderMissingPage(), { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY });
          return;
        }
        throw error;
      }
      if (!detail) throw new AccessError("ops_gateway_unavailable");
      // Every question, to find its rewordings, its similar askings and what to read next.
      const cards = await loadCards().catch(() => [] as PublicCard[]);
      const reps = representatives(cards);
      const card = cards.find(other => other.public_id === id);
      send(res, 200, html, renderQuestionPage(detail, {
        card, related: relatedCards(detail, cards), similar: card ? similarAskings(card, cards, reps) : 0,
        indexable: indexable(detail, reps.get(id)),
      }), { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY });
      return;
    }
    if (route === "index") {
      send(res, 200, html, renderIndexPage(await loadCards()), { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY });
      return;
    }
    if (route === "sitemap") {
      send(res, 200, "application/xml; charset=utf-8", renderSitemap(await loadCards()),
        { ...own, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600" });
      return;
    }
    send(res, 404, html, renderMissingPage(), { ...own, "Cache-Control": "no-store", "Content-Security-Policy": POLICY });
  } catch {
    // Ops did not answer: ask crawlers to come back rather than cache an error.
    send(res, 503, "text/plain; charset=utf-8", "问问立正的问题列表暂时读不到，请稍后再试。", { ...own, "Cache-Control": "no-store", "Retry-After": "120" });
  }
}
