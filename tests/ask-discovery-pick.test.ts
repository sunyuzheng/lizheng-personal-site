import { describe, expect, it } from "vitest";
import { pickDiscovery, readSeen, rememberSeen, type DiscoveryCard } from "../client/src/lib/ask-discovery";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const card = (n: number, count: number, topic = `t${n}`): DiscoveryCard => ({
  public_id: id(n), revision: 1, topic_key: topic, topic_label: "主题", question: `问题${n}`, summary: "",
  published_at: "2026-10-01T00:00:00Z", topic_question_count: count, likes: 0,
});
// A fixed sequence, so the draws are repeatable.
const seeded = (seed = 7) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const POOL = [card(1, 2), card(2, 9), card(3, 1), card(4, 5), card(5, 7), card(6, 3), card(7, 1), card(8, 4), card(9, 6), card(10, 2)];
const ids = (cards: DiscoveryCard[]) => cards.map(item => item.public_id);

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

  it("treats a browser without storage as a first visit", () => {
    expect(readSeen()).toEqual([]);
    expect(() => rememberSeen([], [id(1)])).not.toThrow();
  });
});
