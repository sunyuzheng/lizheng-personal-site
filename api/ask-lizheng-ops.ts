import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError, requireOpsOwner, sameOrigin } from "../shared/ask-access.js";
import { opsGatewayEnvelope, proxyOps } from "../shared/ask-ops-gateway.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store, no-transform");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Vary", "Cookie");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    if (req.headers.host !== "www.lizheng.ai")
      throw new AccessError("invalid_origin", 403);
    const url = new URL(req.url || "/", "https://www.lizheng.ai");
    if (url.origin !== "https://www.lizheng.ai" ||
        (req.headers.origin && req.headers.origin !== "https://www.lizheng.ai"))
      throw new AccessError("invalid_origin", 403);
    const headers = new Headers();
    for (const name of ["cookie", "origin"])
      if (typeof req.headers[name] === "string") headers.set(name, req.headers[name]);
    const request = new Request(url, { method: req.method || "GET", headers });
    const owner = await requireOpsOwner(request);
    const envelope = opsGatewayEnvelope(url, req.method || "GET");
    if (envelope?.action === "delete") sameOrigin(request);
    const result = envelope
      ? await proxyOps(envelope)
      : { owner: true, email: owner.email, archive_retention: "until_deleted" };
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (error) {
    const failure = error instanceof AccessError
      ? error : new AccessError("ops_gateway_unavailable");
    if (failure.status === 405) {
      const action = new URL(req.url || "/", "https://www.lizheng.ai").searchParams.get("__route") ||
        req.url?.split("?")[0].split("/").at(-1);
      res.setHeader("Allow", action === "delete" ? "POST" : "GET");
    }
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
