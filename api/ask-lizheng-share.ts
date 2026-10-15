import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError, accessEnabled, resolveIdentity } from "../shared/ask-access.js";
import { discoveryRequestBody } from "../shared/ask-discovery-gateway.js";
import { claimShareBonus, countShare, countShareView, createShare, isMoved, listShares, readShare, SHARE_BODY_LIMIT, shareRequest, shareUrl, type ShareBonus } from "../shared/ask-share-link.js";
import { renderPublicAnswerPage, renderShareMissingPage, renderSharePage, renderShareSitemap } from "../shared/ask-share-page.js";
import { copySharedAnswer, publicJson, readShareCopy } from "../shared/ask-public-files.js";
import { publicDetail, PUBLIC_ID, wwwPagePath } from "../shared/ask-public-page.js";
import { detailWithPlainSourceLabels, withPlainSourceLabels } from "../shared/ask-source-labels.js";

// 分享这条回答 (shared/ask-share-link.ts), routed by vercel.json:
//   POST /api/ask-lizheng/share on www.lizheng.ai and ask.lizheng.ai, from the page itself;
//   GET ask.lizheng.ai/s/<date>/<word> (page) and ask.lizheng.ai/s/sitemap.xml (sitemap); a page of a
//   question published on 别人在问什么 points search engines at its page on www.lizheng.ai (same
//   address, /ask/<date>/<word>), whose sitemap lists it instead (2026-10-14); a page is a whole
//   conversation, and a follow-up's own address from before 2026-10-15 moves to it (301);
//   GET ask.lizheng.ai/q/<id> (public): a question from 别人在问什么, as its card shared it before
//   2026-10-14: it goes to the question's own page (share_url), or shows the answer if it has none.
// The page is ask.lizheng.ai's own (shared/ask-share-page.ts): its scripts, its API on this origin,
// and the small title-font slices its stylesheet carries inline (data:).
const POLICY = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' https://www.lizheng.ai data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
// Crawlers and link previews read the page, but are not readers to count.
const NOT_A_READER = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|whatsapp|telegram|skype/i;
// The pages leave the bonus out inside WeChat and the iPhone app; so does the server.
const NO_BONUS = /MicroMessenger|AskLizhengApp\//i;

function send(res: ServerResponse, status: number, type: string, body: string, headers: Record<string, string> = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.end(body);
}

/** Its search page on www.lizheng.ai, when this answer page is a published question's: read by the
 * page's address (one file, 2026-10-15; until then every public question was read to find it). */
async function wwwPageOf(day: string, slug: string): Promise<string | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^[a-z0-9]{1,40}(?:-[a-z0-9]{1,40}){0,4}$/.test(slug)) return null;
  try {
    const detail = publicDetail(await publicJson(`/api/discovery?${new URLSearchParams({ action: "page", day, slug })}`));
    return detail ? `https://www.lizheng.ai${wwwPagePath(detail)}` : null;
  } catch { return null; }
}

async function page(req: IncomingMessage, res: ServerResponse, url: URL) {
  const html = "text/html; charset=utf-8";
  // Only ask.lizheng.ai is the pages' address; copies on deployment hosts stay out of search.
  const own: Record<string, string> = req.headers.host === "ask.lizheng.ai" ? {} : { "X-Robots-Tag": "noindex" };
  // A deleted record's page is gone at once, so the page is never kept anywhere.
  const headers = { ...own, "Cache-Control": "no-store", "Content-Security-Policy": POLICY };
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "text/plain; charset=utf-8", "Method not allowed", { Allow: "GET, HEAD", "Cache-Control": "no-store" });
    return;
  }
  try {
    const day = url.searchParams.get("day") || "", slug = url.searchParams.get("slug") || "";
    // Whether this is a question published on 别人在问什么, whose search page is on www.lizheng.ai.
    const searchPage = wwwPageOf(day, slug);
    let share;
    try {
      share = await readShare(day, slug, { reader: req.method === "GET" && !NOT_A_READER.test(String(req.headers["user-agent"] || "x-bot")) });
    } catch (error) {
      // The database cannot say: the copy kept when it was shared (Ops deletes it before the record).
      share = await readShareCopy(day, slug);
      if (!share) throw error;
    }
    if (!share) send(res, 404, html, renderShareMissingPage(), headers);
    // A follow-up's own page from before 2026-10-15 is now its conversation's (one conversation, one address).
    else if (isMoved(share)) {
      const to = shareUrl(share.moved.day, share.moved.slug);
      send(res, 301, "text/plain; charset=utf-8", to, { ...headers, Location: to });
    } else send(res, 200, html, renderSharePage({ ...share, answer: withPlainSourceLabels(share.answer),
      turns: share.turns.map(turn => ({ ...turn, answer: withPlainSourceLabels(turn.answer) })) }, { searchPage: await searchPage }), headers);
  } catch {
    send(res, 503, "text/plain; charset=utf-8", "这个分享暂时打不开，请稍后再试。", { ...own, "Cache-Control": "no-store", "Retry-After": "60" });
  }
}

