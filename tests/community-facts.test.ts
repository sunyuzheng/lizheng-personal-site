import { describe, expect, it } from "vitest";
import {
  COMMUNITY_MEMBERS,
  MAP_MEMBERS,
  PUBLIC_MEMBERS_FLOOR,
  membersFigure,
  membersWan,
} from "../shared/community-facts";
import { acceptCount, mayRewriteCount } from "../scripts/sync-community-count";

describe("how the pages say the member count", () => {
  it("rounds down to a thousand for figures", () => {
    expect(membersFigure(28377)).toBe("28,000+");
    expect(membersFigure(29999)).toBe("29,000+");
    expect(membersFigure(30000)).toBe("30,000+");
    expect(membersFigure(101234)).toBe("101,000+");
  });

  it("writes Chinese prose in 万, without a trailing .0", () => {
    expect(membersWan(28377)).toBe("2.8万");
    expect(membersWan(29999)).toBe("2.9万");
    expect(membersWan(30412)).toBe("3万");
    expect(membersWan(31900)).toBe("3.1万");
    expect(membersWan(100500)).toBe("10万");
  });
});

describe("the public floor (立正, 2026-11-10)", () => {
  it("never states fewer than 3万 / 30,000+ members", () => {
    expect(PUBLIC_MEMBERS_FLOOR).toBe(30000);
    expect(COMMUNITY_MEMBERS).toBe(Math.max(MAP_MEMBERS, 30000));
    expect(COMMUNITY_MEMBERS).toBeGreaterThanOrEqual(30000);
    expect(Number(membersFigure().replace(/[^0-9]/g, ""))).toBeGreaterThanOrEqual(30000);
    expect(membersWan(30000)).toBe("3万");
  });

  it("lets the map keep its own count", () => {
    expect(MAP_MEMBERS).toBeLessThanOrEqual(COMMUNITY_MEMBERS);
  });
});

describe("taking the count from the community map's data", () => {
  const today = { count: 28500, generatedAt: "2026-11-11" };

  it("takes a count that grew", () => {
    expect(acceptCount(28377, today)).toEqual({ count: 28500, asOf: "2026-11-11" });
  });

  it("keeps the committed count when the data is missing, lower, or implausible", () => {
    expect(acceptCount(28377, null)).toHaveProperty("reason");
    expect(acceptCount(28377, { generatedAt: "2026-11-11" })).toHaveProperty("reason");
    expect(acceptCount(28377, { count: 28500 })).toHaveProperty("reason");
    expect(acceptCount(28377, { ...today, count: 0 })).toHaveProperty("reason");
    expect(acceptCount(28377, { ...today, count: 28376 })).toHaveProperty("reason");
    expect(acceptCount(28377, { ...today, count: 90000 })).toHaveProperty("reason");
    expect(acceptCount(28377, { ...today, count: 28500.5 })).toHaveProperty("reason");
  });

  it("rewrites the committed count on a deploy, never in other CI runs, locally only at a new thousand", () => {
    // Vercel builds the pages that are served: always today's count.
    expect(mayRewriteCount({ VERCEL: "1", CI: "1" }, 28377, 28378)).toBe(true);
    // The guest sync on GitHub Actions needs a clean working tree to commit.
    expect(mayRewriteCount({ CI: "true" }, 28377, 28500)).toBe(false);
    expect(mayRewriteCount({ CI: "true" }, 28377, 29100)).toBe(false);
    // A developer's build stays clean until the figure on the pages changes.
    expect(mayRewriteCount({}, 28377, 28999)).toBe(false);
    expect(mayRewriteCount({}, 28377, 29000)).toBe(true);
  });
});
