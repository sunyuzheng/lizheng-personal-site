import { afterEach, describe, expect, it, vi } from "vitest";
import { askedLastDay, discoveryDetail, discoveryLists, discoveryPage, discoveryView, likeState, readLikes, rememberLike, sameQuestion, similarCount, type DiscoveryCard } from "../client/src/lib/ask-discovery";
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

describe("what 最近问 and 最常问 show, the same for everyone", () => {
  const now = Date.parse("2026-10-03T12:00:00Z");
  const ago = (minutes: number) => new Date(now - minutes * 60000).toISOString();
  const frequent = (cards: DiscoveryCard[]) => discoveryView({ recent: [], frequent: cards }, "frequent");

  it("lists each topic once in 最常问, the most asked first", () => {
    const shown = frequent(POOL);
    expect(ids(shown)).toEqual([id(2), id(5), id(9), id(4), id(8), id(6), id(1), id(10), id(3), id(7)]);
    expect(shown.every(card => card.role === "common")).toBe(true);
    const pool = [card(1, 9, "same"), card(2, 9, "same"), card(3, 2)];
    expect(frequent(pool).filter(item => item.topic_key === "same")).toHaveLength(1);
  });

  it("shows a topic through the question in it asked most recently", () => {
    const pool = [{ ...card(1, 3, "a"), asked_at: ago(90) }, { ...card(2, 3, "a"), asked_at: ago(10) }, card(3, 1)];
    expect(ids(frequent(pool))).toEqual([id(2), id(3)]);
  });

  it("shows a topic through its most liked question, the most recently asked among equals", () => {
    const pool = [{ ...card(1, 3, "a"), asked_at: ago(90), likes: 2 }, { ...card(2, 3, "a"), asked_at: ago(10), likes: 1 },
      { ...card(3, 3, "a"), asked_at: ago(200), likes: 2 }, card(4, 1)];
    const shown = frequent(pool);
    expect(ids(shown)).toEqual([id(1), id(4)]);
    // Under it, the topic's other questions, most liked first, then most recently asked.
    expect(shown[0].similar?.map(item => item.public_id)).toEqual([id(3), id(2)]);
    expect(shown[0].similar?.[0]).toEqual({ public_id: id(3), revision: 1, question: QUESTIONS[3], published_at: "2026-10-01T00:00:00Z", asked_at: ago(200), likes: 2 });
    expect(shown[1].similar).toEqual([]);
    // 最近问 is about when: it never trades the newest asking for a more liked one.
    const reworded = [{ ...card(5, 1, "b"), question: "怎么开始做副业？", asked_at: ago(5) }, { ...card(6, 1, "c"), question: "怎么开始做副业", asked_at: ago(50), likes: 9 }];
    expect(ids(discoveryView({ recent: reworded, frequent: [] }, "recent"))).toEqual([id(5)]);
    expect(ids(frequent(reworded))).toEqual([id(6)]);
  });

  it("opens under a card of 最常问 what Ops gives of its topic, its other wordings, and the newest of its topic", () => {
    const row = (n: number, likes: number, minutes?: number) => ({ public_id: id(n), revision: 2, question: QUESTIONS[n], published_at: "2026-10-01T00:00:00Z",
      likes, ...(minutes === undefined ? {} : { asked_at: ago(minutes) }) });
    const top = { ...card(1, 9, "a"), likes: 4, asked_at: ago(300), similar: [row(2, 3, 400), row(3, 0)] };
    const newest = { ...card(4, 9, "a"), asked_at: ago(2) };
    const elsewhere = { ...card(5, 1, "b"), asked_at: ago(7) };
    const shown = discoveryView({ frequent: [top], recent: [newest, elsewhere] }, "frequent");
    expect(ids(shown)).toEqual([id(1), id(5)]);
    expect(shown[0].similar?.map(item => item.public_id)).toEqual([id(2), id(4), id(3)]);
    // A wording filed under another topic opens under the card it was folded into, and counts there.
    const folded = discoveryView({ frequent: [top], recent: [{ ...elsewhere, question: QUESTIONS[1].replace("？", "") }] }, "frequent");
    expect(ids(folded)).toEqual([id(1)]);
    expect(folded[0].similar?.map(item => item.public_id)).toEqual([id(2), id(5), id(3)]);
    expect(folded[0].similar_count).toBe(10);
    // At most eight.
    const many = { ...top, similar: Array.from({ length: 12 }, (_, i) => ({ ...row(2, 0), public_id: id(100 + i) })) };
    expect(frequent([many])[0].similar).toHaveLength(8);
  });

  it("lists the questions people asked in 最近问, most recently asked first, without the ones written fresh", () => {
    const recent = POOL.slice(0, 4).map((item, i) => ({ ...item, asked_at: ago(400 - i * 100) }));
    const seed = { ...card(11, 8), asked_at: undefined };
    const shown = discoveryView({ recent: [...recent, seed], frequent: [] }, "recent");
    expect(ids(shown)).toEqual([id(4), id(3), id(2), id(1)]);
    expect(shown.every(card => card.role === "fresh")).toBe(true);
  });

  it("among equally common questions, the most liked first, and one written fresh before a single asking", () => {
    const at = (day: number) => `2026-10-0${day}T00:00:00Z`;
    const shown = frequent([
      { ...card(1, 2), published_at: at(1) },
      { ...card(2, 2), asked_at: at(2), published_at: at(2) },
      { ...card(3, 2), likes: 1, published_at: at(1) },
      { ...card(4, 3), asked_at: at(1), published_at: at(1) },
    ]);
    expect(ids(shown)).toEqual([id(4), id(3), id(1), id(2)]);
  });

  it("never lists one question asked two ways, even under different topics, and counts both", () => {
    const pool = [
      { ...card(1, 9, "a"), question: "怎么判断自己是真的学会了一个新技能，而不只是看懂了？" },
      { ...card(2, 8, "b"), question: "怎么判断自己真的学会了一个新技能，而不只是看懂？" },
      card(3, 2), card(4, 1), card(5, 1),
    ];
    const shown = frequent(pool);
    expect(ids(shown)).toContain(id(1));
    expect(ids(shown)).not.toContain(id(2));
    expect(shown.find(card => card.public_id === id(1))?.similar_count).toBe(10);
    // The wording asked most recently is the one listed, in either list.
    const asked = pool.map(item => item.public_id === id(2) ? { ...item, asked_at: ago(5) } : item);
    expect(ids(frequent(asked))).toContain(id(2));
    expect(ids(frequent(asked))).not.toContain(id(1));
    expect(ids(discoveryView({ recent: asked, frequent: [] }, "recent"))).toEqual([id(2)]);
    expect(similarCount(pool[0], pool)).toBe(10);
    expect(similarCount(pool[2], pool)).toBe(2);
  });

  it("folds a rewording across the two lists, counting it as one more asking", () => {
    const common = { ...card(1, 4, "a"), question: "AI时代，应该先想清楚方向，还是先行动起来？" };
    const reworded = { ...card(2, 1, "b"), question: "应该先想清楚方向还是先行动起来", asked_at: ago(3) };
    const shown = discoveryView({ recent: [reworded], frequent: [common] }, "frequent");
    // Listed once, as the wording asked most recently: its topic's one asking, and the other wording.
    expect(ids(shown)).toEqual([id(2)]);
    expect(shown[0].similar_count).toBe(2);
  });

  it("is the same on every visit: nothing is kept in the browser", () => {
    const lists = { recent: POOL.slice(0, 3).map((item, i) => ({ ...item, asked_at: ago(i) })), frequent: POOL };
    const storage = vi.fn();
    vi.stubGlobal("localStorage", { getItem: storage, setItem: storage });
    expect(discoveryView(lists, "frequent")).toEqual(discoveryView(lists, "frequent"));
    expect(discoveryView(lists, "recent")).toEqual(discoveryView(lists, "recent"));
    expect(storage).not.toHaveBeenCalled();
  });

  it("tells a reworded question from a different one", () => {
    expect(sameQuestion("AI时代，应该先想清楚方向，还是先行动起来？", "应该先想清楚方向还是先行动起来")).toBe(true);
    expect(sameQuestion("Should I learn to code?", "should i learn to code")).toBe(true);
    expect(sameQuestion("怎么选第一份工作？", "怎么写一份好的简历？")).toBe(false);
    expect(sameQuestion("怎样给产品定价？", "怎么找到第一批用户？")).toBe(false);
  });

  it("counts the questions asked in the last day", () => {
    const at = (hours: number) => new Date(now - hours * 3600000).toISOString();
    const pool = [card(1, 1), card(2, 1), card(3, 1), card(4, 1)]
      .map((item, i) => ({ ...item, asked_at: [at(0.5), at(23), at(25), undefined][i] }));
    expect(askedLastDay(pool, now)).toBe(2);
    expect(askedLastDay([], now)).toBe(0);
  });

  it("reads both lists in one request, without cookies, and keeps only well-formed cards", async () => {
    const similar = { public_id: id(3), revision: 1, question: "合成问题", published_at: "2026-10-01T00:00:00Z", likes: 2, summary: "not shown" };
    const fetch = vi.fn(async () => Response.json({ recent: [card(1, 1), { public_id: "x" }],
      frequent: [{ ...card(2, 3), similar: [similar, { ...similar, likes: -1 }] }, { ...card(4, 1), similar: "x" }] }));
    vi.stubGlobal("fetch", fetch);
    const lists = await discoveryLists();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/ask-lizheng/discovery/lists", expect.objectContaining({ credentials: "omit" }));
    expect(ids(lists!.recent)).toEqual([id(1)]);
    expect(ids(lists!.frequent)).toEqual([id(2), id(4)]);
    expect(lists!.frequent.map(item => item.similar)).toEqual([[{ public_id: id(3), revision: 1, question: "合成问题", published_at: "2026-10-01T00:00:00Z", likes: 2 }], []]);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 503 })));
    expect(await discoveryLists()).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ items: [] })));
    expect(await discoveryLists()).toBeNull();
  });

  it("shares a question as its public page", () => {
    expect(discoveryPage(id(7))).toBe(`https://www.lizheng.ai/ask/${id(7)}`);
  });
});

