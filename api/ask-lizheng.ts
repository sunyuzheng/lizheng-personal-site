/** Fixed-destination streaming relay. Model credentials and retrieval stay in Builder. */
import { AccessError, accessEnabled, admission, backendOrigin, NetworkQuotaError, reserveGuestNetwork, resolveIdentity, resolveOpsVisitor, sameOrigin } from "../shared/ask-access";
export const config = { runtime: "edge" };

const HEADERS = { "Cache-Control": "no-store, no-transform" };
const HEARTBEAT_MS = 5_000;
const FRAME_LIMIT = 512_000;
const encoder = new TextEncoder();
// Padding helps small streaming writes flush through intermediary buffers.
const heartbeat = encoder.encode(
  ": relay keep-alive " + " ".repeat(2_048) + "\n\n"
);

function streamFailure(code: string): Uint8Array {
  return encoder.encode(
    "event: error\ndata: " +
      JSON.stringify({
        code,
        message: "The answer did not finish. Try again shortly.",
      }) +
      "\n\n"
  );
}

function terminalFrame(frame: Uint8Array): boolean {
  let event = "";
  let start = 0;
  for (let i = 0; i < frame.length; i++) {
    if (frame[i] !== 10) continue;
    if (
      i - start >= 6 &&
      i - start <= 80 &&
      frame[start] === 101 &&
      frame[start + 1] === 118 &&
      frame[start + 2] === 101 &&
      frame[start + 3] === 110 &&
      frame[start + 4] === 116 &&
      frame[start + 5] === 58
    ) {
      event = new TextDecoder().decode(frame.subarray(start + 6, i)).trim();
    }
    start = i + 1;
  }
  return event === "result" || event === "error";
}

function failure(status: number, code: string): Response {
  return Response.json(
    { code, message: code === "ops_storage_unavailable" ? "未能确认问题保存，这次没有开始生成，也不扣次数。请重试。" : "The answer did not finish. Try again shortly." },
    { status, headers: HEADERS }
  );
}

