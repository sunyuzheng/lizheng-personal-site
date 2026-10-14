import type { IncomingMessage, ServerResponse } from "node:http";

// The answer map's layout (ask-lizheng's /api/answer-map: every public material's light), for
// ask.lizheng.ai's start screen and answers, the homepage's Ask section and the shared pages, routed
// by vercel.json from /api/ask-lizheng/answer-map and ask.lizheng.ai's /api/answer-map. It is the
// same for everyone, so the edge keeps this function's answer an hour and then serves it stale while
// one request refreshes it: the map draws at once even while Builder sleeps. (Vercel does not keep
// Builder's own answer when vercel.json passes the request straight through.)
export const ANSWER_MAP_SOURCE = "https://ask-lizheng.ai-builders.space/api/answer-map";
export const ANSWER_MAP_CACHE = "public, max-age=600, s-maxage=3600, stale-while-revalidate=604800";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.setHeader("Cache-Control", "no-store");
    res.end();
    return;
  }
  try {
    const response = await fetch(ANSWER_MAP_SOURCE, { signal: AbortSignal.timeout(25_000), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`answer map ${response.status}`);
    const body = await response.text();
    const layout = JSON.parse(body);
    if (!Array.isArray(layout?.keys) || typeof layout?.kinds !== "string") throw new Error("answer map shape");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", ANSWER_MAP_CACHE);
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    // Nothing kept: the next request asks again; the pages show no map meanwhile.
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "30");
    res.end(JSON.stringify({ code: "unavailable" }));
  }
}