// A public question on the same page (shared/ask-share-page.ts renderPublicAnswerPage), read from the
// files Ops writes as /ask/<id> reads it; never kept, so one withdrawn in Ops is gone at once.
async function publicAnswer(req: IncomingMessage, res: ServerResponse, url: URL) {
  const html = "text/html; charset=utf-8";
  const own: Record<string, string> = req.headers.host === "ask.lizheng.ai" ? {} : { "X-Robots-Tag": "noindex" };
  const headers = { ...own, "Cache-Control": "no-store", "Content-Security-Policy": POLICY };
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "text/plain; charset=utf-8", "Method not allowed", { Allow: "GET, HEAD", "Cache-Control": "no-store" });
    return;
  }
  try {
    const id = url.searchParams.get("id") || "";
    if (!PUBLIC_ID.test(id)) { send(res, 404, html, renderShareMissingPage(true), headers); return; }
    let detail;
    try {
      detail = publicDetail(detailWithPlainSourceLabels(await publicJson(`/api/discovery?${new URLSearchParams({ action: "detail", public_id: id })}`,
        { onSource: source => res.setHeader("X-Ask-Public-Source", source) })));
    } catch (error) {
      if (error instanceof AccessError && error.status === 404) { send(res, 404, html, renderShareMissingPage(true), headers); return; }
      throw error;
    }
    if (!detail) throw new AccessError("ops_gateway_unavailable");
    // Its own page counts its readers.
    if (detail.share_url) {
      send(res, 308, "text/plain; charset=utf-8", detail.share_url, { ...own, "Cache-Control": "no-store", Location: detail.share_url });
      return;
    }
    if (req.method === "GET" && !NOT_A_READER.test(String(req.headers["user-agent"] || "x-bot"))) {
      try { await countShareView(); } catch { /* A missed count never fails the page. */ }
    }
    send(res, 200, html, renderPublicAnswerPage(detail), headers);
  } catch {
    send(res, 503, "text/plain; charset=utf-8", "这条问答暂时打不开，请稍后再试。", { ...own, "Cache-Control": "no-store", "Retry-After": "60" });
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const host = String(req.headers.host || "");
  const url = new URL(req.url || "/", `https://${host || "ask.lizheng.ai"}`);
  const route = url.searchParams.get("__route") || "";
  if (route === "page") return page(req, res, url);
  if (route === "public") return publicAnswer(req, res, url);
  if (route === "sitemap") {
    try {
      // A question published on 别人在问什么 is in www.lizheng.ai's sitemap, at its page there (listShares leaves it out).
      send(res, 200, "application/xml; charset=utf-8", renderShareSitemap(await listShares()),
        { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600" });
    } catch {
      send(res, 503, "text/plain; charset=utf-8", "Unavailable", { "Cache-Control": "no-store", "Retry-After": "120" });
    }
    return;
  }
  for (const [name, value] of Object.entries({
    "Cache-Control": "no-store, no-transform", "X-Robots-Tag": "noindex, nofollow, noarchive", "Vary": "Cookie",
    "Cross-Origin-Resource-Policy": "same-origin", "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff", "Content-Type": "application/json; charset=utf-8",
  })) res.setHeader(name, value);
  try {
    // Each official page shares from its own origin; nothing else may.
    if (host !== "www.lizheng.ai" && host !== "ask.lizheng.ai") throw new AccessError("invalid_origin", 403);
    const own = `https://${host}`;
    if (url.origin !== own || req.headers.origin !== own) throw new AccessError("invalid_origin", 403);
    if (route !== "share") throw new AccessError("invalid_request", 400);
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      throw new AccessError("method_not_allowed", 405);
    }
    for (const key of url.searchParams.keys())
      if (key !== "__route" || url.searchParams.getAll(key).length !== 1) throw new AccessError("invalid_request", 400);
    const request = shareRequest(await discoveryRequestBody(req, SHARE_BODY_LIMIT), host);
    const shared = await createShare(request);
    // Made as the answer arrived, then shared now: counted here (a new address counts as it is made).
    if (!request.auto && !shared.first) {
      try { await countShare(request.surface); } catch { /* A missed count never fails the share. */ }
    }
    // A copy for when the database is down (shared/ask-public-files.ts); the link stands without it.
    await copySharedAnswer(shared.day, shared.slug);
    let bonus: ShareBonus = "off", remaining: number | undefined;
    if (request.bonus && accessEnabled() && !NO_BONUS.test(String(req.headers["user-agent"] || ""))) {
      try {
        const headers = new Headers();
        for (const name of ["cookie", "origin"])
          if (typeof req.headers[name] === "string") headers.set(name, req.headers[name]);
        const identity = await resolveIdentity(new Request(url, { method: "POST", headers }));
        if (identity.cookie) res.setHeader("Set-Cookie", identity.cookie);
        ({ bonus, remaining } = await claimShareBonus(identity, request.surface));
      } catch { /* The link stands; the question back waits for another share. */ }
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ url: shared.url, bonus, ...(remaining === undefined ? {} : { remaining }) }));
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("share_unavailable");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
