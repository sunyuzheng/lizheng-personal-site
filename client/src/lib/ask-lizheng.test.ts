import { afterEach, describe, expect, it, vi } from "vitest";
import {
  askLizheng,
  publicSourceUrl,
  type AskEvent,
  type AskResult,
} from "./ask-lizheng";

const encoder = new TextEncoder();
const payload = {
  question: "公开协议测试",
  context: "",
  intent: "understand" as const,
  history: [],
};
const source = {
  id: "S1",
  title: "公开材料",
  url: "https://example.com/public",
  excerpt: "中文跨字节 🧭",
};
const result: AskResult = {
  status: "answered",
  summary: "中文回答 🧭",
  sections: [
    {
      heading: "解释",
      body: "公开材料的转述。",
      source_ids: ["S1"],
      kind: "source",
    },
  ],
  sources: [source],
  followups: [],
  clarifying_questions: [],
  limitations: "",
};

function frame(name: string, value: unknown, newline = "\n") {
  return `event: ${name}${newline}data: ${JSON.stringify(value)}${newline}${newline}`;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

function responseFor(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8" },
  });
}

function closedResponse(text: string, byteByByte = false) {
  const bytes = encoder.encode(text);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      if (byteByByte) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      } else controller.enqueue(bytes);
      controller.close();
    },
  });
  return { stream, response: responseFor(stream) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("askLizheng stream protocol", () => {
  it("decodes split UTF-8, split CRLF delimiters and multiline SSE data", async () => {
    // One-byte chunks split every Chinese character, emoji and CR/LF pair.
    const sources = `event: sources\r\ndata: {"sources":\r\ndata: ${JSON.stringify([source])}}\r\n\r\n`;
    const { stream, response } = closedResponse(
      frame(
        "progress",
        { stage: "retrieving", message: "正在读取中文材料 🧭" },
        "\r\n"
      ) +
        sources +
        frame("result", result, "\r\n"),
      true
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    const events: AskEvent[] = [];

    await askLizheng(payload, new AbortController().signal, event =>
      events.push(event)
    );

    expect(events.map(event => event.type)).toEqual([
      "progress",
      "sources",
      "result",
    ]);
    expect(events[0]).toEqual({
      type: "progress",
      value: { stage: "retrieving", message: "正在读取中文材料 🧭" },
    });
    expect(events[1]).toEqual({
      type: "sources",
      value: { sources: [source] },
    });
    expect(events[2]).toEqual({ type: "result", value: result });
    expect(stream.locked).toBe(false);
  });

  it("delivers progress and candidates before the final answer is available", async () => {
    const seenCandidates = deferred();
    const cancel = vi.fn();
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(value) {
        controller = value;
        controller.enqueue(
          encoder.encode(
            frame("progress", { stage: "retrieving", message: "读取公开材料" })
          )
        );
        controller.enqueue(
          encoder.encode(
            frame("sources", {
              phase: "initial",
              provisional: true,
              sources: [source],
            })
          )
        );
      },
      cancel,
    });
    const fetchMock = vi.fn().mockResolvedValue(responseFor(stream));
    vi.stubGlobal("fetch", fetchMock);
    const events: AskEvent[] = [];
    const abort = new AbortController();
    let settled = false;
    const run = askLizheng(payload, abort.signal, event => {
      events.push(event);
      if (event.type === "sources") seenCandidates.resolve();
    });
    void run.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      }
    );

    await seenCandidates.promise;
    expect(events.map(event => event.type)).toEqual(["progress", "sources"]);
    expect(settled).toBe(false);
    expect(stream.locked).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ask-lizheng/ask",
      expect.objectContaining({
        method: "POST",
        signal: abort.signal,
        credentials: "omit",
        cache: "no-store",
      })
    );

    controller.enqueue(encoder.encode(frame("result", result)));
    // Keep the upstream open: a completed answer must cancel unused input.
    await run;
    expect(events.map(event => event.type)).toEqual([
      "progress",
      "sources",
      "result",
    ]);
    expect(cancel).toHaveBeenCalledOnce();
    expect(stream.locked).toBe(false);
  });

  it.each([true, false])(
    "fails when EOF arrives without a result (delimiter=%s)",
    async delimited => {
      const text = frame("progress", {
        stage: "retrieving",
        message: "读取公开材料",
      });
      const { stream, response } = closedResponse(
        delimited ? text : text.trimEnd()
      );
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

      await expect(
        askLizheng(payload, new AbortController().signal, vi.fn())
      ).rejects.toThrow(
        "The connection ended before a complete answer arrived."
      );
      expect(stream.locked).toBe(false);
    }
  );

  it("accepts a final frame terminated only by EOF", async () => {
    const { stream, response } = closedResponse(
      frame("result", result).trimEnd(),
      true
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    const onEvent = vi.fn();

    await askLizheng(payload, new AbortController().signal, onEvent);

    expect(onEvent).toHaveBeenCalledOnce();
    expect(onEvent).toHaveBeenCalledWith({ type: "result", value: result });
    expect(stream.locked).toBe(false);
  });

  it("reports HTTP 429 without attempting to consume an answer stream", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ message: "请稍后重试。", code: "rate_limited" }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          )
        )
    );
    const onEvent = vi.fn();

    await expect(
      askLizheng(payload, new AbortController().signal, onEvent)
    ).rejects.toThrow("请稍后重试。");
    expect(onEvent).not.toHaveBeenCalled();
  });

  it("propagates an SSE error and cancels and unlocks the reader", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            frame("error", { message: "模型暂时繁忙。", code: "provider_busy" })
          )
        );
      },
      cancel,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseFor(stream)));
    const onEvent = vi.fn();

    await expect(
      askLizheng(payload, new AbortController().signal, onEvent)
    ).rejects.toThrow("模型暂时繁忙。");
    expect(onEvent).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledOnce();
    expect(stream.locked).toBe(false);
  });

  it("releases the stream reader when stop aborts a pending read", async () => {
    const seenProgress = deferred();
    const abort = new AbortController();
    let stream!: ReadableStream<Uint8Array>;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        stream = new ReadableStream<Uint8Array>({
          start(controller) {
            // Real fetch errors its response body when its AbortSignal fires.
            init.signal!.addEventListener(
              "abort",
              () => {
                controller.error(new DOMException("Stopped", "AbortError"));
              },
              { once: true }
            );
            controller.enqueue(
              encoder.encode(
                frame("progress", { stage: "thinking", message: "处理中" })
              )
            );
          },
        });
        return Promise.resolve(responseFor(stream));
      })
    );
    const events: AskEvent[] = [];
    const run = askLizheng(payload, abort.signal, event => {
      events.push(event);
      seenProgress.resolve();
    });
    const rejection = expect(run).rejects.toMatchObject({ name: "AbortError" });

    await seenProgress.promise;
    abort.abort();
    await rejection;
    expect(events.map(event => event.type)).toEqual(["progress"]);
    expect(stream.locked).toBe(false);
  });

  it("bounds an unterminated frame accumulated across chunks", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("event: sources\ndata: "));
        controller.enqueue(encoder.encode("x".repeat(256_000)));
        controller.enqueue(encoder.encode("x".repeat(256_001)));
      },
      cancel,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseFor(stream)));
    const onEvent = vi.fn();

    await expect(
      askLizheng(payload, new AbortController().signal, onEvent)
    ).rejects.toThrow("The answer stream exceeded its limit.");
    expect(onEvent).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledOnce();
    expect(stream.locked).toBe(false);
  });
});

describe("publicSourceUrl", () => {
  it.each([
    undefined,
    "",
    "javascript:alert(1)",
    " JAVASCRIPT:alert(1) ",
    "http://example.com/source",
    "data:text/html,test",
    "/source",
    "//example.com/source",
    "not a URL",
  ])("rejects non-HTTPS or malformed source URL %s", value => {
    expect(publicSourceUrl(value)).toBeUndefined();
  });

  it("preserves a public HTTPS source, including its timecode", () => {
    expect(publicSourceUrl("https://example.com/source?t=123#passage")).toBe(
      "https://example.com/source?t=123#passage"
    );
  });
});