describe("what this browser liked", () => {
  const now = Date.parse("2026-10-05T12:00:00Z");
  afterEach(() => vi.unstubAllGlobals());
  const storage = () => {
    const kept = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (key: string) => kept.get(key) ?? null, setItem: (key: string, value: string) => { kept.set(key, value); } });
    return kept;
  };
  it("keeps each vote's result on this device only, the 300 most recent", () => {
    const kept = storage();
    let memory = rememberLike(readLikes(), id(1), { voted: true, likes: 3 }, now);
    expect(readLikes()).toEqual({ [id(1)]: { voted: true, likes: 3, at: now } });
    for (let i = 0; i < 305; i++) memory = rememberLike(memory, id(1000 + i), { voted: true, likes: 1 }, now + 1 + i);
    expect(Object.keys(readLikes())).toHaveLength(300);
    expect(readLikes()[id(1)]).toBeUndefined();
    kept.set("ask-discovery-likes", JSON.stringify({ [id(2)]: { voted: "yes", likes: 1, at: now }, bad: { voted: true, likes: 1, at: now } }));
    expect(readLikes()).toEqual({});
    kept.set("ask-discovery-likes", "not json");
    expect(readLikes()).toEqual({});
  });
  it("shows a vote at once, and the lists' count once they have caught up", () => {
    const memory = { [id(1)]: { voted: true, likes: 3, at: now }, [id(2)]: { voted: false, likes: 0, at: now } };
    expect(likeState(memory, id(1), 2, now + 60_000)).toEqual({ voted: true, likes: 3 });
    expect(likeState(memory, id(1), 5, now + 60_000)).toEqual({ voted: true, likes: 5 });
    expect(likeState(memory, id(2), 1, now + 60_000)).toEqual({ voted: false, likes: 0 });
    expect(likeState(memory, id(1), 4, now + 3_600_000)).toEqual({ voted: true, likes: 4 });
    // An edit clears a question's likes: long after the vote, no count means no like.
    expect(likeState(memory, id(1), 0, now + 3_600_000)).toEqual({ voted: false, likes: 0 });
    expect(likeState(memory, id(3), 7, now)).toEqual({ voted: false, likes: 7 });
  });
  it("works without storage", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
    expect(readLikes()).toEqual({});
    expect(rememberLike({}, id(1), { voted: true, likes: 1 }, now)).toEqual({ [id(1)]: { voted: true, likes: 1, at: now } });
  });
});
