import type { IncomingMessage, ServerResponse } from "node:http";
import { AccessError } from "../shared/ask-access.js";
import { OPS_BACKEND_ORIGIN } from "../shared/ask-ops-gateway.js";

const ASSET = /^[A-Za-z0-9_-]+-[A-Za-z0-9_-]{6,32}\.(js|css)$/;
const DEADLINE_MS = 20_000;
const HTML_LIMIT = 1_000_000;
const ASSET_LIMIT = 4_400_000;
function unavailable() { return new AccessError("ops_page_unavailable"); }

async function staticBody(asset: string | null): Promise<Buffer> {
  if (process.env.ASK_OPS_BACKEND_ORIGIN !== undefined &&
      process.env.ASK_OPS_BACKEND_ORIGIN !== OPS_BACKEND_ORIGIN) throw unavailable();
  const controller = new AbortController();
  const signal = AbortSignal.any([AbortSignal.timeout(DEADLINE_MS), controller.signal]);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(unavailable()); }, DEADLINE_MS);
  });
  const operation = async () => {
    // Never inherit browser headers, cookies, URL query parameters or auth.
    const response = await fetch(`${OPS_BACKEND_ORIGIN}/${asset ? `assets/${asset}` : ""}`, {
      method: "GET", cache: "no-store", redirect: "manual", credentials: "omit", signal,
    });
    const expectedType = asset?.endsWith(".css") ? /^text\/css\b/i : asset
      ? /^(?:text|application)\/javascript\b/i : /^text\/html\b/i;
    if (signal.aborted || response.status !== 200 || !response.body ||
        !expectedType.test(response.headers.get("content-type") || "")) {
      void response.body?.cancel().catch(() => {});
      throw unavailable();
    }
    const limit = asset ? ASSET_LIMIT : HTML_LIMIT;
    const length = response.headers.get("content-length");
    if (length && (!/^\d+$/.test(length) || Number(length) > limit)) {
      void response.body.cancel().catch(() => {});
      throw unavailable();
    }
    reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (signal.aborted) throw unavailable();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > limit) throw unavailable();
        chunks.push(Buffer.from(value));
      }
      return Buffer.concat(chunks, bytes);
    } catch (error) {
      void reader.cancel().catch(() => {});
      throw error;
    } finally {
      reader.releaseLock();
      reader = undefined;
    }
  };
  try { return await Promise.race([operation(), deadline]); }
  catch {
    controller.abort();
    if (reader) void reader.cancel().catch(() => {});
    throw unavailable();
  } finally { clearTimeout(timer); }
}

/** Public login shell and built JS/CSS only; owner data remains in the auth API. */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  for (const [name, value] of Object.entries({
    "Cache-Control": "no-store, no-transform", "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Vary": "Cookie", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY",
    "Cross-Origin-Resource-Policy": "same-origin", "X-Content-Type-Options": "nosniff",
  })) res.setHeader(name, value);
  try {
    if (req.headers.host !== "www.lizheng.ai") throw new AccessError("invalid_origin", 403);
    const url = new URL(req.url || "/", "https://www.lizheng.ai");
    if (url.origin !== "https://www.lizheng.ai") throw new AccessError("invalid_origin", 403);
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      throw new AccessError("method_not_allowed", 405);
    }
    const asset = url.searchParams.get("__asset");
    for (const key of url.searchParams.keys()) {
      if (!["__asset", "ask_login"].includes(key) || url.searchParams.getAll(key).length !== 1 ||
          (key === "ask_login" && (asset !== null || url.searchParams.get(key) !== "done")))
        throw new AccessError("invalid_request", 400);
    }
    if (asset !== null && !ASSET.test(asset)) throw new AccessError("invalid_request", 400);
    const body = await staticBody(asset);
    res.setHeader("Content-Type", asset?.endsWith(".css") ? "text/css; charset=utf-8" : asset
      ? "application/javascript; charset=utf-8" : "text/html; charset=utf-8");
    res.setHeader("Content-Length", body.byteLength);
    res.statusCode = 200;
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    const failure = error instanceof AccessError ? error : unavailable();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.statusCode = failure.status;
    res.end(req.method === "HEAD" ? undefined : JSON.stringify({ code: failure.code }));
  }
}
