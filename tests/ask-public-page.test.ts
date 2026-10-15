import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../api/ask-lizheng-public.js";
import { OPS_BACKEND_ORIGIN } from "../shared/ask-ops-gateway.js";
import {
  indexable, listable, publicCard, publicDayFile, publicDaysFile, publicDetail, publicTopicFile, relatedOf, renderDayPage,
  renderDaySitemap, renderIndexPage, renderMissingPage, renderQuestionPage, renderSitemapIndex, wwwPagePath,
  type PublicCard, type PublicDaysFile, type PublicDetail,
} from "../shared/ask-public-page.js";

// Synthetic questions only: no real asker's words in tests.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const card = (n: number, question: string, extra: Partial<PublicCard> = {}): PublicCard => ({
  public_id: id(n), revision: 1, topic_key: `${n}`.padStart(32, "a"), topic_label: `Topic ${n}`, question, summary: `Summary of question ${n}.`,
  published_at: `2026-10-0${Math.min(n, 9)}T00:00:00.000Z`, updated_at: `2026-10-0${Math.min(n, 9)}T00:00:00.000Z`,
  asked_at: `2026-10-0${Math.min(n, 9)}T00:00:00.000Z`, topic_question_count: 1, ...extra,
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
    // Ops' files: a topic's, a day's and the days'; a card there has no count.
    const { topic_question_count: _, ...bare } = card(1, "一个合成的问题？");
    expect(publicCard(bare)).not.toHaveProperty("topic_question_count");
    expect(publicCard({ ...bare, duplicate_of: id(9) })?.duplicate_of).toBe(id(9));
    expect(publicCard({ ...bare, duplicate_of: "nope" })).not.toHaveProperty("duplicate_of");
    expect(publicTopicFile({ v: 1, topic_key: "a".repeat(32), topic_label: "主题", count: 5, cards: [bare, { bad: 1 }] })?.cards).toHaveLength(1);
    expect(publicTopicFile({ v: 1, topic_key: "a".repeat(32), topic_label: "主题", cards: [] })).toBeNull();
    expect(publicDayFile({ v: 1, day: "2026-10-15", cards: [bare] })?.cards).toHaveLength(1);
    expect(publicDayFile({ v: 1, day: "15 Oct", cards: [] })).toBeNull();
    expect(publicDaysFile({ v: 1, days: [{ day: "2026-10-15", count: 2 }, { day: "x", count: 1 }], total: 2 }))
      .toEqual({ days: [{ day: "2026-10-15", count: 2 }], total: 2 });
  });

  it("names the book and blog Chinese editions by what they are", () => {
    const raw = detail(1, "一个合成的问题？");
    const html = renderQuestionPage({ ...raw, answer: { ...raw.answer, sources: [
      { id: "S1", title: "合成的一章", url: "https://www.lizheng.ai/book/growth-data-analytics-playbook/3", source_type: "book-chapter" },
      { id: "S2", title: "合成的博客", url: "https://www.statsig.com/blog/synthetic", source_type: "blog-post" },
    ] } }, { related: [], similar: 1, indexable: true });
    expect(html).toContain("<span>书</span>");
    expect(html).toContain("<span>Statsig博客</span>");
  });

  it("indexes and lists only the first wording of a question, as Ops marks it", () => {
    // Ops names the first wording on a later one (duplicate_of) as it writes the files.
    expect(indexable({ ...detail(2, "怎么判断自己是不是在做fake work？"), duplicate_of: id(1) })).toBe(false);
    expect(indexable(detail(1, "怎样判断自己是不是在做fake work？"))).toBe(true);
    expect(listable(card(2, "怎么判断自己是不是在做fake work？", { duplicate_of: id(1) }))).toBe(false);
    expect(listable(card(3, "太短？"))).toBe(false);
    expect(listable(card(1, "怎样判断自己是不是在做fake work？"))).toBe(true);
  });

  it("suggests its topic's newest questions first, then the newest asked, never itself or a rewording", () => {
    const topic = { topic_key: "t".repeat(32), topic_label: "主题", count: 4,
      cards: [card(1, "这个问题自己不会出现吗？"), card(2, "同主题的另一个问题？"), card(3, "同主题的另一个问法？", { duplicate_of: id(2) })] };
    const recent = [card(4, "最新的一个合成问题？"), card(2, "同主题的另一个问题？"), card(5, "第二新的合成问题？")];
    expect(relatedOf({ public_id: id(1) }, topic, recent).map(c => c.public_id)).toEqual([id(2), id(4), id(5)]);
    expect(relatedOf({ public_id: id(1) }, null, recent, 2).map(c => c.public_id)).toEqual([id(4), id(2)]);
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

  it("lists the newest questions once, every day that has some, and a sitemap for each day", () => {
    const cards = [card(1, "怎样判断自己是不是在做fake work？"), card(2, "怎么判断自己是不是在做fake work？", { duplicate_of: id(1) }), card(3, "模型后训练的本质是什么？", { asked_at: undefined })];
    const days: PublicDaysFile = { days: [{ day: "2026-10-15", count: 2 }, { day: "2026-10-14", count: 1 }, { day: "2026-09-30", count: 7 }], total: 10 };
    const index = renderIndexPage(days, cards);
    expect(index).toContain(`/ask/${id(1)}`);
    expect(index).not.toContain(`/ask/${id(2)}`);
    expect(index).toContain("常被问到");
    expect(index).toContain("<span>10个问题</span>");
    expect(index).toContain('<link rel="canonical" href="https://www.lizheng.ai/ask">');
    expect(index).toContain('<span class="month">2026年10月</span><a href="/ask/2026-10-15" data-to="day">15日<small>2</small></a><a href="/ask/2026-10-14"');
    expect(index).toContain('<span class="month">2026年9月</span><a href="/ask/2026-09-30" data-to="day">30日<small>7</small></a>');
    // A day: its questions, the days around it, kept out of search (its questions' pages are what search shows).
    const day = renderDayPage({ day: "2026-10-14", cards }, days);
    expect(day).toContain("<h1>2026年10月14日的提问</h1>");
    expect(day).toContain('<link rel="canonical" href="https://www.lizheng.ai/ask/2026-10-14">');
    expect(day).toContain('content="noindex, follow"');
    expect(day).not.toContain(`/ask/${id(2)}`);
    expect(day).toContain('<a href="/ask/2026-09-30" data-to="day">← 2026年9月30日</a>');
    expect(day).toContain('<a href="/ask/2026-10-15" data-to="day">2026年10月15日 →</a>');
    expect(renderDayPage({ day: "2026-10-14", cards }, null)).not.toContain("←");
    // The sitemap: one per day; the newest day's also names /ask.
    const all = renderSitemapIndex(days);
    expect(all).toContain("<sitemapindex");
    expect(all.match(/<loc>/g)).toHaveLength(3);
    expect(all).toContain("<loc>https://www.lizheng.ai/ask/sitemap/2026-10-15.xml</loc>");
    const newest = renderDaySitemap({ day: "2026-10-15", cards }, true);
    expect(newest.match(/<loc>/g)).toHaveLength(3);
    expect(newest).toContain("<loc>https://www.lizheng.ai/ask</loc>");
    expect(newest).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    expect(renderDaySitemap({ day: "2026-10-14", cards }, false).match(/<loc>/g)).toHaveLength(2);
    expect(renderMissingPage()).toContain('content="noindex, follow"');
    expect(renderMissingPage("day")).toContain("这一天没有公开的问题");
  });
});

