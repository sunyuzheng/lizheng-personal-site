import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_QA, publicQaCopy } from "../shared/ask-public-qa.js";

// The words about public Q&A live in ask-lizheng (src/public-qa.js). The ask page, the homepage
// section and the privacy policy must say the same thing, so this site takes them only by sync.
const read = (file: string) => readFileSync(path.resolve(__dirname, "..", file), "utf8");

describe("public Q&A wording", () => {
  it("is the copy the last ask-app sync brought over, not a local edit", () => {
    const { public_qa_sha256 } = JSON.parse(read("client/public/ask-app/version.json"));
    expect(createHash("sha256").update(read("shared/ask-public-qa.js")).digest("hex")).toBe(public_qa_sha256);
  });

  it("is how the privacy policy opens, in both languages", () => {
    const policy = read("client/public/ask/privacy/index.html");
    expect(policy).toContain(PUBLIC_QA.zh.policy);
    expect(policy).toContain(PUBLIC_QA.en.policy);
  });

  it("reads in the homepage's own voice, with nothing left to fill", () => {
    for (const contextKept of [false, true]) {
      const zh = publicQaCopy("zh", { owner: "我", self: "我", answerer: "DeepSeek", contextKept });
      const en = publicQaCopy("en", { owner: "我", self: "我", answerer: "DeepSeek", contextKept });
      for (const text of [...zh.about, zh.situation, ...en.about, en.situation]) expect(text).not.toMatch(/[{}]/);
      expect(zh.about.at(-1)).toContain("不是我本人回复");
      expect(zh.about.at(-1)).toContain("DeepSeek写回答");
    }
    expect(publicQaCopy("zh", { owner: "我", self: "我", answerer: null, contextKept: false }).about.at(-1)).toContain("AI模型写回答");
    expect(publicQaCopy("zh", { owner: "我", self: "我", answerer: null, contextKept: false }).situation).toContain("我们不保存");
  });
});
