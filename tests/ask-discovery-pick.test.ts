import { afterEach, describe, expect, it, vi } from "vitest";
import { askedLastDay, discoveryDetail, discoveryPool, pickDiscovery, readSeen, rememberSeen, sameQuestion, similarCount, type DiscoveryCard } from "../client/src/lib/ask-discovery";
import { isMemberVideo, memberJoinUrl } from "../client/src/lib/ask-lizheng";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
// Made-up questions, no two alike (sameQuestion would fold 问题1 and 问题10 into one).
const QUESTIONS = ["怎么选第一份工作？", "读研还是直接工作？", "怎么跟老板谈加薪？", "远程工作怎么保持效率？", "怎么开始做副业？",
  "如何建立个人品牌？", "怎样练习公开演讲？", "怎么做年度计划？", "怎么判断一个行业的前景？", "如何培养长期阅读习惯？",
  "怎样做好跨部门沟通？", "怎么面对职业倦怠？"];
const card = (n: number, count: number, topic = `t${n}`): DiscoveryCard => ({
  public_id: id(n), revision: 1, topic_key: topic, topic_label: "主题", question: QUESTIONS[n], summary: "",
  published_at: "2026-10-01T00:00:00Z", topic_question_count: count, likes: 0,
});
const POOL = [card(1, 2), card(2, 9), card(3, 1), card(4, 5), card(5, 7), card(6, 3), card(7, 1), card(8, 4), card(9, 6), card(10, 2)];
const ids = (cards: DiscoveryCard[]) => cards.map(item => item.public_id);
afterEach(() => vi.unstubAllGlobals());

describe("public answer source metadata", () => {
  const join = "https://www.youtube.com/channel/UC_5lJHgnMP_lb_VpIiXV0hQ/join";
  const source = {
    id: "S1", title: "Synthetic member video", url: "https://www.youtube.com/watch?v=synthetic",
    source_type: "video-transcript", source_visibility: "members-only", text_access: "public",
    membership_platform: "youtube", membership_url: join, membership_verified_at: "2026-10-02",
    transcript_source_kind: "previously-included-transcript", transcript_quality: "human-caption",
    speaker_classification: "mixed-or-unresolved",
  };
  function respond(value: unknown) {
    const fetch = vi.fn(async () => Response.json({
      question: "Synthetic published question", revision: 1,
      answer: { summary: "Synthetic public answer", sections: [], sources: [value] },
    }));
    vi.stubGlobal("fetch", fetch);
    return fetch;
  }

  it("preserves the exact optional fields needed by member badges and links", async () => {
    const fetch = respond({ ...source, email: "must-not-pass", reasoning_content: "must-not-pass" });
    const detail = await discoveryDetail(id(1));
    expect(fetch).toHaveBeenCalledWith(`/api/ask-lizheng/discovery/detail?public_id=${id(1)}`,
      expect.objectContaining({ cache: "no-store", credentials: "omit" }));
    expect(detail?.answer.sources).toEqual([source]);
    expect(isMemberVideo(detail!.answer.sources[0])).toBe(true);
    expect(memberJoinUrl(detail!.answer.sources[0])).toBe(join);
  });

  it("continues to omit unknown and non-string fields and supports old sources", async () => {
    const old = { id: "S1", title: "Synthetic old source", url: "https://example.test/source" };
    respond({ ...old, source_type: {}, source_visibility: ["members-only"], text_access: null,
      membership_url: 42, transcript_quality: false, background: "must-not-pass" });
    const detail = await discoveryDetail(id(2));
    expect(detail?.answer.sources).toEqual([old]);
    expect(isMemberVideo(detail!.answer.sources[0])).toBe(false);
    expect(memberJoinUrl(detail!.answer.sources[0])).toBeUndefined();
  });
});