// 2026-10-14: a question's page here has the address of its own page in 问问立正.
describe("one address on both sites", () => {
  const share = "https://ask.lizheng.ai/s/2026-10-14/career-choice";
  it("gives a question with its own page that address here, and keeps the number for one without", () => {
    expect(wwwPagePath(card(1, "合成的问题？", { share_url: share }))).toBe("/ask/2026-10-14/career-choice");
    expect(wwwPagePath(card(1, "合成的问题？"))).toBe(`/ask/${id(1)}`);
    expect(wwwPagePath(card(1, "合成的问题？", { share_url: "https://example.test/s/2026-10-14/x" }))).toBe(`/ask/${id(1)}`);
  });
  it("links the page, the list and the sitemap by that address, and continues the question in 问问立正", () => {
    const html = renderQuestionPage({ ...detail(1, "一个合成的问题？"), share_url: share }, { related: [card(2, "第二个合成的问题？", { share_url: "https://ask.lizheng.ai/s/2026-10-13/second" })], similar: 1, indexable: true });
    expect(html).toContain('<link rel="canonical" href="https://www.lizheng.ai/ask/2026-10-14/career-choice">');
    expect(html).toContain(`<a class="button" href="${share}" data-to="continue">在问问立正里接着问</a>`);
    expect(html).toContain('class="button line"');
    expect(html).toContain('href="/ask/2026-10-13/second"');
    expect(html).toContain('"url":"https://www.lizheng.ai/ask/2026-10-14/career-choice"');
    const cards = [card(1, "一个合成的问题？", { share_url: share })];
    expect(renderIndexPage({ days: [{ day: "2026-10-14", count: 1 }], total: 1 }, cards)).toContain('href="/ask/2026-10-14/career-choice"');
    expect(renderDaySitemap({ day: "2026-10-14", cards }, true)).toContain("<loc>https://www.lizheng.ai/ask/2026-10-14/career-choice</loc>");
    // The day it was asked, from its address.
    expect(renderQuestionPage({ ...detail(1, "一个合成的问题？"), share_url: share }, { related: [], similar: 1, indexable: true }))
      .toContain("<span>2026年10月14日提问</span>");
    // Without its own page, only the question to ask again.
    expect(renderQuestionPage(detail(1, "一个合成的问题？"), { related: [], similar: 1, indexable: true })).not.toContain("在问问立正里接着问");
  });
});

