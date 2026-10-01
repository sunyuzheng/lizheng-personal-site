/** Fixed-destination streaming relay. Model credentials and retrieval stay in Builder. */
export const config = { runtime: "edge" };

const HEADERS = { "Cache-Control": "no-store, no-transform" };
const UPSTREAM = "https://ask-lizheng.ai-builders.space/api/ask";

function failure(status: number, code: string): Response {
  return Response.json(
    { code, message: "The answer did not finish. Try again shortly." },
    { status, headers: HEADERS }
  );
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return failure(405, "method_not_allowed");
  const abort = new AbortController();
  const disconnected = () => abort.abort();
  request.signal.addEventListener("abort", disconnected, { once: true });
  if (request.signal.aborted) abort.abort();
  const timeout = setTimeout(() => abort.abort(), 100_000);
  const cleanup = () => {
    clearTimeout(timeout);
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
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      body,
      signal: abort.signal,
      redirect: "error",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Accept-Encoding": "identity",
      },
    });
    if (
      !upstream.ok ||
      !upstream.body ||
      !upstream.headers.get("content-type")?.includes("text/event-stream")
    ) {
      void upstream.body?.cancel().catch(() => {});
      cleanup();
      return failure(
        upstream.ok ? 502 : upstream.status,
        upstream.status === 429
          ? "rate_limited"
          : upstream.ok
            ? "invalid_upstream_stream"
            : "upstream_unavailable"
      );
    }
    const input = upstream.body.getReader();
    let cancelled = false;
    let released = false;
    const release = () => {
      if (!released) {
        released = true;
        input.releaseLock();
      }
    };
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { done, value } = await input.read();
          if (cancelled) return;
          if (done) {
            cleanup();
            release();
            controller.close();
          } else controller.enqueue(value);
        } catch {
          cleanup();
          release();
          if (!cancelled)
            controller.error(new Error("The answer stream ended."));
        }
      },
      async cancel() {
        cancelled = true;
        cleanup();
        abort.abort();
        await input.cancel().catch(() => {});
        release();
      },
    });
    return new Response(stream, {
      headers: {
        ...HEADERS,
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    cleanup();
    const code =
      error instanceof TypeError
        ? "upstream_request_invalid"
        : "upstream_unavailable";
    return failure(abort.signal.aborted ? 504 : 502, code);
  }
}
