import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { recordUsage, USAGE_BODY_LIMIT } from "../shared/ask-usage.js";

// The pages send plain text (a beacon cannot send JSON without a preflight); Vercel may hand it over parsed.
async function input(req: IncomingMessage): Promise<Buffer> {
  const length = req.headers["content-length"];
  if (length && (typeof length !== "string" || !/^\d+$/.test(length) || Number(length) > USAGE_BODY_LIMIT))
    throw new AccessError("input_too_large", 413);
  const provided = (req as IncomingMessage & { body?: unknown }).body;
  if (provided !== undefined) {
    const raw = Buffer.isBuffer(provided) ? provided : typeof provided === "string" ? Buffer.from(provided, "utf8")
      : provided && typeof provided === "object" ? Buffer.from(JSON.stringify(provided), "utf8") : Buffer.alloc(0);
    if (raw.byteLength > USAGE_BODY_LIMIT) throw new AccessError("input_too_large", 413);
    return raw;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        let size = 0;
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += bytes.byteLength;
          if (size > USAGE_BODY_LIMIT) throw new AccessError("input_too_large", 413);
          chunks.push(bytes);
        }
        return Buffer.concat(chunks, size);
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { req.destroy(); reject(new AccessError("invalid_request", 400)); }, 2_000);
      }),
    ]);
  } finally { clearTimeout(timer); }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  for (const [name, value] of Object.entries({
    "Cache-Control": "no-store, no-transform", "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Cross-Origin-Resource-Policy": "same-origin", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff",
  })) res.setHeader(name, value);
  try {
    // Each official page counts on its own origin; a send from anywhere else is refused.
    const host = req.headers.host;
    if (host !== "www.lizheng.ai" && host !== "ask.lizheng.ai") throw new AccessError("invalid_origin", 403);
    const own = `https://${host}`;
    const url = new URL(req.url || "/", own);
    if (url.origin !== own || req.headers.origin !== own) throw new AccessError("invalid_origin", 403);
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      throw new AccessError("method_not_allowed", 405);
    }
    if ([...url.searchParams.keys()].length) throw new AccessError("invalid_request", 400);
    const headers = new Headers();
    for (const name of ["cookie", "origin", "user-agent", "x-vercel-forwarded-for", "x-forwarded-for"])
      if (typeof req.headers[name] === "string") headers.set(name, req.headers[name]);
    const cookies = await recordUsage(new Request(url, { method: "POST", headers }), await input(req));
    if (cookies.length) res.setHeader("Set-Cookie", cookies);
    res.statusCode = 204;
    res.end();
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("usage_unavailable");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
