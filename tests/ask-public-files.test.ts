import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccessError } from "../shared/ask-access";
import {
  forgetHeartbeat, PUBLIC_FILES, publicFileFor, publicJson, readShareCopy, saveShareCopy, shareFile, type FileReader,
} from "../shared/ask-public-files";
import type { SharedAnswer } from "../shared/ask-share-link";

// The files Ops writes for readers (and the copies of shared answers), read through stand-ins for
// the store and for Ops. Synthetic questions only.
const NOW = Date.parse("2026-10-04T20:00:00.000Z");
const ID = "00000000-0000-4000-8000-000000000001";
const LISTS = "/api/discovery?action=lists", INDEX = "/api/discovery?action=index";
const DETAIL = `/api/discovery?action=detail&public_id=${ID}`;
const beat = (ago: number) => JSON.stringify({ v: 1, epoch: 7, checked_at: new Date(NOW - ago).toISOString() });
function store(files: Record<string, string | Error>) {
  const reads: string[] = [];
  const read: FileReader = async path => {
    reads.push(path);
    const value = files[path];
    if (value instanceof Error) throw value;
    return value ?? null;
  };
  return { read, reads };
}
const fromOps = (value: Record<string, unknown> | AccessError) => vi.fn(async () => {
  if (value instanceof AccessError) throw value;
  return value;
});
beforeEach(() => forgetHeartbeat());

describe("what readers see, from files", () => {
  it("knows which file holds each public read, and that the paged list has none", () => {
    expect(publicFileFor(LISTS)).toBe(PUBLIC_FILES.lists);
    expect(publicFileFor(INDEX)).toBe(PUBLIC_FILES.index);
    expect(publicFileFor(DETAIL)).toBe(`public/detail/${ID}.json`);
    expect(publicFileFor("/api/discovery?action=list&window=all&sort=recent&limit=10")).toBeNull();
    expect(publicFileFor("/api/discovery?action=detail&public_id=../state")).toBeNull();
    expect(publicFileFor("/api/discovery?action=lists&extra=1")).toBeNull();
    expect(publicFileFor("/api/ops")).toBeNull();
  });

  it("asks Ops when there is no store", async () => {
    const ops = fromOps({ from: "ops" });
    expect(await publicJson(LISTS, { read: null, ops, now: NOW })).toEqual({ from: "ops" });
    expect(ops).toHaveBeenCalledWith(LISTS, { method: "GET" });
  });

  it("serves the files while the heartbeat is fresh, without asking Ops", async () => {
    const { read } = store({ [PUBLIC_FILES.state]: beat(60_000), [PUBLIC_FILES.lists]: '{"from":"file"}' });
    const ops = fromOps({ from: "ops" });
    expect(await publicJson(LISTS, { read, ops, now: NOW })).toEqual({ from: "file" });
    expect(ops).not.toHaveBeenCalled();
  });

  it("treats a question the fresh files do not have as gone", async () => {
    const { read } = store({ [PUBLIC_FILES.state]: beat(0) });
    const ops = fromOps({ from: "ops" });
    await expect(publicJson(DETAIL, { read, ops, now: NOW })).rejects.toMatchObject({ code: "public_item_unavailable", status: 404 });
    expect(ops).not.toHaveBeenCalled();
    // A missing list is not "gone": Ops answers.
    expect(await publicJson(LISTS, { read, ops, now: NOW })).toEqual({ from: "ops" });
  });

  it("asks Ops once the heartbeat is stale, so a broken export cannot keep anything up", async () => {
    const { read } = store({ [PUBLIC_FILES.state]: beat(181_000), [PUBLIC_FILES.lists]: '{"from":"file"}', [PUBLIC_FILES.detail(ID)]: '{"from":"file"}' });
    expect(await publicJson(LISTS, { read, ops: fromOps({ from: "ops" }), now: NOW })).toEqual({ from: "ops" });
    // Ops says it is withdrawn: that stands, whatever the old file says.
    await expect(publicJson(DETAIL, { read, ops: fromOps(new AccessError("public_item_unavailable", 404)), now: NOW }))
      .rejects.toMatchObject({ status: 404 });
  });

  it("falls back to the last files only when Ops cannot answer either", async () => {
    const { read } = store({ [PUBLIC_FILES.state]: beat(3_600_000), [PUBLIC_FILES.index]: '{"from":"file"}' });
    const down = new AccessError("ops_gateway_unavailable");
    expect(await publicJson(INDEX, { read, ops: fromOps(down), now: NOW })).toEqual({ from: "file" });
    await expect(publicJson(LISTS, { read, ops: fromOps(down), now: NOW })).rejects.toBe(down);
  });

  it("asks Ops when a file cannot be read or parsed", async () => {
    const { read } = store({ [PUBLIC_FILES.state]: beat(0), [PUBLIC_FILES.lists]: new Error("store down"), [PUBLIC_FILES.index]: "[1,2]" });
    expect(await publicJson(LISTS, { read, ops: fromOps({ from: "ops" }), now: NOW })).toEqual({ from: "ops" });
    expect(await publicJson(INDEX, { read, ops: fromOps({ from: "ops" }), now: NOW })).toEqual({ from: "ops" });
  });

  it("does not trust a heartbeat it cannot read, or one from the future", async () => {
    for (const state of [new Error("store down"), "not json", JSON.stringify({ v: 1, epoch: 7, checked_at: new Date(NOW + 120_000).toISOString() })]) {
      forgetHeartbeat();
      const { read } = store({ [PUBLIC_FILES.state]: state, [PUBLIC_FILES.lists]: '{"from":"file"}' });
      expect(await publicJson(LISTS, { read, ops: fromOps({ from: "ops" }), now: NOW })).toEqual({ from: "ops" });
    }
  });

  it("reads the heartbeat at most every 15 seconds in a warm function", async () => {
    const { read, reads } = store({ [PUBLIC_FILES.state]: beat(0), [PUBLIC_FILES.lists]: "{}" });
    await publicJson(LISTS, { read, now: NOW });
    await publicJson(LISTS, { read, now: NOW + 10_000 });
    await publicJson(LISTS, { read, now: NOW + 20_000 });
    expect(reads.filter(path => path === PUBLIC_FILES.state)).toHaveLength(2);
  });
});

