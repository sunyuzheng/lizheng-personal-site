import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../api/ask-lizheng-public.js";
import { OPS_BACKEND_ORIGIN } from "../shared/ask-ops-gateway.js";
import {
  indexable, listedCards, publicCard, publicDetail, relatedCards, renderIndexPage, renderMissingPage, renderQuestionPage,
  renderSitemap, representatives, similarAskings, type PublicCard, type PublicDetail,
} from "../shared/ask-public-page.js";

// Synthetic questions only: no real asker's words in tests.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const card = (n: number, question: string, extra: Partial<PublicCard> = {}): PublicCard => ({
  public_id: id(n), revision: 1, topic_key: `${n}`.padStart(32, "a"), topic_label: `Topic ${n}`, question, summary: `Summary of question ${n}.`,
  published_at: `2026-10-0${Math.min(n, 9)}T00:00:00.000Z`, updated_at: `2026-10-0${Math.min(n, 9)}T00:00:00.000Z`,
  asked_at: `2026-10-0${Math.min(n, 9)}T00:00:00.000Z`, topic_question_count: 1, likes: 0, ...extra,
});
const BODY = "合成的回答段落，用来测试页面怎么排。".repeat(14);
const detail = (n: number, question: string, extra: Partial<PublicDetail["answer"]> = {}): PublicDetail => ({
  public_id: id(n), revision: 1, topic_key: `${n}`.padStart(32, "a"), topic_label: `Topic ${n}`, question,
  published_at: "2026-10-03T00:00:00.000Z", updated_at: "2026-10-03T00:00:00.000Z",
  answer: {
    status: "answered", summary: "合成的摘要[S1]。", followups: ["合成的追问？"], limitations: "资料没有直接谈到S2。",
    sections: [{ heading: "合成的小标题", body: `${BODY} [S1][S2]\n\n第二段[S9]。`, kind: "source", source_ids: ["S1", "S2"] }],
    sources: [
      { id: "S1", title: "公开视频", url: "https://www.youtube.com/watch?v=synthetic", date: "2026-01-02T00:00:00Z", reason: "讲到了这件事" },
      { id: "S2", title: "会员帖子", url: "https://www.superlinear.academy/c/synthetic", source_visibility: "members-only" },
    ],
    ...extra,
  },
});

describe("public answer pages", () => {
  it("reads cards and answers defensively", () => {
    expect(publicCard({ ...card(1, "一个合成的问题？"), public_id: "nope" })).toBeNull();
    expect(publicCard(card(1, "一个合成的问题？"))?.question).toBe("一个合成的问题？");
    const raw = detail(1, "一个合成的问题？");
    const parsed = publicDetail({ ...raw, answer: { ...raw.answer, sources: [...raw.answer.sources, { id: "S3", title: "不安全", url: "http://example.test" }, { id: "x", title: "坏", url: "https://example.test" }] } });
    expect(parsed?.answer.sources.map(s => s.id)).toEqual(["S1", "S2"]);
    expect(publicDetail({ ...raw, answer: null })).toBeNull();
  });

  it("indexes only the first wording of a question, newest asked first", () => {
    const cards = [card(1, "怎样判断自己是不是在做fake work？"), card(2, "怎么判断自己是不是在做fake work？"), card(3, "模型后训练的本质是什么？")];
    const reps = representatives(cards);
    expect(reps.get(id(2))).toBe(id(1));
    expect(listedCards(cards).map(c => c.public_id)).toEqual([id(3), id(1)]);
    expect(similarAskings(cards[0], cards, reps)).toBe(2);
    expect(indexable(detail(2, "怎么判断自己是不是在做fake work？"), reps.get(id(2)))).toBe(false);
    expect(indexable(detail(1, "怎样判断自己是不是在做fake work？"), reps.get(id(1)))).toBe(true);
    expect(relatedCards({ public_id: id(3), topic_key: cards[2].topic_key }, cards).map(c => c.public_id)).toEqual([id(1)]);
  });

  it("does not index thin or unsourced answers", () => {
    expect(indexable(detail(1, "一个合成的问题？", { sections: [{ heading: "短", body: "太短了。", kind: "synthesis", source_ids: [] }] }))).toBe(false);
    expect(indexable(detail(1, "一个合成的问题？", { sources: [] }))).toBe(false);
    expect(indexable(detail(1, "一个合成的问题？", { status: "clarify" }))).toBe(false);
  });

  it("renders the answer in the first HTML, escaped, with its address and sources", () => {
    const html = renderQuestionPage(detail(1, "<script>alert(1)</script>会被转义吗？"), { related: [], similar: 3, indexable: true });
    expect(html).not.toContain("<script>alert(1)");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain(`<link rel="canonical" href="https://www.lizheng.ai/ask/${id(1)}">`);
    expect(html).toContain('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">');
    expect(html).toContain("3次类似提问");
    expect(html).toContain(BODY.slice(0, 20));
    // [S1][S2] reads as 1,2; an id with no source ([S9]) is dropped.
    expect(html).toContain('<a class="cite" href="#source-1" aria-label="出处1">1</a><span class="cite-sep">,</span><a class="cite" href="#source-2"');
    expect(html).not.toContain("#source-9");
    expect(html).toContain("超线性学院 · 会员");
    expect(html).toContain(`href="https://ask.lizheng.ai/?q=${encodeURIComponent("合成的追问？")}" rel="nofollow"`);
    const json = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)![1]);
    expect(json["@graph"][1]).toMatchObject({ "@type": "Question", answerCount: 1, acceptedAnswer: { "@type": "Answer" } });
    expect(json["@graph"][1].acceptedAnswer.citation).toHaveLength(2);
    expect(renderQuestionPage(detail(1, "一个合成的问题？"), { related: [], similar: 0, indexable: false })).toContain('content="noindex, follow"');
  });

  it("lists every question once and names them in a sitemap", () => {
    const cards = [card(1, "怎样判断自己是不是在做fake work？"), card(2, "怎么判断自己是不是在做fake work？"), card(3, "模型后训练的本质是什么？", { asked_at: undefined })];
    const index = renderIndexPage(cards);
    expect(index).toContain(`/ask/${id(1)}`);
    expect(index).not.toContain(`/ask/${id(2)}`);
    expect(index).toContain("常被问到");
    expect(index).toContain('<link rel="canonical" href="https://www.lizheng.ai/ask">');
    const xml = renderSitemap(cards);
    expect(xml.match(/<loc>/g)).toHaveLength(3);
    expect(xml).toContain("<loc>https://www.lizheng.ai/ask</loc>");
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    expect(renderMissingPage()).toContain('content="noindex, follow"');
  });
});

