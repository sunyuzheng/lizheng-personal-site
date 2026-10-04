import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash, createHmac, webcrypto } from "node:crypto";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import handler from "../api/ask-lizheng-share";
import {
  claimShareBonus, createShare, listShares, quotaDay, readShare, shareBonusOpen, shareRequest,
  SHARE_BONUS_SCRIPT, SHARE_COUNT_SCRIPT, SHARE_LIST_SCRIPT, SHARE_PAGE_SCRIPT, SHARE_SCRIPT, verifyShareProof,
  type SharedAnswer,
} from "../shared/ask-share-link";
import { renderShareMissingPage, renderSharePage, renderShareSitemap } from "../shared/ask-share-page";
import { usageDay } from "../shared/ask-usage";

// Synthetic records only: no real asker's words in tests.
const SECRET = "a".repeat(64);
const RECORD = "00000000-0000-4000-8000-000000000001";
const NOW = Date.parse("2026-10-04T03:00:00.000Z");
const proof = (record = RECORD, word = "career-choice") => createHmac("sha256", SECRET).update(`ask-share:v1:${record}:${word}`).digest("hex");
const body = (extra: Record<string, unknown> = {}) => ({ record_id: RECORD, word: "career-choice", proof: proof(), surface: "ask", bonus: true, ...extra });
const BODY = "合成的回答段落，用来测试分享页怎么排。".repeat(14);
const answer = (extra: Record<string, unknown> = {}) => ({
  status: "answered", summary: "合成的摘要[S1]。", followups: ["合成的追问？"], clarifying_questions: [], limitations: "资料没有直接谈到S2。",
  sections: [
    { heading: "合成的小标题", body: `${BODY} [S1][S2]`, kind: "source", source_ids: ["S1", "S2"] },
    { heading: "落到处境", body: "合成的应用段落。", kind: "application", source_ids: ["S1"] },
  ],
  sources: [
    { id: "S1", title: "公开视频 <b>", url: "https://www.youtube.com/watch?v=synthetic", date: "2026-01-02T00:00:00Z", reason: "讲到了这件事", excerpt: "合成摘录" },
    { id: "S2", title: "会员帖子", url: "https://www.superlinear.academy/c/synthetic", source_visibility: "members-only" },
  ],
  ...extra,
});
const shared = (extra: Partial<SharedAnswer> = {}): SharedAnswer => ({
  day: "2026-10-04", slug: "career-choice", question: "合成的问题：怎么选方向？", answer: answer() as SharedAnswer["answer"],
  intent: "understand", created_at: "2026-10-04T02:00:00.000Z", ...extra,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(NOW);
  vi.stubGlobal("crypto", webcrypto);
  vi.stubEnv("ASK_QUOTA_STORE_SECRET", SECRET);
  vi.stubEnv("ASK_QUOTA_ENABLED", "true");
  vi.stubEnv("ASK_AUTH_SECRET", "s".repeat(48));
  vi.stubEnv("ASK_ADMISSION_SECRET", "test-admission-secret-with-at-least-32-bytes");
  vi.stubEnv("ASK_AUTH_REDIS_REST_URL", "https://synthetic.upstash.io");
  vi.stubEnv("ASK_AUTH_REDIS_REST_TOKEN", "synthetic-not-live");
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("what a page may send", () => {
  it("takes one answer's record, word and proof, where it was shared and whether to give a question back", () => {
    expect(shareRequest(body(), "ask.lizheng.ai")).toEqual(body());
    expect(shareRequest(body({ surface: "home", bonus: false }), "www.lizheng.ai").surface).toBe("home");
    for (const bad of [
      body({ surface: "home" }), body({ question: "synthetic" }), body({ word: "Career" }), body({ word: "职业" }),
      body({ word: "a-b-c-d-e" }), body({ record_id: "not-a-uuid" }), body({ proof: "x" }), body({ bonus: "yes" }), null, [],
    ]) expect(() => shareRequest(bad, "ask.lizheng.ai")).toThrow("invalid_request");
    expect(() => shareRequest(body({ surface: "ask" }), "www.lizheng.ai")).toThrow("invalid_request");
  });

  it("checks Builder's proof for this record and this word", () => {
    expect(() => verifyShareProof(body())).not.toThrow();
    expect(() => verifyShareProof(body({ word: "other-word" }))).toThrow("invalid_share");
    expect(() => verifyShareProof(body({ record_id: RECORD.replace(/1$/, "2") }))).toThrow("invalid_share");
    vi.stubEnv("ASK_QUOTA_STORE_SECRET", "");
    expect(() => verifyShareProof(body())).toThrow("share_unavailable");
  });
});

describe("storage", () => {
  it("shares under fixed keys and says where the page is", async () => {
    const send = vi.fn(async () => ["NEW", "career-choice", "2026-10-04"]);
    expect(await createShare(shareRequest(body(), "ask.lizheng.ai"), NOW, send)).toEqual(
      { url: "https://ask.lizheng.ai/s/2026-10-04/career-choice", day: "2026-10-04", slug: "career-choice", first: true });
    expect(send.mock.calls[0][0]).toEqual(["EVAL", SHARE_SCRIPT, 3, `ask-ops:{v3}:record:${RECORD}`, `ask-ops:{v3}:deleted:${RECORD}`,
      "ask-ops:{v3}:shares", "ask-ops:{v3}:", RECORD, "career-choice", new Date(NOW).toISOString(), 1, "ask",
      `ask-ops:{v3}:usage:day:${usageDay(NOW)}`, "ask-ops:{v3}:usage:total", 400 * 86_400, NOW]);
    vi.stubEnv("ASK_USAGE_ENABLED", "false");
    await createShare(shareRequest(body(), "ask.lizheng.ai"), NOW, send);
    expect(send.mock.calls[1][0][10]).toBe(0);
    await expect(createShare(shareRequest(body(), "ask.lizheng.ai"), NOW, async () => ["GONE", "", ""])).rejects.toThrow("share_not_found");
    await expect(createShare(shareRequest(body(), "ask.lizheng.ai"), NOW, async () => ["NEW", "../x", "2026-10-04"])).rejects.toThrow("share_unavailable");
    // No proof, no storage.
    const untouched = vi.fn();
    await expect(createShare(shareRequest(body({ proof: "b".repeat(64) }), "ask.lizheng.ai"), NOW, untouched)).rejects.toThrow("invalid_share");
    expect(untouched).not.toHaveBeenCalled();
  });

  it("gives a question back on the quota subject's own keys, and counts it", async () => {
    const subject = "guest:" + "g".repeat(43);
    const prefix = `ask-quota:v1:{${createHash("sha256").update(subject).digest("hex")}}:2026-10-04:`;
    const send = vi.fn(async (command: (string | number)[]) => (command[1] === SHARE_BONUS_SCRIPT ? ["GRANTED", 2, 0] : 1));
    expect(await claimShareBonus({ sub: subject, tier: "public", authenticated: false }, "home", NOW, send)).toEqual({ bonus: "granted", remaining: 1 });
    expect(send.mock.calls[0][0]).toEqual(["EVAL", SHARE_BONUS_SCRIPT, 3, `${prefix}used`, `${prefix}pending`, `${prefix}share-bonus`,
      Math.floor(NOW / 1000), quotaDay(NOW).expires]);
    expect(send.mock.calls[1][0]).toEqual(["EVAL", SHARE_COUNT_SCRIPT, 2, `ask-ops:{v3}:usage:day:${usageDay(NOW)}`, "ask-ops:{v3}:usage:total",
      400 * 86_400, "home:share_bonus", "all:share_bonus"]);
    // The ledger's day and expiry are Builder's: Beijing midnight, kept two more days.
    expect(quotaDay(Date.parse("2026-10-04T16:30:00.000Z"))).toEqual({ day: "2026-10-05", expires: Date.parse("2026-10-06T00:00:00+08:00") / 1000 + 172_800 });
    const founding = vi.fn();
    expect(await claimShareBonus({ sub: "user:x", tier: "founding", authenticated: true }, "ask", NOW, founding)).toEqual({ bonus: "unlimited" });
    expect(founding).not.toHaveBeenCalled();
    expect(await claimShareBonus({ sub: subject, tier: "public", authenticated: false }, "ask", NOW, async () => ["CLAIMED", 3, 0]))
      .toEqual({ bonus: "claimed", remaining: 0 });
    await expect(claimShareBonus({ sub: subject, tier: "public", authenticated: false }, "ask", NOW, async () => ["GRANTED", -1, 0])).rejects.toThrow("share_unavailable");
  });

  it("reads whether today's bonus is still open, and not for Founding Members", async () => {
    const identity = { sub: "guest:" + "g".repeat(43), tier: "public" as const, authenticated: false };
    expect(await shareBonusOpen(identity, NOW, async () => 0)).toBe(true);
    expect(await shareBonusOpen(identity, NOW, async () => 1)).toBe(false);
    expect(await shareBonusOpen(identity, NOW, async () => { throw new Error("down"); })).toBeUndefined();
    expect(await shareBonusOpen({ ...identity, tier: "founding" }, NOW, vi.fn())).toBe(false);
  });

  it("reads a page's record, counting real readers only", async () => {
    const send = vi.fn(async () => ["OK", "合成的问题？", JSON.stringify(answer()), "apply", "2026-10-04T02:00:00.000Z"]);
    const page = await readShare("2026-10-04", "career-choice-2", { reader: true, now: NOW, send });
    expect(page).toMatchObject({ day: "2026-10-04", slug: "career-choice-2", question: "合成的问题？", intent: "apply", created_at: "2026-10-04T02:00:00.000Z" });
    expect(send.mock.calls[0][0]).toEqual(["EVAL", SHARE_PAGE_SCRIPT, 1, "ask-ops:{v3}:share:2026-10-04:career-choice-2", "ask-ops:{v3}:",
      "2026-10-04", "career-choice-2", 1, `ask-ops:{v3}:usage:day:${usageDay(NOW)}`, "ask-ops:{v3}:usage:total", 400 * 86_400]);
    await readShare("2026-10-04", "career-choice", { reader: false, now: NOW, send });
    expect(send.mock.calls[1][0][7]).toBe(0);
    expect(await readShare("2026-10-04", "career-choice", { reader: true, now: NOW, send: async () => ["MISSING"] })).toBeNull();
    const untouched = vi.fn();
    for (const [day, slug] of [["2026-1-4", "a"], ["2026-10-04", "UPPER"], ["2026-10-04", "a_b"], ["2026-10-04", "a/b"]])
      expect(await readShare(day, slug, { reader: true, send: untouched })).toBeNull();
    expect(untouched).not.toHaveBeenCalled();
  });

  it("lists every shared page for the sitemap", async () => {
    const send = vi.fn(async () => [["2026-10-04", "career-choice", "2026-10-04T03:00:00.000Z"], ["2026-10-03", "fake-work", "2026-10-03T03:00:00.000Z"],
      ["bad", "x", ""]]);
    const listed = await listShares(1000, send);
    expect(send.mock.calls[0][0]).toEqual(["EVAL", SHARE_LIST_SCRIPT, 1, "ask-ops:{v3}:shares", "ask-ops:{v3}:", 1000]);
    expect(listed.map(share => share.slug)).toEqual(["career-choice", "fake-work"]);
    const sitemap = renderShareSitemap(listed);
    expect(sitemap).toContain("<loc>https://ask.lizheng.ai/s/2026-10-04/career-choice</loc>");
    expect(sitemap).toContain("<loc>https://ask.lizheng.ai/s/2026-10-03/fake-work</loc>");
    expect(sitemap).toContain("<lastmod>2026-10-04</lastmod>");
  });
});

describe("the page", () => {
  it("shows the question and answer in the first HTML, public and with a preview card", () => {
    const html = renderSharePage(shared());
    expect(html).toContain("<title>合成的问题：怎么选方向？ · 问问立正</title>");
    expect(html).toContain('<meta property="og:title" content="合成的问题：怎么选方向？">');
    expect(html).toContain('<meta property="og:description" content="合成的摘要。">');
    expect(html).toContain('<meta property="og:image" content="https://www.lizheng.ai/og/ask-share.jpg">');
    expect(html).toContain('<meta itemprop="image" content="https://www.lizheng.ai/og/ask-share-square.jpg">');
    expect(html).toContain('<link rel="canonical" href="https://ask.lizheng.ai/s/2026-10-04/career-choice">');
    expect(html).toContain('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">');
    expect(html).toContain('"@type":"Question"');
    expect(html).toContain("2026年10月4日提问");
    expect(html).toContain("公开视频 &lt;b&gt;");
    expect(html).not.toContain("<b>公开视频");
    // Sources show their title, kind and reason, never the transcript excerpt.
    expect(html).not.toContain("合成摘录");
    expect(html).toContain('class="member">超线性学院 · 会员');
    expect(html).toContain('<a class="button" href="https://ask.lizheng.ai/" data-to="ask">去问问立正</a>');
    expect(html).toContain("也可以接着问");
    expect(html).toContain(">AI推演<");
    // It lives on ask.lizheng.ai: its own files from /s/, everything else by full address.
    expect(html).toContain('<script defer src="/s/page.js"></script>');
    expect(html).toContain('href="https://www.lizheng.ai/ask/privacy"');
    expect(html).not.toMatch(/href="\/(?!s\/)/);
  });

  it("gives every shared answer to search engines, and says whose situation an application uses", () => {
    // What can be shared goes to search (the owner's rule, 2026-10-04): situations and short answers too.
    const html = renderSharePage(shared({ intent: "apply" }));
    expect(html).toContain('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">');
    expect(html).toContain("application/ld+json");
    expect(html).toContain(">结合提问者的处境<");
    expect(html).toContain("也可以接着问");
    expect(renderSharePage(shared({ answer: answer({ sections: [{ heading: "短", body: "太短了。", kind: "synthesis", source_ids: ["S1"] }] }) as SharedAnswer["answer"] })))
      .toContain('content="index, follow, max-snippet:-1, max-image-preview:large"');
  });

  it("says plainly when a share is gone", () => {
    const html = renderShareMissingPage();
    expect(html).toContain("这个分享不在了");
    expect(html).toContain('content="noindex, follow"');
  });
});

describe("the endpoint", () => {
  type Reply = { statusCode: number; headers: Map<string, unknown>; body: string };
  async function call(path: string, options: { method?: string; host?: string; origin?: string; agent?: string; cookie?: string; payload?: unknown } = {}): Promise<Reply> {
    const result = { statusCode: 200, headers: new Map<string, unknown>(), body: "",
      setHeader(name: string, value: unknown) { this.headers.set(name.toLowerCase(), value); },
      end(value = "") { this.body = String(value); } };
    const raw = options.payload === undefined ? "" : JSON.stringify(options.payload);
    const req = Object.assign(Readable.from(raw ? [Buffer.from(raw)] : []), {
      url: path, method: options.method || "GET",
      headers: { host: options.host || "ask.lizheng.ai", origin: options.origin, "user-agent": options.agent ?? "Mozilla/5.0 Chrome/141", cookie: options.cookie,
        "content-length": String(Buffer.byteLength(raw)) },
    });
    await handler(req as unknown as IncomingMessage, result as unknown as ServerResponse);
    return result;
  }
  function upstash(reply: (command: (string | number)[]) => unknown) {
    const fetcher = vi.fn(async (_url: string, init: RequestInit) => Response.json({ result: reply(JSON.parse(String(init.body))) }));
    vi.stubGlobal("fetch", fetcher);
    return fetcher;
  }

  it("shares from the page's own origin and gives a question back", async () => {
    const fetcher = upstash(command => (command[1] === SHARE_SCRIPT ? ["NEW", "career-choice", "2026-10-04"] : command[1] === SHARE_BONUS_SCRIPT ? ["GRANTED", 2, 0] : 1));
    const reply = await call("/api/ask-lizheng-share?__route=share", { method: "POST", origin: "https://ask.lizheng.ai", payload: body() });
    expect(reply.statusCode).toBe(200);
    expect(JSON.parse(reply.body)).toEqual({ url: "https://ask.lizheng.ai/s/2026-10-04/career-choice", bonus: "granted", remaining: 1 });
    // A first visit gets the anonymous browser cookie the daily count uses.
    expect(String(reply.headers.get("set-cookie"))).toMatch(/^__Secure-ask-guest=/);
    expect(reply.headers.get("cache-control")).toBe("no-store, no-transform");
    expect(fetcher.mock.calls.map(([, init]) => JSON.parse(String(init.body))[1])).toEqual([SHARE_SCRIPT, SHARE_BONUS_SCRIPT, SHARE_COUNT_SCRIPT]);
  });

  it("never gives a question back inside WeChat or the iPhone app, or when the page did not offer it", async () => {
    for (const [agent, bonus] of [["Mozilla/5.0 MicroMessenger/8.0.50", true], ["Mozilla/5.0 Mobile/15E148 AskLizhengApp/1.0.0", true], ["Mozilla/5.0 Chrome/141", false]] as const) {
      const fetcher = upstash(() => ["NEW", "career-choice", "2026-10-04"]);
      const reply = await call("/api/ask-lizheng-share?__route=share", { method: "POST", origin: "https://ask.lizheng.ai", agent,
        payload: body({ bonus, surface: agent.includes("AskLizhengApp") ? "app" : "ask" }) });
      expect(JSON.parse(reply.body)).toEqual({ url: "https://ask.lizheng.ai/s/2026-10-04/career-choice", bonus: "off" });
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });

  it("keeps the link when the question back cannot be given", async () => {
    upstash(command => { if (command[1] === SHARE_BONUS_SCRIPT) throw new Error("down"); return ["NEW", "career-choice", "2026-10-04"]; });
    const reply = await call("/api/ask-lizheng-share?__route=share", { method: "POST", origin: "https://ask.lizheng.ai", payload: body() });
    expect(JSON.parse(reply.body)).toMatchObject({ url: "https://ask.lizheng.ai/s/2026-10-04/career-choice", bonus: "off" });
  });

  it("refuses other origins, methods, routes and proofs", async () => {
    const fetcher = upstash(() => ["NEW", "career-choice", "2026-10-04"]);
    const refusals: [Parameters<typeof call>, number, string][] = [
      [["/api/ask-lizheng-share?__route=share", { method: "POST", origin: "https://evil.example", payload: body() }], 403, "invalid_origin"],
      [["/api/ask-lizheng-share?__route=share", { method: "POST", host: "x.vercel.app", origin: "https://x.vercel.app", payload: body() }], 403, "invalid_origin"],
      [["/api/ask-lizheng-share?__route=share", { method: "POST", payload: body() }], 403, "invalid_origin"],
      [["/api/ask-lizheng-share?__route=share", { origin: "https://ask.lizheng.ai" }], 405, "method_not_allowed"],
      [["/api/ask-lizheng-share?__route=share&x=1", { method: "POST", origin: "https://ask.lizheng.ai", payload: body() }], 400, "invalid_request"],
      [["/api/ask-lizheng-share?__route=nope", { method: "POST", origin: "https://ask.lizheng.ai", payload: body() }], 400, "invalid_request"],
      [["/api/ask-lizheng-share?__route=share", { method: "POST", origin: "https://ask.lizheng.ai", payload: body({ proof: "c".repeat(64) }) }], 403, "invalid_share"],
      [["/api/ask-lizheng-share?__route=share", { method: "POST", host: "www.lizheng.ai", origin: "https://www.lizheng.ai", payload: body() }], 400, "invalid_request"],
    ];
    for (const [args, status, code] of refusals) {
      const reply = await call(...args);
      expect([reply.statusCode, JSON.parse(reply.body).code]).toEqual([status, code]);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("has no way to take a shared link back", async () => {
    const fetcher = upstash(() => 1);
    const reply = await call("/api/ask-lizheng-share?__route=unshare", { method: "POST", host: "www.lizheng.ai", origin: "https://www.lizheng.ai",
      payload: { record_id: RECORD, word: "career-choice", proof: proof() } });
    expect([reply.statusCode, JSON.parse(reply.body)]).toEqual([400, { code: "invalid_request" }]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("serves the page, never kept by a cache, and a plain 404 when it is gone", async () => {
    const fetcher = upstash(command => (command[1] === SHARE_PAGE_SCRIPT ? ["OK", "合成的问题？", JSON.stringify(answer()), "understand", "2026-10-04T02:00:00.000Z"] : null));
    const page = await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice");
    expect(page.statusCode).toBe(200);
    expect(page.body).toContain("<h1>");
    expect(page.headers.get("cache-control")).toBe("no-store");
    expect(page.headers.get("content-security-policy")).toContain("img-src 'self' https://www.lizheng.ai");
    expect(page.headers.has("x-robots-tag")).toBe(false);
    // A link preview reads the page but is not counted as a reader.
    await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice", { agent: "Slackbot-LinkExpanding 1.0" });
    expect(JSON.parse(String(fetcher.mock.calls[1][1].body))[7]).toBe(0);
    const head = await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice", { method: "HEAD" });
    expect(JSON.parse(String(fetcher.mock.calls[2][1].body))[7]).toBe(0);
    expect(head.statusCode).toBe(200);
    upstash(() => ["MISSING"]);
    const gone = await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice");
    expect(gone.statusCode).toBe(404);
    expect(gone.body).toContain("这个分享不在了");
    const elsewhere = await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice", { host: "x.vercel.app" });
    expect(elsewhere.headers.get("x-robots-tag")).toBe("noindex");
    upstash(() => { throw new Error("down"); });
    expect((await call("/api/ask-lizheng-share?__route=page&day=2026-10-04&slug=career-choice")).statusCode).toBe(503);
  });

  it("serves the sitemap of pages search engines may index", async () => {
    upstash(() => [["2026-10-04", "career-choice", "2026-10-04T03:00:00.000Z"]]);
    const sitemap = await call("/api/ask-lizheng-share?__route=sitemap");
    expect(sitemap.statusCode).toBe(200);
    expect(sitemap.headers.get("content-type")).toBe("application/xml; charset=utf-8");
    expect(sitemap.body).toContain("https://ask.lizheng.ai/s/2026-10-04/career-choice");
  });
});
