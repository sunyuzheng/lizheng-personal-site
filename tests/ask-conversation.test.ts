import { describe, expect, it } from "vitest";
import { followUp, followUpsOfPage } from "../shared/ask-conversation";
import type { SharedTurn } from "../shared/ask-share-link";

// Synthetic follow-ups only (2026-10-15: a question in 别人在问什么 is its whole conversation).
const turn: SharedTurn = {
  question: "合成的追问？", intent: "understand", created_at: "2026-10-15T02:00:00.000Z",
  answer: {
    status: "answered", summary: "合成摘要，S2 说得更直接[S1]。", followups: ["再下一个合成追问？"], clarifying_questions: [], limitations: "",
    sections: [{ heading: "合成小标题", body: "合成正文[S2]", source_ids: [], kind: "source" }],
    sources: [
      { id: "S1", title: "合成文章", url: "https://www.lizheng.ai/synthetic" },
      { id: "S2", title: "合成视频", url: "https://www.youtube.com/watch?v=synthetic" },
      { id: "S3", title: "没引用的合成材料", url: "https://www.lizheng.ai/unused" },
    ],
  },
};

describe("a published question's follow-ups", () => {
  it("show the sources their answers cite, with plain source numbers", () => {
    const shown = followUp(turn);
    expect(shown.question).toBe("合成的追问？");
    expect(shown.created_at).toBe("2026-10-15T02:00:00.000Z");
    expect(shown.answer.sources.map(source => source.id)).toEqual(["S1", "S2"]);
    expect(shown.answer.summary).toBe("合成摘要，出处2说得更直接[S1]。");
    expect(shown.answer.followups).toEqual(["再下一个合成追问？"]);
  });
  it("are read only for a conversation's own page", async () => {
    for (const url of [undefined, "", "https://example.test/s/2026-10-15/x", "https://ask.lizheng.ai/q/2e195aff-2690-47b1-aaa6-5d39e6a8d821",
      "https://ask.lizheng.ai/s/2026-10-15/UPPER"]) expect(await followUpsOfPage(url)).toEqual([]);
  });
});