// 2026-10-15: a question's page is its whole conversation, the follow-ups under its answer.
describe("a conversation on one page", () => {
  it("shows each follow-up after the answer, with its own sources, and asks next from the last", () => {
    const followUp = (question: string, followups: string[]) => ({ question, created_at: "2026-10-15T02:00:00.000Z",
      answer: { ...detail(2, question).answer, followups } });
    const html = renderQuestionPage({ ...detail(1, "一个合成的问题？"), share_url: "https://ask.lizheng.ai/s/2026-10-14/career-choice" },
      { related: [], similar: 0, indexable: true, followUps: [followUp("合成的追问一？", ["不该出现的建议？"]), followUp("合成的追问二？", ["最后的建议？"])] });
    expect(html).toContain("<span>追问2次</span>");
    expect(html).toContain('<section class="turn" id="answer-2" aria-labelledby="question-2">');
    expect(html).toContain('<h2 class="turn-question" id="question-3">');
    expect(html).toContain("合成的追问二？");
    expect(html).toContain('id="t3-source-1"');
    expect(html.indexOf("合成的追问二？")).toBeLessThan(html.indexOf("你也有想问的？"));
    expect(html).toContain("最后的建议？");
    expect(html).not.toContain("不该出现的建议？");
    // The page's question for search engines stays the first one.
    expect(html.match(/"@type":"Question"/g)).toHaveLength(1);
    expect(renderQuestionPage(detail(1, "一个合成的问题？"), { related: [], similar: 0, indexable: true })).not.toContain('class="turn"');
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
// Ops' public reads, each a small piece (2026-10-15): never every question in one.
const SHARE = "https://ask.lizheng.ai/s/2026-10-14/career-choice";
function ops(overrides: Record<string, () => Response> = {}) {
  return vi.fn(async (url: string) => {
    const action = new URL(String(url)).searchParams.get("action") || "";
    if (overrides[action]) return overrides[action]();
    if (action === "detail" || action === "page") return Response.json({ ...detail(1, "一个合成的问题？"), share_url: SHARE });
    if (action === "topic") return Response.json({ v: 1, topic_key: "1".padStart(32, "a"), topic_label: "Topic 1", count: 3,
      cards: [card(1, "一个合成的问题？", { share_url: SHARE }), card(8, "同一个主题的合成问题？")] });
    if (action === "lists") return Response.json({ v: 1, recent: [card(2, "周末带孩子去哪里玩比较好？")], frequent: [] });
    if (action === "days") return Response.json({ v: 1, days: [{ day: "2026-10-15", count: 1 }, { day: "2026-10-14", count: 1 }], total: 2 });
    if (action === "day") return Response.json({ v: 1, day: new URL(String(url)).searchParams.get("day"), cards: [card(7, "第七个合成的问题？")] });
    return Response.json({ code: "public_item_unavailable" }, { status: 404 });
  });
}
const actions = () => vi.mocked(fetch).mock.calls.map(c => new URL(String(c[0])).searchParams.get("action"));

describe("public answer page handler", () => {
  beforeEach(() => { vi.stubEnv("ASK_OPS_BACKEND_ORIGIN", OPS_BACKEND_ORIGIN); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("renders a published question from its own piece, its topic's and the newest, cached at the CDN", async () => {
    vi.stubGlobal("fetch", ops());
    const reply = await call("/api/ask-lizheng-public?__route=page&day=2026-10-14&slug=career-choice");
    expect(reply.status).toBe(200);
    expect(reply.headers["cache-control"]).toContain("s-maxage=600");
    expect(reply.headers["content-security-policy"]).toContain("script-src 'self'");
    expect(reply.headers["x-robots-tag"]).toBeUndefined();
    expect(reply.body).toContain("<h1>");
    expect(reply.body).toContain("<span>3次类似提问</span>");
    // Its topic's first, then the newest; not itself.
    expect(reply.body.indexOf("同一个主题的合成问题？")).toBeLessThan(reply.body.indexOf("周末带孩子去哪里玩比较好？"));
    const related = /<section class="block" aria-labelledby="related">.*?<\/section>/s.exec(reply.body)![0];
    expect(related).toContain(`/ask/${id(8)}`);
    expect(related).not.toContain("/ask/2026-10-14/career-choice");
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toBe(`${OPS_BACKEND_ORIGIN}/api/discovery?action=page&day=2026-10-14&slug=career-choice`);
    expect(actions().sort()).toEqual(["lists", "page", "topic"]);
    // Without its topic or the lists, the page still stands.
    vi.stubGlobal("fetch", ops({ topic: () => new Response("down", { status: 500 }), lists: () => new Response("down", { status: 500 }) }));
    const alone = await call("/api/ask-lizheng-public?__route=page&day=2026-10-14&slug=career-choice");
    expect(alone.status).toBe(200);
    expect(alone.body).not.toContain("别人还问了");
  });

  it("answers 404 for a withdrawn question and 503 when Ops is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ code: "public_item_unavailable" }, { status: 404 })));
    expect((await call(`/api/ask-lizheng-public?__route=page&id=${id(5)}`)).status).toBe(404);
    expect((await call("/api/ask-lizheng-public?__route=page&day=2026-10-14&slug=other-word")).status).toBe(404);
    expect((await call("/api/ask-lizheng-public?__route=page&id=not-a-uuid")).status).toBe(404);
    expect((await call("/api/ask-lizheng-public?__route=page&day=2026-10-14&slug=Bad_Word")).status).toBe(404);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 500 })));
    const down = await call(`/api/ask-lizheng-public?__route=page&id=${id(6)}`);
    expect(down.status).toBe(503);
    expect(down.headers["cache-control"]).toBe("no-store");
  });

  it("moves a question's page by number to its address for good", async () => {
    vi.stubGlobal("fetch", ops());
    const moved = await call(`/api/ask-lizheng-public?__route=page&id=${id(1)}`);
    expect(moved.status).toBe(301);
    expect(moved.headers.location).toBe("/ask/2026-10-14/career-choice");
    expect(actions()).toEqual(["detail"]);
    // One without its own page stays at its number.
    vi.stubGlobal("fetch", ops({ detail: () => Response.json(detail(1, "一个合成的问题？")) }));
    expect((await call(`/api/ask-lizheng-public?__route=page&id=${id(1)}`)).status).toBe(200);
  });

  it("keeps copies on other hosts out of search, and serves the index, a day and the sitemaps from the days", async () => {
    vi.stubGlobal("fetch", ops());
    const index = await call("/api/ask-lizheng-public?__route=index", "lizheng-preview.vercel.app");
    expect(index.status).toBe(200);
    expect(index.headers["x-robots-tag"]).toBe("noindex");
    expect(index.body).toContain("第七个合成的问题？");
    expect(index.body).toContain('href="/ask/2026-10-14"');
    // The list of days, then the newest days' until a hundred questions, at most a week of them.
    expect(actions()).toEqual(["days", "day", "day"]);
    const day = await call("/api/ask-lizheng-public?__route=day&day=2026-10-14");
    expect(day.status).toBe(200);
    expect(day.body).toContain("第七个合成的问题？");
    const sitemap = await call("/api/ask-lizheng-public?__route=sitemap");
    expect(sitemap.headers["content-type"]).toBe("application/xml; charset=utf-8");
    expect(sitemap.body).toContain("<loc>https://www.lizheng.ai/ask/sitemap/2026-10-14.xml</loc>");
    const daySitemap = await call("/api/ask-lizheng-public?__route=daysitemap&day=2026-10-15");
    expect(daySitemap.body).toContain(`/ask/${id(7)}`);
    expect(daySitemap.body).toContain("<loc>https://www.lizheng.ai/ask</loc>");
    expect((await call("/api/ask-lizheng-public?__route=daysitemap&day=2026-10-14")).body).not.toContain("<loc>https://www.lizheng.ai/ask</loc>");
    // A day with nothing public.
    vi.stubGlobal("fetch", ops({ day: () => Response.json({ code: "public_item_unavailable" }, { status: 404 }) }));
    const none = await call("/api/ask-lizheng-public?__route=day&day=2026-01-01");
    expect(none.status).toBe(404);
    expect(none.body).toContain("这一天没有公开的问题");
    expect((await call("/api/ask-lizheng-public?__route=daysitemap&day=2026-01-01")).status).toBe(404);
    expect((await call("/api/ask-lizheng-public?__route=day&day=nope")).status).toBe(404);
    expect((await call("/api/ask-lizheng-public?__route=index", "www.lizheng.ai", "POST")).status).toBe(405);
  });
});
