import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError, resolveDiscoveryVoter, sameOrigin } from "../shared/ask-access.js";
import { discoveryReadPath, discoveryRequestBody, discoveryVoteBody, proxyDiscoveryVote } from "../shared/ask-discovery-gateway.js";
import { fetchOpsJson } from "../shared/ask-ops-gateway.js";
import { publicJson } from "../shared/ask-public-files.js";
import { detailWithPlainSourceLabels } from "../shared/ask-source-labels.js";

// The lists and each answer are the same for every reader and carry no cookie, so the CDN keeps them
// a minute, then serves that copy while it fetches the next: a reader costs Ops nothing, and a
// question withdrawn in Ops leaves the lists and its answer within about two minutes. They come from
// the files Ops writes when they change (shared/ask-public-files.ts), so they stay up while the
// database or Ops is down; the older paged list still asks Ops.
const SHARED = "public, max-age=0, s-maxage=60, stale-while-revalidate=60";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  for (const [name, value] of Object.entries({
    "Cache-Control": "no-store, no-transform", "X-Robots-Tag": "noindex, nofollow, noarchive", "Vary": "Cookie",
    "Cross-Origin-Resource-Policy": "same-origin", "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff", "Content-Type": "application/json; charset=utf-8",
  })) res.setHeader(name, value);
  let action = "";
  try {
    // Both official pages read the public list from their own origin; neither answers for the other.
    const host = req.headers.host;
    if (host !== "www.lizheng.ai" && host !== "ask.lizheng.ai") throw new AccessError("invalid_origin", 403);
    const own = `https://${host}`;
    const url = new URL(req.url || "/", own);
    if (url.origin !== own || (req.headers.origin && req.headers.origin !== own))
      throw new AccessError("invalid_origin", 403);
    action = url.searchParams.get("__route") || url.pathname.split("/").at(-1) || "";
    if (!["lists", "questions", "detail", "vote"].includes(action)) throw new AccessError("invalid_request", 400);
    if (req.method !== (action === "vote" ? "POST" : "GET")) throw new AccessError("method_not_allowed", 405);
    let result;
    if (action === "vote") {
      // Anyone may like, counted by browser (ask-access.ts resolveDiscoveryVoter); the network is
      // read only to cap likes, never kept.
      const headers = new Headers();
      for (const name of ["cookie", "origin", "x-vercel-forwarded-for", "x-forwarded-for"])
        if (typeof req.headers[name] === "string") headers.set(name, req.headers[name]);
      const request = new Request(url, { method: "POST", headers });
      sameOrigin(request);
      for (const key of url.searchParams.keys())
        if (key !== "__route" || url.searchParams.getAll(key).length !== 1) throw new AccessError("invalid_request", 400);
      const vote = discoveryVoteBody(await discoveryRequestBody(req, 2048));
      const { voter, cookie } = await resolveDiscoveryVoter(request, vote.vote ? { publicId: vote.public_id } : undefined);
      if (cookie) res.setHeader("Set-Cookie", cookie);
      result = await proxyDiscoveryVote(vote, voter);
    } else {
      result = await (action === "questions" ? fetchOpsJson(discoveryReadPath(url, action), { method: "GET" })
        : publicJson(discoveryReadPath(url, action), { onSource: source => res.setHeader("X-Ask-Public-Source", source) }));
      if (action === "detail") result = detailWithPlainSourceLabels(result);
      if (action !== "questions") { res.setHeader("Cache-Control", SHARED); res.removeHeader("Vary"); }
    }
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("ops_gateway_unavailable");
    if (failure.status === 405) res.setHeader("Allow", action === "vote" ? "POST" : "GET");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
