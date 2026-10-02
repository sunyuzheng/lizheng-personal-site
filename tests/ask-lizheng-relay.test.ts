import { afterEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import handler from "../api/ask-lizheng";
import { clientNetwork, createSession, GUEST_NETWORK_DAILY_LIMIT } from "../shared/ask-access";

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

// A small Redis stand-in: the network counter script, DECR, and session records.
const redisStore = new Map<string, string | number>();
const redisCalls: unknown[][] = [];
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  redisStore.clear();
  redisCalls.length = 0;
});

function withRedis(upstream: ReturnType<typeof vi.fn>) {
  return vi.fn(async (url: string | URL, init?: RequestInit) => {
    if (!String(url).includes("upstash.io")) return upstream(url, init);
    const args = JSON.parse(String(init?.body));
    redisCalls.push(args);
    const [command, key] = args;
    let result: unknown = null;
    if (command === "EVAL") { result = Number(redisStore.get(args[3]) ?? 0) + 1; redisStore.set(args[3], result as number); }
    else if (command === "DECR") { result = Number(redisStore.get(key) ?? 0) - 1; redisStore.set(key, result as number); }
    else if (command === "SET") { redisStore.set(key, args[2]); result = "OK"; }
    else if (command === "GET") result = redisStore.get(key) ?? null;
    return Response.json({ result });
  });
}
function networkCounts() {
  return [...redisStore.entries()].filter(([key]) => key.startsWith("ask:net:v1:"));
}
function protectedRequest(origin = "https://www.lizheng.ai", headers: Record<string, string> = {}) {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubEnv("ASK_QUOTA_ENABLED", "true");
  vi.stubEnv("ASK_AUTH_SECRET", "test-auth-secret-with-at-least-32-bytes");
  vi.stubEnv("ASK_ADMISSION_SECRET", "test-admission-secret-with-at-least-32-bytes");
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://test-ask.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "test-only-redis-token");
  return request(publicPayload, { headers: { Origin: origin, "Content-Type": "application/json", "X-Founding": "true",
    "x-vercel-forwarded-for": "203.0.113.7", ...headers } });
}
describe("account admission relay", () => {
  it("adds a server proof bound to the exact body and ignores browser membership claims", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sse(event("result", { status: "answered" })));
    vi.stubGlobal("fetch", withRedis(fetchMock));
    const response = await handler(protectedRequest());
    expect(response.status).toBe(200);
    const headers = fetchMock.mock.calls[0][1].headers;
    const proof = headers["X-Ask-Admission"];
    const payload = JSON.parse(Buffer.from(proof.split(".")[1], "base64url").toString());
    expect(payload.tier).toBe("public"); expect(payload.path).toBe("/api/ask");
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(publicPayload));
    expect(payload.body_sha256).toBe(Buffer.from(digest).toString("hex"));
    expect(response.headers.get("set-cookie")).toContain("__Secure-ask-guest=");
    await response.text();
  });
  it("rejects cross-site requests before contacting Builder or counting the network", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    const response = await handler(protectedRequest("https://attacker.example"));
    expect(response.status).toBe(403); expect(fetchMock).not.toHaveBeenCalled();
  });
  it("passes only fixed quota fields and preserves the anonymous cookie on quota rejection", async () => {
    vi.stubGlobal("fetch", withRedis(vi.fn().mockResolvedValue(Response.json({ code: "quota_exhausted", remaining: 0,
      reset_at: "2026-10-02T16:00:00+00:00", private_detail: "synthetic-private" },
      { status: 429, headers: { "X-Ask-Error-Code": "quota_exhausted" } }))));
    const response = await handler(protectedRequest());
    expect(response.status).toBe(429); expect(response.headers.get("set-cookie")).toBeTruthy();
    const value = await response.json(); expect(value.code).toBe("quota_exhausted"); expect(value.remaining).toBe(0);
    expect(value).not.toHaveProperty("private_detail");
  });
  it("bounds a marked but unfinished quota response instead of waiting for the answer deadline", async () => {
    const cancelled = vi.fn();
    const body = new ReadableStream({ cancel: cancelled });
    vi.stubGlobal("fetch", withRedis(vi.fn().mockResolvedValue(new Response(body, {
      status: 429, headers: { "Content-Type": "application/json", "X-Ask-Error-Code": "quota_exhausted" },
    }))));
    const response = await handler(protectedRequest());
    expect((await response.json()).code).toBe("rate_limited"); expect(cancelled).toHaveBeenCalled();
  });
});

