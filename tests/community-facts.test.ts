import { describe, expect, it } from "vitest";
import { membersFigure, membersWan } from "../shared/community-facts";
import { acceptCount } from "../scripts/sync-community-count";

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
});
