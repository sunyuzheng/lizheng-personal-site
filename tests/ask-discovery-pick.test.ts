import { afterEach, describe, expect, it, vi } from "vitest";
import { askedLastDay, discoveryDetail, pickDiscovery, readSeen, rememberSeen, sameQuestion, type DiscoveryCard } from "../client/src/lib/ask-discovery";
import { isMemberVideo, memberJoinUrl } from "../client/src/lib/ask-lizheng";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const card = (n: number, count: number, topic = `t${n}`): DiscoveryCard => ({
  public_id: id(n), revision: 1, topic_key: topic, topic_label: "主题", question: `问题${n}`, summary: "",
  published_at: "2026-10-01T00:00:00Z", topic_question_count: count, likes: 0,
});
// A fixed sequence, so the draws are repeatable.
const seeded = (seed = 7) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
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
  it("shows a first visit the most asked topics, most asked first", () => {
    expect(ids(pickDiscovery(POOL, [], 4, seeded()))).toEqual([id(2), id(5), id(9), id(4)]);
  });

  it("shows something else on each refresh while the pool allows", () => {
    let seen: string[] = [];
    const visits: string[][] = [];
    for (let visit = 0; visit < 6; visit++) {
      const shown = ids(pickDiscovery(POOL, seen, 4, seeded(visit + 3)));
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
    const shown = pickDiscovery(pool, [], 4, seeded());
    expect(shown.filter(item => item.topic_key === "same")).toHaveLength(1);
    expect(shown).toHaveLength(4);
  });

  it("fills from the same topic, then repeats, when the pool is small", () => {
    expect(pickDiscovery([card(1, 3, "a"), card(2, 2, "a")], [], 4, seeded())).toHaveLength(2);
    const small = [card(1, 3), card(2, 2), card(3, 1)];
    expect(ids(pickDiscovery(small, ids(small), 4, seeded())).sort()).toEqual(ids(small).sort());
    expect(pickDiscovery([], [id(1)], 4, seeded())).toEqual([]);
  });

  it("puts the newest question this browser has not seen first, then the usual picks", () => {
    const now = Date.parse("2026-10-03T12:00:00Z");
    const ago = (minutes: number) => new Date(now - minutes * 60000).toISOString();
    const pool = POOL.map((item, i) => ({ ...item, asked_at: ago(600 + i * 60) }));
    pool[6] = { ...pool[6], asked_at: ago(20) };
    expect(ids(pickDiscovery(pool, [], 4, seeded()))).toEqual([id(7), id(2), id(5), id(9)]);
    // Once seen, it no longer jumps the queue; a refresh shows other questions.
    const again = ids(pickDiscovery(pool, [id(7), id(2), id(5), id(9)], 4, seeded()));
    expect(again.filter(item => [id(7), id(2), id(5), id(9)].includes(item))).toEqual([]);
    // A card without a time (a common question written fresh) never takes that place.
    expect(ids(pickDiscovery(POOL, [], 4, seeded()))).toEqual([id(2), id(5), id(9), id(4)]);
  });

  it("never shows one question asked two ways, even under different topics", () => {
    const pool = [
      { ...card(1, 9, "a"), question: "怎么判断自己是真的学会了一个新技能，而不只是看懂了？" },
      { ...card(2, 8, "b"), question: "怎么判断自己真的学会了一个新技能，而不只是看懂？" },
      card(3, 2), card(4, 1), card(5, 1),
    ];
    const shown = ids(pickDiscovery(pool, [], 4, seeded()));
    expect(shown).toContain(id(1));
    expect(shown).not.toContain(id(2));
    expect(shown).toHaveLength(4);
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

  it("treats a browser without storage as a first visit", () => {
    expect(readSeen()).toEqual([]);
    expect(() => rememberSeen([], [id(1)])).not.toThrow();
  });
});