describe("which questions a visit shows", () => {
  it("shows a first visit the most asked topics, most asked first, when none has an ask time", () => {
    const shown = pickDiscovery(POOL, []);
    expect(ids(shown)).toEqual([id(2), id(5), id(9), id(4)]);
    expect(shown.map(card => card.role)).toEqual(["common", "common", "common", "common"]);
  });

  it("shows something else on each refresh while the pool allows", () => {
    let seen: string[] = [];
    const visits: string[][] = [];
    for (let visit = 0; visit < 6; visit++) {
      const shown = ids(pickDiscovery(POOL, seen));
      visits.push(shown);
      seen = [...seen.filter(item => !shown.includes(item)), ...shown];
    }
    for (let visit = 1; visit < visits.length; visit++) {
      expect(visits[visit].filter(item => visits[visit - 1].includes(item))).toEqual([]);
      expect(new Set(visits[visit]).size).toBe(4);
    }
    // Unseen questions come before repeats: the first three visits cover the pool.
    expect(new Set(visits.slice(0, 3).flat()).size).toBe(POOL.length);
  });

  it("keeps one question per topic while other topics remain", () => {
    const pool = [card(1, 9, "same"), card(2, 8, "same"), card(3, 2), card(4, 1), card(5, 1)];
    const shown = pickDiscovery(pool, []);
    expect(shown.filter(item => item.topic_key === "same")).toHaveLength(1);
    expect(shown).toHaveLength(4);
  });

  it("fills from the same topic, then repeats, when the pool is small", () => {
    expect(pickDiscovery([card(1, 3, "a"), card(2, 2, "a")], [])).toHaveLength(2);
    const small = [card(1, 3), card(2, 2), card(3, 1)];
    expect(ids(pickDiscovery(small, ids(small))).sort()).toEqual(ids(small).sort());
    expect(pickDiscovery([], [id(1)])).toEqual([]);
  });

  it("takes turns: the most recently asked, then the most often asked", () => {
    const now = Date.parse("2026-10-03T12:00:00Z");
    const ago = (minutes: number) => new Date(now - minutes * 60000).toISOString();
    // The later in POOL, the more recently asked; the counts stay as they are.
    const pool = POOL.map((item, i) => ({ ...item, asked_at: ago(600 - i * 50) }));
    const first = pickDiscovery(pool, []);
    expect(ids(first)).toEqual([id(10), id(2), id(9), id(5)]);
    expect(first.map(card => card.role)).toEqual(["fresh", "common", "fresh", "common"]);
    // A refresh takes the next of each that this browser has not seen.
    expect(ids(pickDiscovery(pool, ids(first)))).toEqual([id(8), id(4), id(7), id(6)]);
    // A common question written fresh has no ask time, so it only ever takes a common turn.
    const seed = { ...card(11, 8), asked_at: undefined };
    expect(pickDiscovery([...pool, seed], []).find(card => card.public_id === id(11))?.role).toBe("common");
  });

  it("among equally common questions, the most liked first", () => {
    const at = (day: number) => `2026-10-0${day}T00:00:00Z`;
    const shown = pickDiscovery([
      { ...card(1, 2), published_at: at(1) },
      { ...card(2, 2), asked_at: at(2), published_at: at(2) },
      { ...card(3, 2), likes: 1, published_at: at(1) },
      { ...card(4, 3), asked_at: at(1), published_at: at(1) },
    ], []);
    expect(ids(shown)).toEqual([id(2), id(4), id(3), id(1)]);
    expect(shown.map(card => card.role)).toEqual(["fresh", "common", "common", "common"]);
  });

  it("never shows one question asked two ways, even under different topics, and counts both", () => {
    const pool = [
      { ...card(1, 9, "a"), question: "怎么判断自己是真的学会了一个新技能，而不只是看懂了？" },
      { ...card(2, 8, "b"), question: "怎么判断自己真的学会了一个新技能，而不只是看懂？" },
      card(3, 2), card(4, 1), card(5, 1),
    ];
    const shown = pickDiscovery(pool, []);
    expect(ids(shown)).toContain(id(1));
    expect(ids(shown)).not.toContain(id(2));
    expect(shown).toHaveLength(4);
    // Its own topic's nine, and the other wording filed elsewhere.
    expect(shown.find(card => card.public_id === id(1))?.similar_count).toBe(10);
    // The wording asked most recently is the one shown.
    const later = pickDiscovery(pool.map(item => item.public_id === id(2) ? { ...item, asked_at: "2026-10-03T00:00:00Z" } : item), []);
    expect(ids(later)).toContain(id(2));
    expect(ids(later)).not.toContain(id(1));
    expect(later.find(card => card.public_id === id(2))?.similar_count).toBe(9);
    expect(similarCount(pool[0], pool)).toBe(10);
    expect(similarCount(pool[2], pool)).toBe(2);
  });

  it("tells a reworded question from a different one", () => {
    expect(sameQuestion("AI时代，应该先想清楚方向，还是先行动起来？", "应该先想清楚方向还是先行动起来")).toBe(true);
    expect(sameQuestion("Should I learn to code?", "should i learn to code")).toBe(true);
    expect(sameQuestion("怎么选第一份工作？", "怎么写一份好的简历？")).toBe(false);
    expect(sameQuestion("怎样给产品定价？", "怎么找到第一批用户？")).toBe(false);
  });

  it("counts the questions asked in the last day", () => {
    const now = Date.parse("2026-10-03T12:00:00Z");
    const at = (hours: number) => new Date(now - hours * 3600000).toISOString();
    const pool = [card(1, 1), card(2, 1), card(3, 1), card(4, 1)]
      .map((item, i) => ({ ...item, asked_at: [at(0.5), at(23), at(25), undefined][i] }));
    expect(askedLastDay(pool, now)).toBe(2);
    expect(askedLastDay([], now)).toBe(0);
  });

  it("reads every topic, up to three pages, and the 20 newest", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      calls.push(url);
      const page = Number(/cursor=p(\d)/.exec(url)?.[1] || 0);
      if (url.includes("sort=recent")) return Response.json({ items: [card(9, 1), card(1, 1)], next_cursor: "p1" });
      return Response.json({ items: [card(page + 1, 3 - page)], next_cursor: `p${page + 1}` });
    }));
    const pool = await discoveryPool();
    expect(calls.filter(url => url.includes("sort=frequent")).map(url => /cursor=(\w+)/.exec(url)?.[1] ?? "")).toEqual(["", "p1", "p2"]);
    expect(calls.filter(url => url.includes("sort=recent"))).toHaveLength(1);
    expect(ids(pool).sort()).toEqual([id(1), id(2), id(3), id(9)].sort());
  });

  it("treats a browser without storage as a first visit", () => {
    expect(readSeen()).toEqual([]);
    expect(() => rememberSeen([], [id(1)])).not.toThrow();
  });
});