describe("a shared answer's copy", () => {
  const share: SharedAnswer = {
    day: "2026-10-04", slug: "career-choice", question: "合成的问题：怎么选方向？", intent: "understand", created_at: "2026-10-04T02:00:00.000Z",
    answer: { status: "answered", summary: "合成的摘要。", followups: [], clarifying_questions: [], limitations: "",
      sections: [{ heading: "合成的小标题", body: "合成的回答段落。", kind: "synthesis", source_ids: [] }], sources: [] } as unknown as SharedAnswer["answer"],
  };

  it("is written where the share page looks for it, and never fails the share", async () => {
    const written: Record<string, string> = {};
    expect(await saveShareCopy(share, async (path, body) => { written[path] = body; })).toBe(true);
    expect(Object.keys(written)).toEqual([shareFile("2026-10-04", "career-choice")]);
    expect(await saveShareCopy(share, async () => { throw new Error("store down"); })).toBe(false);
    expect(await saveShareCopy(share, null)).toBe(false);
    const { read } = store(written);
    expect(await readShareCopy("2026-10-04", "career-choice", read)).toEqual(share);
  });

  it("is used only when it is the same share and a whole answer", async () => {
    const copy = (extra: Record<string, unknown>) => store({ [shareFile("2026-10-04", "career-choice")]: JSON.stringify({ v: 1, ...share, ...extra }) }).read;
    expect(await readShareCopy("2026-10-04", "career-choice", copy({ slug: "another" }))).toBeNull();
    expect(await readShareCopy("2026-10-04", "career-choice", copy({ question: " " }))).toBeNull();
    expect(await readShareCopy("2026-10-04", "career-choice", copy({ answer: { status: "answered" } }))).toBeNull();
    expect(await readShareCopy("2026-10-04", "../career-choice", copy({}))).toBeNull();
    expect(await readShareCopy("2026-10-04", "career-choice", store({}).read)).toBeNull();
    expect(await readShareCopy("2026-10-04", "career-choice", null)).toBeNull();
  });
});
