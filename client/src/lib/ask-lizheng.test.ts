import { afterEach, describe, expect, it, vi } from "vitest";
import {
  askLizheng,
  applyAskEvent,
  publicSourceUrl,
  isMemberVideo,
  memberJoinUrl,
  type AskEvent,
  type AskAnswerState,
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
  vi.restoreAllMocks();
});

describe("askLizheng stream protocol", () => {
  it("carries membership metadata through SSE and only links the actual channel membership", async () => {
    const member = { ...source, source_type: "video-transcript", source_visibility: "members-only", text_access: "public", membership_platform: "youtube",
      membership_url: "https://www.youtube.com/channel/UC_5lJHgnMP_lb_VpIiXV0hQ/join", transcript_quality: "uncorrected-asr" };
    const complete = { ...result, sources: [member] };
    const { response } = closedResponse(frame("sources", { sources: [member] }) + frame("result", complete), true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    const events: AskEvent[] = [];
    await askLizheng(payload, new AbortController().signal, event => events.push(event));
    expect(events.find(e => e.type === "sources")?.value).toEqual({ sources: [member] });
    expect(events.find(e => e.type === "result")?.value).toEqual(complete);
    expect(isMemberVideo(member)).toBe(true);
    expect(memberJoinUrl(member)).toBe(member.membership_url);
    expect(isMemberVideo({ ...member, membership_platform: "circle" })).toBe(false);
    expect(isMemberVideo({ ...member, source_type: "community-post" })).toBe(false);
    expect(memberJoinUrl({ ...member, membership_url: "https://unrelated.example/join" })).toBeUndefined();
  });
  it("reports comment-only bytes as activity without inventing progress or completing", async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(value) {
        controller = value;
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseFor(stream)));
    const firstActivity = deferred();
    const onActivity = vi.fn(() => firstActivity.resolve());
    const onEvent = vi.fn();
    let settled = false;
    const run = askLizheng(
      payload,
      new AbortController().signal,
      onEvent,
      onActivity
    );
    void run.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(onActivity).not.toHaveBeenCalled();
    controller.enqueue(
      encoder.encode(": keep-alive " + " ".repeat(16384) + "\n\n")
    );
    await firstActivity.promise;
    expect(onActivity).toHaveBeenCalledOnce();
    expect(onEvent).not.toHaveBeenCalled();
    expect(settled).toBe(false);
    controller.enqueue(encoder.encode(frame("result", result)));
    await run;
    expect(onEvent).toHaveBeenCalledWith({ type: "result", value: result });
    expect(stream.locked).toBe(false);
  });

  it("ignores empty chunks and throttles activity while delivering the final result immediately", async () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(value) {
        controller = value;
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseFor(stream)));
    const onActivity = vi.fn();
    const onEvent = vi.fn();
    const run = askLizheng(
      payload,
      new AbortController().signal,
      onEvent,
      onActivity
    );
    const flush = async () => {
      for (let i = 0; i < 8; i++) await Promise.resolve();
    };
    controller.enqueue(new Uint8Array(0));
    await flush();
    expect(onActivity).not.toHaveBeenCalled();
    controller.enqueue(encoder.encode(": keep"));
    await flush();
    expect(onActivity).toHaveBeenCalledOnce();
    now = 999;
    controller.enqueue(encoder.encode("-alive"));
    await flush();
    expect(onActivity).toHaveBeenCalledOnce();
    now = 1000;
    controller.enqueue(encoder.encode("\n\n"));
    await flush();
    expect(onActivity).toHaveBeenCalledTimes(2);
    expect(onEvent).not.toHaveBeenCalled();
    controller.enqueue(encoder.encode(frame("result", result)));
    await run;
    expect(onActivity).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenCalledOnce();
    expect(onEvent).toHaveBeenCalledWith({ type: "result", value: result });
    expect(stream.locked).toBe(false);
  });

  it("keeps comment activity observational when stop aborts the reader", async () => {
    const abort = new AbortController();
    const seenActivity = deferred();
    let stream!: ReadableStream<Uint8Array>;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        stream = new ReadableStream<Uint8Array>({
          start(controller) {
            init.signal!.addEventListener(
              "abort",
              () => controller.error(new DOMException("Stopped", "AbortError")),
              { once: true }
            );
            controller.enqueue(encoder.encode(": relay keep-alive\n\n"));
          },
        });
        return Promise.resolve(responseFor(stream));
      })
    );
    const onEvent = vi.fn();
    const onActivity = vi.fn(() => seenActivity.resolve());
    const run = askLizheng(payload, abort.signal, onEvent, onActivity);
    const rejection = expect(run).rejects.toMatchObject({ name: "AbortError" });
    await seenActivity.promise;
    abort.abort();
    await rejection;
    expect(onActivity).toHaveBeenCalledOnce();
    expect(onEvent).not.toHaveBeenCalled();
    expect(stream.locked).toBe(false);
  });

  it("delivers validated section snapshots before the full result", async () => {
    const partial = { sections: result.sections, sources: result.sources };
    const seenPartial = deferred();
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(value) {
        controller = value;
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseFor(stream)));
    const events: AskEvent[] = [];
    let settled = false;
    const run = askLizheng(payload, new AbortController().signal, event => {
      events.push(event);
      if (event.type === "partial") seenPartial.resolve();
    });
    void run.then(() => {
      settled = true;
    });
    controller.enqueue(encoder.encode(frame("partial", partial)));
    await seenPartial.promise;
    expect(events).toEqual([{ type: "partial", value: partial }]);
    expect(settled).toBe(false);
    controller.enqueue(encoder.encode(frame("result", result)));
    await run;
    expect(events.map(event => event.type)).toEqual(["partial", "result"]);
    expect(stream.locked).toBe(false);
  });

  it("merges partial citations without duplicate source targets and clears partial on repair or result", () => {
    const extra = { ...source, id: "S2", url: "https://example.com/other" };
    const original: AskAnswerState = { sources: [source] };
    const partial = {
      sections: [{ ...result.sections[0], source_ids: ["S2"] }],
      sources: [source, extra],
    };
    const state = applyAskEvent(original, { type: "partial", value: partial });
    expect(state.partial).toEqual(partial);
    expect(state.result).toBeUndefined();
    expect(state.sources.map(item => item.id)).toEqual(["S1", "S2"]);
    expect(state.sources.filter(item => item.id === "S1")).toHaveLength(1);
    expect(
      state.partial!.sections.every(section =>
        section.source_ids.every(id =>
          state.sources.some(item => item.id === id)
        )
      )
    ).toBe(true);
    expect(original).toEqual({ sources: [source] });
    const drafting = applyAskEvent(state, {
      type: "progress",
      value: { stage: "drafting", message: "公开测试" },
    });
    expect(drafting.partial).toEqual(partial);
    const repairing = applyAskEvent(drafting, {
      type: "progress",
      value: { stage: "repairing", message: "公开测试" },
    });
    expect(repairing.partial).toBeUndefined();
    expect(repairing.sources).toEqual(state.sources);
    const complete = applyAskEvent(state, { type: "result", value: result });
    expect(complete.partial).toBeUndefined();
    expect(complete.result).toEqual(result);
    expect(complete.sources).toEqual(result.sources);
  });

  it("replaces partial snapshots rather than appending sections twice", () => {
    const first = { sections: result.sections, sources: result.sources };
    const next = {
      sections: [
        ...result.sections,
        { ...result.sections[0], heading: "另一部分" },
      ],
      sources: result.sources,
    };
    const initial = applyAskEvent(
      { sources: [] },
      { type: "partial", value: first }
    );
    const updated = applyAskEvent(initial, { type: "partial", value: next });
    expect(updated.partial!.sections).toHaveLength(2);
    expect(updated.sources).toHaveLength(1);
    expect(initial.partial!.sections).toHaveLength(1);
  });

  it("ignores padded heartbeats while delivering the public answer outline before the result", async () => {
    const approach = {
      summary: "先对照候选材料。",
      questions: ["怎样验证能力？"],
      sources: [{ id: "S1", title: source.title }],
      note: "整理方向，尚不是结论。",
    };
    const { stream, response } = closedResponse(
      ": keep-alive " +
        " ".repeat(2048) +
        "\n\n" +
        frame("approach", approach) +
        ": relay keep-alive\r\n\r\n" +
        frame("result", result),
      true
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    const events: AskEvent[] = [];
    await askLizheng(payload, new AbortController().signal, event =>
      events.push(event)
    );
    expect(events).toEqual([
      { type: "approach", value: approach },
      { type: "result", value: result },
    ]);
    expect(stream.locked).toBe(false);
  });

  it.each(["relay_timeout", "upstream_stream_interrupted"])(
    "preserves the recovery code %s without retrying the model",
    async code => {
      const { stream, response } = closedResponse(
        frame("sources", { sources: [source] }) +
          frame("error", { code, message: "The answer did not finish." })
      );
      const fetchMock = vi.fn().mockResolvedValue(response);
      vi.stubGlobal("fetch", fetchMock);
      const events: AskEvent[] = [];
      await expect(
        askLizheng(payload, new AbortController().signal, event =>
          events.push(event)
        )
      ).rejects.toMatchObject({ code });
      expect(events).toEqual([
        { type: "sources", value: { sources: [source] } },
      ]);
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(stream.locked).toBe(false);
    }
  );

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
        credentials: "same-origin",
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
