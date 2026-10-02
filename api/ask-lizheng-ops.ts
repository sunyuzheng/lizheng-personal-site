import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError, requireOpsOwner } from "../shared/ask-access.js";
import { opsRange, opsRecords, opsSummary } from "../shared/ask-ops-reader.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store, no-transform");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Vary", "Cookie");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); throw new AccessError("method_not_allowed", 405); }
    if (req.headers.host !== "www.lizheng.ai") throw new AccessError("invalid_origin", 403);
    const url = new URL(req.url || "/", "https://www.lizheng.ai");
    if (url.origin !== "https://www.lizheng.ai") throw new AccessError("invalid_origin", 403);
    if (req.headers.origin && req.headers.origin !== "https://www.lizheng.ai") throw new AccessError("invalid_origin", 403);
    const headers = new Headers();
    if (typeof req.headers.cookie === "string") headers.set("Cookie", req.headers.cookie);
    const owner = await requireOpsOwner(new Request(url, { headers }));
    const action = url.searchParams.get("__route") || url.pathname.split("/").at(-1);
    if (!["session", "summary", "records", "export"].includes(action || "")) throw new AccessError("invalid_request", 400);
    let result: unknown;
    if (action === "session") result = { owner: true, email: owner.email, retention_days: 30 };
    else {
      const range = opsRange(url.searchParams.get("range") ?? "7");
      if (action === "summary") result = await opsSummary(range);
      else result = await opsRecords(range, action === "export" ? 100 : 25, url.searchParams.has("cursor") ? url.searchParams.get("cursor")! : undefined);
    }
    res.statusCode = 200; res.end(JSON.stringify(result));
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("ops_read_unavailable");
    res.statusCode = failure.status; res.end(JSON.stringify({ code: failure.code }));
  }
}
