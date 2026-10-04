import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError, accessEnabled, resolveIdentity } from "../shared/ask-access.js";
import { discoveryRequestBody } from "../shared/ask-discovery-gateway.js";
import { claimShareBonus, createShare, listShares, readShare, SHARE_BODY_LIMIT, shareRequest, type ShareBonus } from "../shared/ask-share-link.js";
import { renderShareMissingPage, renderSharePage, renderShareSitemap } from "../shared/ask-share-page.js";
import { fileWriter, readShareCopy, saveShareCopy } from "../shared/ask-public-files.js";

// 分享这条回答 (shared/ask-share-link.ts), routed by vercel.json:
//   POST /api/ask-lizheng/share on www.lizheng.ai and ask.lizheng.ai, from the page itself;
//   GET ask.lizheng.ai/s/<date>/<word> (page) and ask.lizheng.ai/s/sitemap.xml (sitemap).
const POLICY = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' https://www.lizheng.ai data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
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
    let share;
    try {
      share = await readShare(day, slug, { reader: req.method === "GET" && !NOT_A_READER.test(String(req.headers["user-agent"] || "x-bot")) });
    } catch (error) {
      // The database cannot say: the copy kept when it was shared (Ops deletes it before the record).
      share = await readShareCopy(day, slug);
      if (!share) throw error;
    }
    if (!share) send(res, 404, html, renderShareMissingPage(), headers);
    else send(res, 200, html, renderSharePage(share), headers);
  } catch {
    send(res, 503, "text/plain; charset=utf-8", "这个分享暂时打不开，请稍后再试。", { ...own, "Cache-Control": "no-store", "Retry-After": "60" });
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const host = String(req.headers.host || "");
  const url = new URL(req.url || "/", `https://${host || "ask.lizheng.ai"}`);
  const route = url.searchParams.get("__route") || "";
  if (route === "page") return page(req, res, url);
  if (route === "sitemap") {
    try {
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
    // A copy for when the database is down (shared/ask-public-files.ts); the link stands without it.
    const write = fileWriter();
    if (write) {
      try {
        const share = await readShare(shared.day, shared.slug, { reader: false });
        if (share) await saveShareCopy(share, write);
      } catch { /* the page reads the live record */ }
    }
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