describe("guest network cap", () => {
  it("counts cookie-less guests from one network together, so dropping the cookie does not reset anything", async () => {
    const upstream = vi.fn(async () => sse(event("result", { status: "answered" })));
    vi.stubGlobal("fetch", withRedis(upstream));
    for (let i = 0; i < 3; i++) {
      const response = await handler(protectedRequest());
      expect(response.status).toBe(200);
      await response.text();
    }
    expect(networkCounts()).toHaveLength(1);
    expect(networkCounts()[0][1]).toBe(3);
    await (await handler(protectedRequest(undefined, { "x-vercel-forwarded-for": "198.51.100.4" }))).text();
    expect(networkCounts()).toHaveLength(2);
  });
  it("answers over the cap with the quota contract and never contacts Builder", async () => {
    const upstream = vi.fn(); vi.stubGlobal("fetch", withRedis(upstream));
    await handler(protectedRequest());
    const [key] = networkCounts()[0];
    redisStore.set(key, GUEST_NETWORK_DAILY_LIMIT);
    upstream.mockClear();
    const response = await handler(protectedRequest());
    expect(response.status).toBe(429);
    const value = await response.json();
    expect(value.code).toBe("quota_exhausted"); expect(value.scope).toBe("network"); expect(value.remaining).toBe(0);
    expect(value.reset_at).toMatch(/T16:00:00\.000Z$/);
    expect(response.headers.get("set-cookie")).toContain("__Secure-ask-guest=");
    expect(upstream).not.toHaveBeenCalled();
  });
  it("gives the count back when Builder made no answer", async () => {
    vi.stubGlobal("fetch", withRedis(vi.fn().mockResolvedValue(Response.json({ code: "quota_exhausted", remaining: 0,
      reset_at: "2026-10-02T16:00:00+00:00" }, { status: 429, headers: { "X-Ask-Error-Code": "quota_exhausted" } }))));
    expect((await handler(protectedRequest())).status).toBe(429);
    vi.stubGlobal("fetch", withRedis(vi.fn().mockRejectedValue(new Error("synthetic network failure"))));
    expect((await handler(protectedRequest())).status).toBe(502);
    expect(networkCounts()[0][1]).toBe(0);
  });
  it("fails closed when the counter is unavailable", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL, init?: RequestInit) =>
      String(url).includes("upstash.io") ? new Response("down", { status: 500 }) : upstream(url, init)));
    const response = await handler(protectedRequest());
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("access_unavailable");
    expect(upstream).not.toHaveBeenCalled();
  });
  it("does not count Founding sessions", async () => {
    const upstream = vi.fn(async () => sse(event("result", { status: "answered" })));
    vi.stubGlobal("fetch", withRedis(upstream));
    protectedRequest();
    const cookie = await createSession(`user:${"f".repeat(43)}`, "member@example.com", true);
    const response = await handler(protectedRequest(undefined, { cookie: cookie.split(";")[0] }));
    expect(response.status).toBe(200);
    await response.text();
    expect(networkCounts()).toHaveLength(0);
    expect(upstream).toHaveBeenCalledOnce();
  });
  it("keys IPv6 clients by their /64 and unwraps IPv4-mapped addresses", () => {
    const at = (address: string) => clientNetwork(new Request("https://www.lizheng.ai/", { headers: { "x-forwarded-for": address } }));
    expect(at("2001:db8:85a3:12:1:2:3:4")).toBe(at("2001:0db8:85a3:0012:ffff::9"));
    expect(at("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(at("2001:db8:85a3:12::1")).not.toBe(at("2001:db8:85a3:13::1"));
    expect(at("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(at("203.0.113.7, 10.0.0.1")).toBe("203.0.113.7");
  });
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

describe("question record notices", () => {
  it.each(["v3", "v4"])("signs the anonymous visitor and entrypoint for a %s notice", async notice => {
    const upstream = vi.fn().mockResolvedValue(sse(event("result", { status: "answered" })));
    vi.stubGlobal("fetch", withRedis(upstream));
    const base = protectedRequest();
    vi.stubEnv("ASK_OPS_ENABLED", "true");
    const body = JSON.stringify({ ...JSON.parse(await base.text()), query_log_notice: notice,
      conversation_id: "6f9619ff-8b86-4011-b42d-00c04fc964ff" });
    const response = await handler(new Request(base.url, { method: "POST", body, headers: base.headers }));
    expect(response.status).toBe(200);
    const claims = JSON.parse(Buffer.from(upstream.mock.calls[0][1].headers["X-Ask-Admission"].split(".")[1], "base64url").toString());
    expect(claims.visitor).toMatch(/^guest:/);
    expect(claims.entrypoint).toBe("home");
    await response.text();
  });
});