async function boundedQuotaBody(response: Response): Promise<Record<string, unknown> | null> {
  if (!response.body) return null;
  const reader = response.body.getReader();
  let expired = false, size = 0;
  const chunks: Uint8Array[] = [];
  const timer = setTimeout(() => { expired = true; void reader.cancel().catch(() => {}); }, 1_500);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (expired) return null;
      if (done) break;
      size += value.byteLength;
      if (size > 4_096) { void reader.cancel().catch(() => {}); return null; }
      chunks.push(value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    const value = JSON.parse(new TextDecoder().decode(body));
    return value && typeof value === "object" ? value : null;
  } catch { return null; }
  finally { clearTimeout(timer); reader.releaseLock(); }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return failure(405, "method_not_allowed");
  let guestCookie: string | undefined;
  let releaseNetwork: (() => Promise<void>) | undefined;
  const reply = (response: Response) => {
    if (guestCookie) response.headers.append("Set-Cookie", guestCookie);
    return response;
  };
  const abort = new AbortController();
  const disconnected = () => abort.abort();
  request.signal.addEventListener("abort", disconnected, { once: true });
  if (request.signal.aborted) abort.abort();
  let timedOut = false;
  let keepAlive: ReturnType<typeof setInterval> | undefined;
  let streamAbort: (() => void) | undefined;
  const timeout = setTimeout(() => {
    timedOut = true;
    abort.abort();
  }, 100_000);
  const cleanup = () => {
    clearTimeout(timeout);
    if (keepAlive !== undefined) clearInterval(keepAlive);
    if (streamAbort) abort.signal.removeEventListener("abort", streamAbort);
    request.signal.removeEventListener("abort", disconnected);
  };
  try {
    // Bound chunked uploads too; upstream owns JSON schema/input validation.
    const reader = request.body?.getReader();
    if (!reader) {
      cleanup();
      return failure(400, "invalid_request");
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    const cancelUpload = () => void reader.cancel().catch(() => {});
    abort.signal.addEventListener("abort", cancelUpload, { once: true });
    if (abort.signal.aborted) cancelUpload();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 80_000) {
          void reader.cancel().catch(() => {});
          cleanup();
          return failure(413, "input_too_large");
        }
        chunks.push(value);
      }
    } finally {
      abort.signal.removeEventListener("abort", cancelUpload);
      reader.releaseLock();
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    let proof: string | undefined;
    if (accessEnabled()) {
      sameOrigin(request);
      const identity = await resolveIdentity(request);
      guestCookie = identity.cookie;
      let ops: { visitor: string; entrypoint: "home" | "standalone" } | undefined;
      let notice: unknown;
      try { notice = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body))?.query_log_notice; } catch {}
      if (notice === "v3") {
        if (process.env.ASK_OPS_ENABLED !== "true") throw new AccessError("ops_storage_unavailable");
        const visitor = identity.tier === "public" ? { sub: identity.sub, cookie: identity.cookie } : await resolveOpsVisitor(request);
        if (visitor.cookie) guestCookie = visitor.cookie;
        ops = { visitor: visitor.sub, entrypoint: new URL(request.url).pathname === "/api/ask" ? "standalone" : "home" };
      }
      if (identity.tier !== "founding") releaseNetwork = await reserveGuestNetwork(request);
      proof = await admission(identity, "POST", "/api/ask", body, ops);
    }
    const upstream = await fetch(`${backendOrigin()}/api/ask`, {
      method: "POST",
      body,
      signal: abort.signal,
      // Vercel's live Edge runtime accepts manual/follow, but rejects error.
      // Never follow a redirect or forward a Location header to the reader.
      redirect: "manual",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Accept-Encoding": "identity",
        ...(proof ? { "X-Ask-Admission": proof } : {}),
      },
    });
    if (
      !upstream.ok ||
      !upstream.body ||
      !upstream.headers.get("content-type")?.includes("text/event-stream")
    ) {
      // No answer was made, so the network's guest count is given back.
      await releaseNetwork?.();
      if (accessEnabled() && upstream.status === 429 &&
          upstream.headers.get("x-ask-error-code") === "quota_exhausted" &&
          upstream.headers.get("content-type")?.includes("application/json")) {
        try {
          const value = await boundedQuotaBody(upstream);
          if (value?.code === "quota_exhausted" && value.remaining === 0 &&
              typeof value.reset_at === "string" && /^\d{4}-\d{2}-\d{2}T[\d:.+-]+Z?$/.test(value.reset_at)) {
            cleanup();
            return reply(Response.json({ code: "quota_exhausted", remaining: 0, reset_at: value.reset_at,
              message: "今天的3次体验已用完。Founding Member可登录后不限次提问。" }, { status: 429, headers: HEADERS }));
          }
        } catch { /* Only the fixed quota contract is forwarded. */ }
      }
      if (accessEnabled() && upstream.status === 503 &&
          upstream.headers.get("x-ask-error-code") === "ops_storage_unavailable" &&
          upstream.headers.get("content-type")?.includes("application/json")) {
        const value = await boundedQuotaBody(upstream);
        if (value?.code === "ops_storage_unavailable") { cleanup(); return reply(failure(503, "ops_storage_unavailable")); }
      }
      void upstream.body?.cancel().catch(() => {});
      cleanup();
      return reply(failure(
        upstream.ok || (upstream.status >= 300 && upstream.status < 400)
          ? 502
          : upstream.status,
        upstream.status === 429
          ? "rate_limited"
          : upstream.ok
            ? "invalid_upstream_stream"
            : "upstream_unavailable"
      ));
    }
    const input = upstream.body.getReader();
    let cancelled = false;
    let ended = false;
    let released = false;
    let terminal = false;
    let pending = new Uint8Array(0);
    let finish!: (code?: string) => void;
    const release = () => {
      if (!released) {
        released = true;
        input.releaseLock();
      }
    };
    const stopUpstream = () => {
      abort.abort();
      void input
        .cancel()
        .catch(() => {})
        .finally(release);
    };
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        finish = (code?: string) => {
          if (ended) return;
          ended = true;
          pending = new Uint8Array(0);
          cleanup();
          if (!cancelled) {
            if (code && !request.signal.aborted) {
              controller.enqueue(streamFailure(code));
            }
            controller.close();
          }
          stopUpstream();
        };
        streamAbort = () => finish(timedOut ? "relay_timeout" : undefined);
        abort.signal.addEventListener("abort", streamAbort, { once: true });
        keepAlive = setInterval(() => {
          if (
            !ended &&
            !abort.signal.aborted &&
            (controller.desiredSize ?? 0) > 0
          ) {
            controller.enqueue(heartbeat);
          }
        }, HEARTBEAT_MS);
        if (abort.signal.aborted) streamAbort();
      },
      async pull(controller) {
        try {
          while (!ended) {
            const { done, value } = await input.read();
            if (ended) return;
            if (done) {
              finish(terminal ? undefined : "upstream_stream_interrupted");
              return;
            }
            const combined = new Uint8Array(pending.length + value.byteLength);
            combined.set(pending);
            combined.set(value, pending.length);
            if (combined.byteLength > FRAME_LIMIT)
              throw new Error("frame_limit");
            let boundary = 0;
            let start = 0;
            for (let i = 1; i < combined.length; i++) {
              if (
                combined[i] !== 10 ||
                !(
                  combined[i - 1] === 10 ||
                  (combined[i - 1] === 13 && i >= 2 && combined[i - 2] === 10)
                )
              )
                continue;
              boundary = i + 1;
              terminal = terminalFrame(combined.subarray(start, boundary));
              start = boundary;
              if (terminal) break;
            }
            pending = combined.slice(boundary);
            if (!boundary) continue;
            controller.enqueue(combined.subarray(0, boundary));
            if (terminal) finish();
            return;
          }
        } catch {
          finish(timedOut ? "relay_timeout" : "upstream_stream_interrupted");
        } finally {
          if (ended) release();
        }
      },
      cancel() {
        cancelled = true;
        ended = true;
        pending = new Uint8Array(0);
        cleanup();
        stopUpstream();
      },
    });
    return reply(new Response(stream, {
      headers: {
        ...HEADERS,
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    }));
  } catch (error) {
    cleanup();
    await releaseNetwork?.();
    // Same contract as the per-guest quota, so both pages offer Founding sign-in.
    if (error instanceof NetworkQuotaError)
      // `scope` lets pages say it is the network, not this person's own 3, that ran out.
      return reply(Response.json({ code: "quota_exhausted", scope: "network", remaining: 0, reset_at: error.resetAt,
        message: "今天来自这个网络的免费提问已经很多了，请明天再来。Founding Member可登录后不限次提问。" },
      { status: 429, headers: HEADERS }));
    if (error instanceof AccessError) return reply(failure(error.status, error.code));
    return reply(failure(
      timedOut ? 504 : 502,
      timedOut ? "relay_timeout" : "upstream_unavailable"
    ));
  }
}
