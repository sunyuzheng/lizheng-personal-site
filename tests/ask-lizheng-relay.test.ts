import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../api/ask-lizheng";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const heartbeat = ": relay keep-alive " + " ".repeat(2_048) + "\n\n";
const endpoint = "https://www.lizheng.ai/api/ask-lizheng/ask";
const destination = "https://ask-lizheng.ai-builders.space/api/ask";
const publicPayload = JSON.stringify({
  question: "公开代理协议测试",
  context: "",
  intent: "understand",
  history: [],
});

function request(body: BodyInit = publicPayload, init: RequestInit = {}) {
  // Node's Request requires duplex for streaming uploads; Edge accepts streams.
  return new Request(endpoint, {
    method: "POST",
    body,
    duplex: "half",
    ...init,
  } as RequestInit);
}

function sse(body: BodyInit | null) {
  return new Response(body, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8" },
  });
}

function event(name: string, value: unknown) {
  return encoder.encode(`event: ${name}\ndata: ${JSON.stringify(value)}\n\n`);
}

async function ticks() {
  for (let i = 0; i < 12; i++) await Promise.resolve();
}

function abortingFetch() {
  return vi.fn(
    (_url: string, options: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const aborted = () =>
          reject(new Error("synthetic private upstream detail"));
        if (options.signal?.aborted) aborted();
        else options.signal?.addEventListener("abort", aborted, { once: true });
      })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fixed Builder SSE relay", () => {
  it("rejects manual redirect responses without forwarding Location or following them", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: "https://example.com/synthetic-redirect" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await handler(request());
    expect(response.status).toBe(502);
    expect(response.headers.get("location")).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].redirect).toBe("manual");
    expect(await response.text()).not.toContain("synthetic-redirect");
  });
  it("forwards progress and sources while the final result is still pending", async () => {
    let input!: ReadableStreamDefaultController<Uint8Array>;
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        input = controller;
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const response = await handler(request());
    const reader = response.body!.getReader();
    expect(response.headers.get("cache-control")).toBe(
      "no-store, no-transform"
    );
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("x-accel-buffering")).toBe("no");

    input.enqueue(
      event("progress", { stage: "retrieving", message: "公开测试" })
    );
    expect(decoder.decode((await reader.read()).value)).toContain(
      "event: progress"
    );
    input.enqueue(
      event("sources", { sources: [{ id: "S1", title: "公开材料" }] })
    );
    expect(decoder.decode((await reader.read()).value)).toContain(
      "event: sources"
    );

    // Nothing can complete until the synthetic upstream explicitly produces it.
    let completed = false;
    const next = reader.read().then(chunk => {
      completed = true;
      return chunk;
    });
    await ticks();
    expect(completed).toBe(false);
    input.enqueue(event("result", { status: "answered", summary: "公开测试" }));
    input.close();
    expect(decoder.decode((await next).value)).toContain("event: result");
    expect((await reader.read()).done).toBe(true);
    reader.releaseLock();
    expect(upstream.locked).toBe(false);
  });

  it("preserves split UTF-8 bytes and SSE delimiters without decoding or reformatting", async () => {
    const sourceBytes = event("sources", { sources: [{ title: "中文 🧭" }] });
    const resultBytes = event("result", { status: "answered" });
    const bytes = new Uint8Array(sourceBytes.length + resultBytes.length);
    bytes.set(sourceBytes);
    bytes.set(resultBytes, sourceBytes.length);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(stream)));
    const response = await handler(request());
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    expect(stream.locked).toBe(false);
  });

  it("propagates downstream cancellation during a pending pull and releases the reader", async () => {
    let upstreamSignal!: AbortSignal;
    let finishCancel!: () => void;
    const cancelGate = new Promise<void>(resolve => {
      finishCancel = resolve;
    });
    const cancelled = vi.fn(() => cancelGate);
    const upstream = new ReadableStream<Uint8Array>({ cancel: cancelled });
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, options: RequestInit) => {
        upstreamSignal = options.signal!;
        return Promise.resolve(sse(upstream));
      })
    );
    const response = await handler(request());
    const reader = response.body!.getReader();
    const pending = reader.read();
    await ticks();
    const cancelling = reader.cancel();
    await ticks();
    expect(upstreamSignal.aborted).toBe(true);
    expect(cancelled).toHaveBeenCalledOnce();
    finishCancel();
    await expect(cancelling).resolves.toBeUndefined();
    expect((await pending).done).toBe(true);
    reader.releaseLock();
    expect(upstream.locked).toBe(false);
  });

  it("cleans up even when the upstream cancel callback rejects", async () => {
    const upstream = new ReadableStream<Uint8Array>({
      cancel() {
        return Promise.reject(new Error("synthetic cancellation detail"));
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const response = await handler(request());
    const reader = response.body!.getReader();
    const pending = reader.read();
    await expect(reader.cancel()).resolves.toBeUndefined();
    await pending;
    reader.releaseLock();
    expect(upstream.locked).toBe(false);
  });

  it("propagates the incoming Request AbortSignal during the response stream", async () => {
    const client = new AbortController();
    let upstreamSignal!: AbortSignal;
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        vi.stubGlobal(
          "fetch",
          vi.fn((_url, options: RequestInit) => {
            upstreamSignal = options.signal!;
            upstreamSignal.addEventListener("abort", () => {
              controller.error(
                new Error("synthetic private cancellation detail")
              );
            });
            return Promise.resolve(sse(upstream));
          })
        );
      },
    });
    const response = await handler(
      request(publicPayload, { signal: client.signal })
    );
    const reader = response.body!.getReader();
    const pending = reader.read();
    client.abort();
    expect((await pending).done).toBe(true);
    expect(upstreamSignal.aborted).toBe(true);
    reader.releaseLock();
    expect(upstream.locked).toBe(false);
  });

  it("rejects oversized chunked uploads before any upstream request", async () => {
    const cancelled = vi.fn();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(40_000));
        controller.enqueue(new Uint8Array(40_001));
      },
      cancel: cancelled,
    });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const response = await handler(request(body));
    expect(response.status).toBe(413);
    expect((await response.json()).code).toBe("input_too_large");
    expect(fetch).not.toHaveBeenCalled();
    expect(cancelled).toHaveBeenCalledOnce();
    expect(body.locked).toBe(false);
  });

  it("accepts exactly 80,000 upload bytes and preserves them", async () => {
    const bytes = new Uint8Array(80_000).fill(32);
    const fetch = vi.fn().mockResolvedValue(sse("event: result\ndata: {}\n\n"));
    vi.stubGlobal("fetch", fetch);
    const response = await handler(request(bytes));
    expect(fetch.mock.calls[0][1].body).toEqual(bytes);
    await response.text();
  });

  it("uses only the fixed origin, strips incoming credentials and filters response headers", async () => {
    const body = JSON.stringify({
      question: "公开协议测试",
      url: "https://attacker.invalid/",
    });
    const fetch = vi.fn().mockResolvedValue(
      new Response("event: result\ndata: {}\n\n", {
        headers: {
          "Content-Type": "text/event-stream",
          "Set-Cookie": "synthetic=not-a-secret",
          Authorization: "synthetic-not-a-secret",
          "X-Private-Upstream": "synthetic detail",
        },
      })
    );
    vi.stubGlobal("fetch", fetch);
    const response = await handler(
      request(body, {
        headers: {
          Cookie: "synthetic=not-a-secret",
          Authorization: "Bearer synthetic-not-a-secret",
          "X-Upstream-Url": "https://attacker.invalid/",
        },
      })
    );
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(destination);
    expect(decoder.decode(options.body)).toBe(body);
    expect(new Headers(options.headers)).toEqual(
      new Headers({
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Accept-Encoding": "identity",
      })
    );
    expect(options.redirect).toBe("manual");
    expect(options.cache).toBe("no-store");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("authorization")).toBeNull();
    expect(response.headers.get("x-private-upstream")).toBeNull();
    await response.text();
  });

  it.each([429, 503])(
    "sanitizes upstream HTTP %s without reading or relaying its body",
    async status => {
      const cancelled = vi.fn();
      const upstream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            encoder.encode("synthetic private upstream detail")
          );
        },
        cancel: cancelled,
      });
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(upstream, {
            status,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": "synthetic=not-a-secret",
            },
          })
        )
      );
      const response = await handler(request());
      expect(response.status).toBe(status);
      const content = await response.text();
      expect(content).not.toContain("private upstream detail");
      expect(JSON.parse(content).code).toBe(
        status === 429 ? "rate_limited" : "upstream_unavailable"
      );
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(response.headers.get("cache-control")).toBe(
        "no-store, no-transform"
      );
      expect(cancelled).toHaveBeenCalledOnce();
    }
  );

  it("rejects a non-SSE success response and cancels its body", async () => {
    const cancelled = vi.fn();
    const upstream = new ReadableStream<Uint8Array>({ cancel: cancelled });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(upstream, {
          headers: { "Content-Type": "text/html" },
        })
      )
    );
    const response = await handler(request());
    expect(response.status).toBe(502);
    expect(cancelled).toHaveBeenCalledOnce();
    expect((await response.json()).code).toBe("invalid_upstream_stream");
  });

  it("does not wait beyond the deadline for failed-upstream body cancellation", async () => {
    vi.useFakeTimers();
    let finishCancel!: () => void;
    const gate = new Promise<void>(resolve => {
      finishCancel = resolve;
    });
    const upstream = new ReadableStream<Uint8Array>({
      cancel() {
        return gate;
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(upstream, { status: 503 }))
    );
    let settled = false;
    const pending = handler(request()).then(response => {
      settled = true;
      return response;
    });
    try {
      await vi.advanceTimersByTimeAsync(100_000);
      await ticks();
      expect(settled).toBe(true);
      expect((await pending).status).toBe(503);
    } finally {
      finishCancel();
      await pending;
    }
  });

  it("does not follow redirects or expose fetch exception details", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValue(
        new Error("synthetic redirect https://attacker.invalid/private")
      );
    vi.stubGlobal("fetch", fetch);
    const response = await handler(request());
    expect(fetch.mock.calls[0][1].redirect).toBe("manual");
    expect(response.status).toBe(502);
    const body = await response.text();
    expect(body).not.toContain("attacker.invalid");
    expect(body).not.toContain("synthetic redirect");
  });

  it("sanitizes errors after streaming has started and unlocks the upstream reader", async () => {
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new Error("synthetic private upstream body"));
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const response = await handler(request());
    const output = await response.text();
    expect(output).toContain('"code":"upstream_stream_interrupted"');
    expect(output).not.toContain("synthetic private upstream body");
    expect(upstream.locked).toBe(false);
  });

  it("limits upstream connection waiting to the shared 100-second deadline", async () => {
    vi.useFakeTimers();
    const fetch = abortingFetch();
    vi.stubGlobal("fetch", fetch);
    const pending = handler(request());
    await ticks();
    expect(fetch).toHaveBeenCalledOnce();
    const signal = fetch.mock.calls[0][1].signal!;
    await vi.advanceTimersByTimeAsync(99_999);
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const response = await pending;
    expect(signal.aborted).toBe(true);
    expect(response.status).toBe(504);
    expect((await response.json()).code).toBe("relay_timeout");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("enforces the same deadline during a stalled response stream", async () => {
    vi.useFakeTimers();
    let input!: ReadableStreamDefaultController<Uint8Array>;
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        input = controller;
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, options: RequestInit) => {
        options.signal!.addEventListener("abort", () =>
          input.error(new Error("synthetic private timeout detail"))
        );
        return Promise.resolve(sse(upstream));
      })
    );
    const response = await handler(request());
    const output = response.text();
    await vi.advanceTimersByTimeAsync(100_000);
    expect(await output).toContain('"code":"relay_timeout"');
    expect(upstream.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("also terminates an unfinished chunked upload at the shared deadline", async () => {
    vi.useFakeTimers();
    let input!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        input = controller;
      },
    });
    const fetch = abortingFetch();
    vi.stubGlobal("fetch", fetch);
    let settled = false;
    const pending = handler(request(body)).then(response => {
      settled = true;
      return response;
    });
    try {
      await vi.advanceTimersByTimeAsync(100_000);
      await ticks();
      expect(settled).toBe(true);
      expect((await pending).status).toBe(504);
      // A fetch with an already-aborted signal rejects without sending bytes.
      if (fetch.mock.calls.length)
        expect(fetch.mock.calls[0][1].signal!.aborted).toBe(true);
      expect(body.locked).toBe(false);
    } finally {
      // Deterministically release a failed implementation's pending read.
      if (!settled) input.error(new Error("synthetic test cleanup"));
      await pending;
    }
  });

  it("does not let slow upload cancellation bypass the shared deadline", async () => {
    vi.useFakeTimers();
    let finishCancel!: () => void;
    const gate = new Promise<void>(resolve => {
      finishCancel = resolve;
    });
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(80_001));
      },
      cancel() {
        return gate;
      },
    });
    vi.stubGlobal("fetch", vi.fn());
    let settled = false;
    const pending = handler(request(body)).then(response => {
      settled = true;
      return response;
    });
    try {
      await vi.advanceTimersByTimeAsync(100_000);
      await ticks();
      expect(settled).toBe(true);
      expect((await pending).status).toBe(413);
    } finally {
      finishCancel();
      await pending;
    }
  });

  it("also terminates an unfinished chunked upload when its Request is aborted", async () => {
    const client = new AbortController();
    let input!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        input = controller;
      },
    });
    vi.stubGlobal("fetch", vi.fn());
    let settled = false;
    const pending = handler(request(body, { signal: client.signal })).then(
      response => {
        settled = true;
        return response;
      }
    );
    try {
      client.abort();
      await ticks();
      expect(settled).toBe(true);
      expect((await pending).status).toBeGreaterThanOrEqual(400);
      expect(body.locked).toBe(false);
    } finally {
      if (!settled) input.error(new Error("synthetic test cleanup"));
      await pending;
    }
  });

  it("clears deadline and incoming abort listener after a completed stream", async () => {
    vi.useFakeTimers();
    const client = new AbortController();
    let signal!: AbortSignal;
    const aborted = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, options: RequestInit) => {
        signal = options.signal!;
        signal.addEventListener("abort", aborted);
        return Promise.resolve(sse("event: result\ndata: {}\n\n"));
      })
    );
    const response = await handler(
      request(publicPayload, { signal: client.signal })
    );
    await response.text();
    expect(vi.getTimerCount()).toBe(0);
    expect(signal.aborted).toBe(true);
    expect(aborted).toHaveBeenCalledOnce();
    client.abort();
    expect(aborted).toHaveBeenCalledOnce();
  });

  it("keeps a 45-second idle stream alive without inventing progress or retrying", async () => {
    vi.useFakeTimers();
    let input!: ReadableStreamDefaultController<Uint8Array>;
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        input = controller;
      },
    });
    const fetch = vi.fn().mockResolvedValue(sse(upstream));
    vi.stubGlobal("fetch", fetch);
    const response = await handler(request());
    const reader = response.body!.getReader();
    input.enqueue(event("sources", { sources: [{ id: "S1" }] }));
    expect(decoder.decode((await reader.read()).value)).toContain(
      "event: sources"
    );
    for (let i = 0; i < 9; i++) {
      const next = reader.read();
      await vi.advanceTimersByTimeAsync(5_000);
      const chunk = (await next).value!;
      expect(chunk.byteLength).toBeGreaterThanOrEqual(2_048);
      expect(decoder.decode(chunk)).toBe(heartbeat);
    }
    input.enqueue(event("result", { status: "answered" }));
    input.close();
    expect(decoder.decode((await reader.read()).value)).toContain(
      "event: result"
    );
    expect((await reader.read()).done).toBe(true);
    reader.releaseLock();
    expect(fetch).toHaveBeenCalledOnce();
    expect(upstream.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("never inserts heartbeat bytes inside a split UTF-8/JSON frame", async () => {
    vi.useFakeTimers();
    let input!: ReadableStreamDefaultController<Uint8Array>;
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        input = controller;
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const response = await handler(request());
    const reader = response.body!.getReader();
    const bytes = event("sources", { sources: [{ title: "中文 🧭" }] });
    const split = bytes.indexOf(0xe4) + 1;
    input.enqueue(bytes.subarray(0, split));
    const keepAlive = reader.read();
    await vi.advanceTimersByTimeAsync(5_000);
    expect(decoder.decode((await keepAlive).value)).toBe(heartbeat);
    input.enqueue(bytes.subarray(split));
    expect((await reader.read()).value).toEqual(bytes);
    input.enqueue(event("result", { status: "answered" }));
    input.close();
    expect(decoder.decode((await reader.read()).value)).toContain(
      "event: result"
    );
    expect((await reader.read()).done).toBe(true);
    reader.releaseLock();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("recognizes split mixed LF/CRLF boundaries and terminal frames", async () => {
    const bytes = encoder.encode(
      'event: sources\r\ndata: {"sources":[]}\n\r\nevent: result\ndata: {"status":"answered"}\r\n\n'
    );
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const response = await handler(request());
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    expect(upstream.locked).toBe(false);
  });

  it("preserves early sources and emits a typed error for EOF before a complete result", async () => {
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(event("sources", { sources: [{ id: "S1" }] }));
        controller.enqueue(
          encoder.encode(
            'event: result\ndata: {"summary":"synthetic unfinished'
          )
        );
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const output = await (await handler(request())).text();
    expect(output).toContain("event: sources");
    expect(output).toContain('"code":"upstream_stream_interrupted"');
    expect(output).not.toContain("synthetic unfinished");
    expect(output).not.toContain("event: result");
    expect(upstream.locked).toBe(false);
  });

  it("bounds incomplete upstream frames and cancels an oversized response", async () => {
    vi.useFakeTimers();
    const cancelled = vi.fn();
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(512_001).fill(65));
      },
      cancel: cancelled,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const output = await (await handler(request())).text();
    expect(output).toContain('"code":"upstream_stream_interrupted"');
    expect(output.length).toBeLessThan(500);
    expect(cancelled).toHaveBeenCalledOnce();
    expect(upstream.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not accumulate heartbeat comments when the downstream is not reading", async () => {
    vi.useFakeTimers();
    const upstream = new ReadableStream<Uint8Array>({});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const response = await handler(request());
    await vi.advanceTimersByTimeAsync(30_000);
    const reader = response.body!.getReader();
    expect(decoder.decode((await reader.read()).value)).toBe(heartbeat);
    let settled = false;
    const next = reader.read().then(value => {
      settled = true;
      return value;
    });
    await ticks();
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(decoder.decode((await next).value)).toBe(heartbeat);
    await reader.cancel();
    reader.releaseLock();
    expect(upstream.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("finishes a deadline even when upstream cancellation has not completed", async () => {
    vi.useFakeTimers();
    let finishCancel!: () => void;
    const gate = new Promise<void>(resolve => {
      finishCancel = resolve;
    });
    const upstream = new ReadableStream<Uint8Array>({
      cancel() {
        return gate;
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(upstream)));
    const response = await handler(request());
    let settled = false;
    const output = response.text().then(value => {
      settled = true;
      return value;
    });
    try {
      await vi.advanceTimersByTimeAsync(100_000);
      await ticks();
      expect(settled).toBe(true);
      expect(await output).toContain('"code":"relay_timeout"');
      expect(upstream.locked).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      finishCancel();
      await output;
    }
  });

  it("rejects GET and missing bodies without contacting Builder", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await handler(new Request(endpoint))).status).toBe(405);
    expect(
      (await handler(new Request(endpoint, { method: "POST" }))).status
    ).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});
