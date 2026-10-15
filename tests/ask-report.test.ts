import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import handler from "../api/ask-lizheng-report";
import {
  recordReport, reportFrom, reportMail, REPORT_COUNT_SCRIPT, REPORT_DAILY_LIMIT, REPORT_NETWORK_DAILY_LIMIT, REPORT_PREFIX,
} from "../shared/ask-report";
import type { Mail } from "../shared/ask-db-watch";
import { reportPayload } from "../shared/ask-report-client.js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const NOW = Date.parse("2026-10-15T05:40:00.000Z");
const CHROME = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.61";
const waiting = { v: 1, surface: "ask", place: "waiting", text: "", question: "人工智能有欲望吗？", asked_at: "2026-10-15T05:38:57.000Z",
  elapsed: 63, quiet: 41, stage: "thinking", model: "deepseek-v4-flash" };
const body = (value: unknown) => Buffer.from(JSON.stringify(value));
const request = (headers: Record<string, string> = {}) => new Request("https://ask.lizheng.ai/api/ask-lizheng/report",
  { method: "POST", headers: { "user-agent": CHROME, origin: "https://ask.lizheng.ai", "x-vercel-forwarded-for": "203.0.113.9", ...headers } });

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(NOW);
  vi.stubEnv("ASK_AUTH_SECRET", "s".repeat(48));
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-not-live");
  vi.stubEnv("ASK_AUTH_EMAIL_API_KEY", "synthetic-key");
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("what a page may report", () => {
  it("takes what the person wrote and what the page saw, nothing else", () => {
    expect(reportFrom(body(waiting))).toEqual({ ...waiting });
    expect(reportFrom(body({ ...waiting, text: "  一直在转圈\r\n\n\n\n还是没有  " })).text).toBe("一直在转圈\n\n还是没有");
    expect(reportFrom(body({ v: 1, surface: "home", place: "page", text: "主页打不开问答" }))).toEqual({ v: 1, surface: "home", place: "page", text: "主页打不开问答" });
    expect(reportFrom(body({ v: 1, surface: "app", place: "answer", text: "出处打不开", question: "怎么学习", status: "answered",
      share: "https://ask.lizheng.ai/s/2026-10-15/quiet-river" })).share).toBe("https://ask.lizheng.ai/s/2026-10-15/quiet-river");
    for (const bad of [
      { ...waiting, context: "我的处境" }, { ...waiting, v: 2 }, { ...waiting, surface: "admin" }, { ...waiting, place: "other" },
      { ...waiting, text: "x".repeat(801) }, { ...waiting, question: "x".repeat(301) }, { ...waiting, question: "  " },
      { ...waiting, elapsed: -1 }, { ...waiting, elapsed: 1.5 }, { ...waiting, quiet: 3601 }, { ...waiting, stage: "Thinking!" },
      { ...waiting, error: "<b>" }, { ...waiting, model: "../x" }, { ...waiting, asked_at: "yesterday" },
      { ...waiting, share: "https://example.com/s/2026-10-15/x" }, { ...waiting, text: 3 },
      // The page itself: something written, and nothing about a question.
      { v: 1, surface: "ask", place: "page", text: "" }, { v: 1, surface: "ask", place: "page", text: "x", question: "q" },
    ]) expect(() => reportFrom(body(bad))).toThrow("invalid_request");
    for (const raw of [Buffer.from("not json"), Buffer.from("[]"), Buffer.alloc(4097, 32), Buffer.alloc(0)])
      expect(() => reportFrom(raw)).toThrow("invalid_request");
  });
});

describe("the mail", () => {
  it("says where the person was, how long they waited and what they asked, in Beijing time", () => {
    const mail = reportMail(reportFrom(body(waiting)), { at: NOW, agent: CHROME, release: "f31b727", id: "synthetic" });
    expect(mail.subject).toBe("问问立正反馈：等了63秒还没出回答");
    expect(mail.key).toBe("ask-report:synthetic");
    for (const line of ["写的内容：（没写，直接发送的）", "在哪里：等回答时，ask.lizheng.ai 网页", "问题：人工智能有欲望吗？",
      "提问时间：2026-10-15 13:38:57（北京时间）", "已经等了：63秒", "最近一次收到进展：41秒前", "进行到：等回答模型",
      "回答模型：deepseek-v4-flash", `设备：${CHROME}`, "发送时间：2026-10-15 13:40:00（北京时间），2026-10-15T05:40:00Z", "主站版本：f31b727"])
      expect(mail.text).toContain(line);
    const failed = reportMail(reportFrom(body({ ...waiting, place: "failed", error: "provider_timeout", text: "试了三次都不行" })),
      { at: NOW, agent: CHROME, id: "x" });
    expect(failed.subject).toBe("问问立正反馈：回答没完成（provider_timeout）");
    expect(failed.text).toContain("写的内容：\n试了三次都不行");
    expect(reportMail(reportFrom(body({ v: 1, surface: "home", place: "page", text: "英文页按钮点不动\n第二行" })), { at: NOW, agent: CHROME, id: "x" }).subject)
      .toBe("问问立正反馈：英文页按钮点不动");
  });
});