type Reply = { status: number; headers: Record<string, string>; body: string };
async function call(path: string, host = "www.lizheng.ai", method = "GET"): Promise<Reply> {
  const req = Readable.from([]);
  Object.assign(req, { url: path, method, headers: { host } });
  const headers: Record<string, string> = {};
  let body = "";
  const res = { statusCode: 200, setHeader(name: string, value: string) { headers[name.toLowerCase()] = value; }, end(text: string) { body = text; } };
  await handler(req as unknown as IncomingMessage, res as unknown as ServerResponse);
  return { status: res.statusCode, headers, body };
}
const list = (items: PublicCard[], next: string | null = null) => Response.json({ v: 1, items, next_cursor: next });

describe("public answer page handler", () => {
  beforeEach(() => { vi.stubEnv("ASK_OPS_BACKEND_ORIGIN", OPS_BACKEND_ORIGIN); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("renders a published question from Ops, cached at the CDN", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => String(url).includes("action=detail")
      ? Response.json(detail(1, "一个合成的问题？")) : list([card(1, "一个合成的问题？"), card(2, "周末带孩子去哪里玩比较好？")])));
    const reply = await call(`/api/ask-lizheng-public?__route=page&id=${id(1)}`);
    expect(reply.status).toBe(200);
    expect(reply.headers["cache-control"]).toContain("s-maxage=600");
    expect(reply.headers["content-security-policy"]).toContain("script-src 'self'");
    expect(reply.headers["x-robots-tag"]).toBeUndefined();
    expect(reply.body).toContain("<h1>");
    expect(reply.body).toContain("周末带孩子去哪里玩比较好？");
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery?action=detail&public_id=${id(1)}`);
  });

  it("answers 404 for a withdrawn question and 503 when Ops is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ code: "public_item_unavailable" }, { status: 404 })));
    expect((await call(`/api/ask-lizheng-public?__route=page&id=${id(5)}`)).status).toBe(404);
    expect((await call("/api/ask-lizheng-public?__route=page&id=not-a-uuid")).status).toBe(404);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 500 })));
    const down = await call(`/api/ask-lizheng-public?__route=page&id=${id(6)}`);
    expect(down.status).toBe(503);
    expect(down.headers["cache-control"]).toBe("no-store");
  });

  it("keeps copies on other hosts out of search, and serves the index and sitemap", async () => {
    // Past the five minutes a warm function keeps the list.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 3_600_000);
    vi.stubGlobal("fetch", vi.fn(async () => list([card(7, "第七个合成的问题？")])));
    const index = await call("/api/ask-lizheng-public?__route=index", "lizheng-preview.vercel.app");
    expect(index.status).toBe(200);
    expect(index.headers["x-robots-tag"]).toBe("noindex");
    const sitemap = await call("/api/ask-lizheng-public?__route=sitemap");
    expect(sitemap.headers["content-type"]).toBe("application/xml; charset=utf-8");
    expect(sitemap.body).toContain(`/ask/${id(7)}`);
    expect((await call("/api/ask-lizheng-public?__route=index", "www.lizheng.ai", "POST")).status).toBe(405);
  });
});
