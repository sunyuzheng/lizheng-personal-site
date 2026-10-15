import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { publicJson, type PublicSource } from "../shared/ask-public-files.js";
import { followUpsOf } from "../shared/ask-conversation.js";
import { detailWithPlainSourceLabels } from "../shared/ask-source-labels.js";
import {
  indexable, listable, publicCard, publicDayFile, publicDaysFile, publicDetail, publicTopicFile, PUBLIC_ID, relatedOf,
  renderDayPage, renderDaySitemap, renderIndexPage, renderMissingPage, renderQuestionPage, renderSitemapIndex, wwwPagePath,
  type PublicCard, type PublicDayFile,
} from "../shared/ask-public-page.js";

// The public answer pages on www.lizheng.ai (vercel.json): /ask/<day>/<word> (page), /ask (index),
// /ask/<day> (day), /ask/sitemap.xml (sitemap, one per day) and /ask/sitemap/<day>.xml (daysitemap),
// read from the files Ops writes when they change, so the pages stay up while the database or Ops is
// down (shared/ask-public-files.ts). The CDN keeps a page for ten minutes, so a question withdrawn in
// Ops leaves search results' pages within about that long.
//
// Since 2026-10-14 (the owner: ask.lizheng.ai is part of lizheng.ai; one question, its address used
// on ask.lizheng.ai, its search page on the main site) a question's page here has the address of its
// own page in 问问立正: ask.lizheng.ai/s/<day>/<word> is what people share and continue in, and points
// search engines here, at www.lizheng.ai/ask/<day>/<word>. The pages before then, /ask/<public_id>,
// move here for good (301). A question is its whole conversation (2026-10-15): the follow-ups asked
// after it come from the live records, under its answer.
//
// Since 2026-10-15 (the owner: assume 100,000 and 1,000,000 public answers; nothing computed for
// each visit) no page reads every question: a question's page reads its own file, its topic's and
// the lists'; /ask the list of days and the newest days'; a day, and its sitemap, that day's.
const CACHE = "public, max-age=0, s-maxage=600, stale-while-revalidate=600";
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
  const heard = (source: PublicSource) => res.setHeader("X-Ask-Public-Source", source);
  const read = (query: Record<string, string>) => publicJson(`/api/discovery?${new URLSearchParams(query)}`, { onSource: heard });
  // A file that may be missing (a day or topic with nothing public): null; Ops not answering still fails.
  const optional = async <T>(query: Record<string, string>, parse: (value: unknown) => T | null) => {
    try { return parse(await read(query)); }
    catch (error) { if (error instanceof AccessError && error.status === 404) return null; throw error; }
  };
  const days = async () => {
    const value = publicDaysFile(await read({ action: "days" }));
    if (!value) throw new AccessError("ops_gateway_unavailable");
    return value;
  };
  const page = { ...own, "Cache-Control": CACHE, "Content-Security-Policy": POLICY };
  try {
    if (route === "page") {
      const missing = () => send(res, 404, html, renderMissingPage(), page);
      const day = url.searchParams.get("day") || "", slug = url.searchParams.get("slug") || "";
      const id = url.searchParams.get("id") || "";
      // A question by its address (the published one whose own page that is), or by its number before 2026-10-14.
      if (day || slug ? !DAY.test(day) || !SLUG.test(slug) : !PUBLIC_ID.test(id)) { missing(); return; }
      let detail;
      try {
        detail = publicDetail(detailWithPlainSourceLabels(await read(day || slug ? { action: "page", day, slug } : { action: "detail", public_id: id })));
      } catch (error) {
        if (error instanceof AccessError && error.status === 404) { missing(); return; }
        throw error;
      }
      if (!detail) throw new AccessError("ops_gateway_unavailable");
      // Its page by number moves to its page by address, for good.
      const path = wwwPagePath(detail);
      if (path !== (day || slug ? `/ask/${day}/${slug}` : `/ask/${id}`)) {
        send(res, 301, "text/plain; charset=utf-8", path, { ...own, "Cache-Control": CACHE, Location: path });
        return;
      }
      // What to read next: its topic's newest and the newest asked; the page stands without them.
      const [topic, lists, followUps] = await Promise.all([
        optional({ action: "topic", topic_key: detail.topic_key }, publicTopicFile).catch(() => null),
        read({ action: "lists" }).catch(() => null),
        day ? followUpsOf(day, slug) : Promise.resolve([]),
      ]);
      const recent = Array.isArray(lists?.recent) ? lists.recent.map(publicCard).filter((card: PublicCard | null): card is PublicCard => !!card) : [];
      send(res, 200, html, renderQuestionPage(detail, {
        related: relatedOf(detail, topic, recent), similar: topic?.count ?? 0, indexable: indexable(detail), followUps,
      }), page);
      return;
    }
    if (route === "index") {
      // The newest questions: the newest days' until a hundred are listed, at most a week of days.
      const all = await days(), newest: PublicCard[] = [];
      for (const { day } of all.days.slice(0, 7)) {
        if (newest.filter(listable).length >= 100) break;
        const file = await optional({ action: "day", day }, publicDayFile);
        if (file) newest.push(...file.cards);
      }
      send(res, 200, html, renderIndexPage(all, newest.filter(listable).slice(0, 200)), page);
      return;
    }
    if (route === "day" || route === "daysitemap") {
      const day = url.searchParams.get("day") || "";
      const file: PublicDayFile | null = DAY.test(day) ? await optional({ action: "day", day }, publicDayFile) : null;
      if (route === "day") {
        if (!file) { send(res, 404, html, renderMissingPage("day"), page); return; }
        send(res, 200, html, renderDayPage(file, await days().catch(() => null)), page);
        return;
      }
      if (!file) { send(res, 404, "text/plain; charset=utf-8", "Not found", { ...own, "Cache-Control": CACHE }); return; }
      const all = await days();
      send(res, 200, "application/xml; charset=utf-8", renderDaySitemap(file, all.days[0]?.day === day),
        { ...own, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600" });
      return;
    }
    if (route === "sitemap") {
      send(res, 200, "application/xml; charset=utf-8", renderSitemapIndex(await days()),
        { ...own, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600" });
      return;
    }
    send(res, 404, html, renderMissingPage(), { ...own, "Cache-Control": "no-store", "Content-Security-Policy": POLICY });
  } catch {
    // Ops did not answer: ask crawlers to come back rather than cache an error.
    send(res, 503, "text/plain; charset=utf-8", "问问立正的问题列表暂时读不到，请稍后再试。", { ...own, "Cache-Control": "no-store", "Retry-After": "120" });
  }
}
