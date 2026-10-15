import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/components/site/LizhengMark", () => ({ MARK_PATHS: [] }));
import { publicDetail, renderQuestionPage } from "../shared/ask-public-page";
import { renderSharePage } from "../shared/ask-share-page";
import { readShare, type SharedAnswer } from "../shared/ask-share-link";
import { withPlainSourceLabels } from "../shared/ask-source-labels";
import { sourceAttributionLabel } from "../shared/ask-source-attribution.js";

// Synthetic producer fixture only; no real question, answer or source text.
const fixture = () => JSON.parse(readFileSync(new URL("./fixtures/ask-attribution-finish.json", import.meta.url), "utf8")).answer;
const ID = "01234567-89ab-4cde-8f01-23456789abcd";
const rawDetail = (answer = fixture()) => ({ public_id: ID, revision: 1, topic_key: "a".repeat(32), topic_label: "Synthetic topic",
  question: "Synthetic question", published_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z", answer });
const shared = (answer = fixture()): SharedAnswer => ({ day: "2026-10-01", slug: "synthetic-question", question: "Synthetic question",
  intent: "understand", created_at: "2026-10-01T00:00:00Z", answer, turns: [] });
const variants = [
  { name: "unknown", fields: { data_layer: "raw", speaker_id: "unknown", speaker_name: "", speaker_classification: "mixed-or-unresolved" }, label: "说话人待核" },
  { name: "known", fields: { data_layer: "raw", speaker_id: "guest:synthetic", speaker_name: "Synthetic speaker", speaker_classification: "mixed-or-unresolved" }, label: "发言：Synthetic speaker" },
  { name: "derived", fields: { data_layer: "derived", author: "AI", content_origin: "ai-synthesis-of-mixed-sources", speaker_id: "unknown" }, label: "AI整理" },
  { name: "legacy", fields: null, label: "" },
] as const;
function answerVariant(fields: (typeof variants)[number]["fields"]) {
  const answer = fixture();
  answer.sources[0].date = "2026-10-01T00:00:00Z";
  if (fields) Object.assign(answer.sources[0], fields);
  else for (const key of ["data_layer", "speaker_id", "speaker_name", "speaker_status", "speaker_classification", "content_origin", "generation_method"]) delete answer.sources[0][key];
  return answer;
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("attribution metadata on public and shared answers", () => {
  it("preserves all 33 approved string fields including all 13 provenance fields", () => {
    const raw = rawDetail();
    expect(publicDetail(raw)?.answer.sources[0]).toEqual(raw.answer.sources[0]);
    expect(Object.keys(publicDetail(raw)!.answer.sources[0])).toHaveLength(33);
    expect(withPlainSourceLabels(raw.answer).sources[0]).toEqual(raw.answer.sources[0]);
  });
  it("retains exact metadata whitespace and excludes unknown/non-string metadata", () => {
    const raw = rawDetail();
    Object.assign(raw.answer.sources[0], { speaker_name: "  Synthetic speaker  ", participant_aliases: ["not a string"], private_detail: "must not transfer" });
    const source = publicDetail(raw)!.answer.sources[0];
    expect(source.speaker_name).toBe("  Synthetic speaker  ");
    expect(source).not.toHaveProperty("participant_aliases");
    expect(source).not.toHaveProperty("private_detail");
  });
  it.each(variants)("uses the same owned label for $name on both HTML pages", ({ fields, label }) => {
    const answer = answerVariant(fields), before = JSON.stringify(answer);
    const detail = publicDetail(rawDetail(answer))!;
    const pages = [renderQuestionPage(detail, { related: [], similar: 1, indexable: true }), renderSharePage(shared(answer))];
    for (const html of pages) {
      if (label) expect(html).toContain(`<span>${label}</span>`);
      else expect(html).not.toMatch(/<span>(?:发言：|说话人待核|AI整理|多人发言)/);
      expect(html).not.toContain(answer.sources[0].excerpt);
    }
    expect(JSON.stringify(answer)).toBe(before);
    expect(sourceAttributionLabel(answer.sources[0])).toBe(label);
  });
  it("escapes a synthetic speaker name rather than allowing markup on either HTML page", () => {
    const answer = answerVariant({ data_layer: "raw", speaker_id: "guest:synthetic", speaker_name: "Synthetic speaker", speaker_classification: "mixed-or-unresolved" });
    answer.sources[0].speaker_name = '<script data-synthetic="1">';
    const detail = publicDetail(rawDetail(answer))!;
    for (const html of [renderQuestionPage(detail, { related: [], similar: 1, indexable: true }), renderSharePage(shared(answer))]) {
      expect(html).toContain("发言：&lt;script data-synthetic=&quot;1&quot;&gt;");
      expect(html).not.toContain('<script data-synthetic="1">');
    }
  });
  it("retains exact full provenance after a shared answer storage readback", async () => {
    const answer = fixture();
    const share = await readShare("2026-10-01", "synthetic-question", { reader: false,
      send: vi.fn(async () => ["OK", "Synthetic question", JSON.stringify(answer), "understand", "2026-10-01T00:00:00Z"]) });
    expect(share?.answer.sources[0]).toEqual(answer.sources[0]);
  });
  it("keeps existing insecure URL and invalid source ID guards", () => {
    for (const fields of [{ url: "http://example.test" }, { id: "unsafe" }]) {
      const answer = fixture(); Object.assign(answer.sources[0], fields);
      expect(publicDetail(rawDetail(answer))!.answer.sources).toHaveLength(0);
    }
  });
});