describe("sending", () => {
  const counts = (result: unknown = 0) => vi.fn(async (_command: (string | number)[]) => result);

  it("counts the network by a digest and the day, then mails once", async () => {
    const send = counts(0);
    const mail = vi.fn(async (_: Mail) => {});
    expect(await recordReport(request(), body(waiting), send, mail, NOW)).toBe("mailed");
    const command = send.mock.calls[0][0];
    expect(command.slice(0, 3)).toEqual(["EVAL", REPORT_COUNT_SCRIPT, 2]);
    expect(String(command[3])).toMatch(new RegExp(`^${REPORT_PREFIX}net:[A-Za-z0-9_-]+:2026-10-15$`));
    expect(JSON.stringify(command)).not.toContain("203.0.113.9");
    expect(command.slice(4)).toEqual([`${REPORT_PREFIX}day:2026-10-15`, REPORT_NETWORK_DAILY_LIMIT, REPORT_DAILY_LIMIT, 172_800]);
    expect(mail).toHaveBeenCalledTimes(1);
    expect(mail.mock.calls[0][0].text).toContain("人工智能有欲望吗？");
  });

  it("lets our own checks and crawlers through without mail or counts", async () => {
    const send = counts(0), mail = vi.fn(async (_: Mail) => {});
    for (const agent of ["Mozilla/5.0 HeadlessChrome/141.0", "Googlebot/2.1", ""])
      expect(await recordReport(request({ "user-agent": agent }), body(waiting), send, mail, NOW)).toBe("skipped");
    expect(send).not.toHaveBeenCalled();
    expect(mail).not.toHaveBeenCalled();
  });

  it("stops at the network's and the day's limits, and says so when the mail does not go out", async () => {
    const mail = vi.fn(async (_: Mail) => {});
    await expect(recordReport(request(), body(waiting), counts(1), mail, NOW)).rejects.toMatchObject({ code: "report_limited", status: 429 });
    await expect(recordReport(request(), body(waiting), counts(2), mail, NOW)).rejects.toMatchObject({ code: "report_limited", status: 429 });
    expect(mail).not.toHaveBeenCalled();
    await expect(recordReport(request(), body(waiting), counts(0), async () => { throw new Error("down"); }, NOW))
      .rejects.toMatchObject({ code: "report_unavailable", status: 503 });
    await expect(recordReport(request(), body({ ...waiting, v: 2 }), counts(0), mail, NOW)).rejects.toMatchObject({ code: "invalid_request" });
  });
});

describe("the endpoint", () => {
  function services(count = 0, mailed = 200) {
    const fetcher = vi.fn(async (url: string | URL, _init?: RequestInit) => String(url).startsWith("https://api.resend.com/")
      ? new Response("{}", { status: mailed })
      : new Response(JSON.stringify({ result: count })));
    vi.stubGlobal("fetch", fetcher);
    return fetcher;
  }
  async function post(value: unknown, headers: Record<string, string> = {}, method = "POST", url = "/api/ask-lizheng/report") {
    const out: Record<string, unknown> = {};
    let output = "";
    const res = { statusCode: 0, setHeader: (key: string, v: unknown) => { out[key] = v; }, end: (v = "") => { output = v; } };
    await handler({ method, url, body: value, headers: { host: "ask.lizheng.ai", origin: "https://ask.lizheng.ai", "user-agent": CHROME, ...headers } } as unknown as IncomingMessage,
      res as unknown as ServerResponse);
    return { status: res.statusCode, headers: out, body: output };
  }

  it("mails a report from its own page and answers 204", async () => {
    const fetcher = services();
    const result = await post(waiting);
    expect(result.status).toBe(204);
    expect(result.headers["Cache-Control"]).toBe("no-store, no-transform");
    const sent = fetcher.mock.calls.find(([url]) => String(url) === "https://api.resend.com/emails");
    expect(JSON.parse(String(sent?.[1]?.body))).toMatchObject({ to: ["sunyuzheng@gmail.com"], subject: "问问立正反馈：等了63秒还没出回答" });
  });

  it("says when today's reports are used up, or the mail failed", async () => {
    services(1);
    expect(await post(waiting)).toMatchObject({ status: 429, body: JSON.stringify({ code: "report_limited" }) });
    services(0, 500);
    expect(await post(waiting)).toMatchObject({ status: 503, body: JSON.stringify({ code: "report_unavailable" }) });
  });

  it("refuses other origins and hosts, other methods, parameters and oversized bodies", async () => {
    const fetcher = services();
    expect((await post(waiting, { origin: "https://example.com" })).status).toBe(403);
    expect((await post(waiting, { host: "lizheng-personal-sitecodex.vercel.app", origin: "https://lizheng-personal-sitecodex.vercel.app" })).status).toBe(403);
    expect((await post(waiting, {}, "GET")).status).toBe(405);
    expect((await post(waiting, {}, "POST", "/api/ask-lizheng/report?x=1")).status).toBe(400);
    expect((await post("x".repeat(4097))).status).toBe(413);
    expect((await post({ v: 1 })).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("the pages' side (ask-lizheng src/report.js, synced)", () => {
  const read = (file: string) => readFileSync(path.resolve(__dirname, "..", file), "utf8");

  it("is the copy the last ask-app sync brought over, not a local edit", () => {
    const { report_sha256 } = JSON.parse(read("client/public/ask-app/version.json"));
    expect(createHash("sha256").update(read("shared/ask-report-client.js")).digest("hex")).toBe(report_sha256);
  });

  it("sends what this endpoint accepts, from every place and page", () => {
    const turn = { question: "合成问题？", askedAt: NOW - 63_000, elapsed: 63, quiet: 41, stage: "thinking", error: "provider_timeout",
      status: "sources-only", model: "deepseek-v4-flash", share: "https://ask.lizheng.ai/s/2026-10-15/quiet-river" };
    for (const place of ["waiting", "failed", "answer"] as const)
      for (const surface of ["ask", "app", "home"] as const)
        expect(reportFrom(body(reportPayload({ surface, place, text: "", turn })))).toMatchObject({ v: 1, place, surface, question: "合成问题？", elapsed: 63 });
    expect(reportFrom(body(reportPayload({ surface: "ask", place: "page", text: "按钮点不动", turn })))).toEqual({ v: 1, surface: "ask", place: "page", text: "按钮点不动" });
  });
});
