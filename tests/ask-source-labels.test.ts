import { describe, expect, it } from "vitest";
import { detailWithPlainSourceLabels, plainSourceLabels, withPlainSourceLabels } from "../shared/ask-source-labels";

// Synthetic answers only. Before 2026-10-04 some published answers named sources by internal label.
const answer = () => ({
  status: "answered", summary: "S1 说得更直接[S1]。", limitations: "S9 不在出处里。",
  sections: [{ heading: "S2 的例子", body: "做好[S2][S3]，S5 和 S8 把这点讲透；Galaxy S10 不是出处。", source_ids: ["S2"], kind: "source" }],
  sources: [{ id: "S1", title: "合成", reason: "可与S1、S2相互印证", excerpt: "原文里写着 S1" }, { id: "S2", title: "合成" }, { id: "S3", title: "合成" },
    { id: "S5", title: "合成" }, { id: "S8", title: "合成" }],
  followups: [], clarifying_questions: [],
});

describe("internal source labels in published answers", () => {
  it("read as the numbers a reader sees, only for the answer's own sources and outside citation marks", () => {
    const ids = new Set(["S1", "S2", "S5", "S8"]);
    expect(plainSourceLabels("S1 说得更直接[S1]。S5 和 S8，[S2][S5]", ids)).toBe("出处1说得更直接[S1]。出处5和出处8，[S2][S5]");
    expect(plainSourceLabels("Galaxy S10 和 iPhone", ids)).toBe("Galaxy S10 和 iPhone");
    expect(plainSourceLabels("S1S2 和 PS1", ids)).toBe("S1S2 和 PS1");
  });

  it("cover the prose and the notes on sources, never a quoted excerpt", () => {
    const fixed = withPlainSourceLabels(answer());
    expect(fixed.summary).toBe("出处1说得更直接[S1]。");
    expect(fixed.limitations).toBe("S9 不在出处里。");
    expect(fixed.sections[0].heading).toBe("出处2的例子");
    expect(fixed.sections[0].body).toBe("做好[S2][S3]，出处5和出处8把这点讲透；Galaxy S10 不是出处。");
    expect(fixed.sources[0].reason).toBe("可与出处1、出处2相互印证");
    expect(fixed.sources[0].excerpt).toBe("原文里写着 S1");
    expect(answer().summary).toBe("S1 说得更直接[S1]。");
  });

  it("leave a detail alone when it is not an answer they know", () => {
    expect(detailWithPlainSourceLabels({ public_id: "x" })).toEqual({ public_id: "x" });
    expect(detailWithPlainSourceLabels({ answer: { summary: 1 } })).toEqual({ answer: { summary: 1 } });
    expect((detailWithPlainSourceLabels({ answer: answer() }).answer as { summary: string }).summary).toBe("出处1说得更直接[S1]。");
  });
});
