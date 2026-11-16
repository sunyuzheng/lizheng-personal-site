import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { retrievalTrace, storedRetrievalTrace } from "../shared/ask-retrieval-trace";
import { opsEvent, storeOpsEvent } from "../shared/ask-ops-storage";

const SECRET = "a".repeat(64);
const fixture = () => JSON.parse(readFileSync(new URL("./fixtures/ask-attribution-finish.json", import.meta.url), "utf8"));
const trace = () => ({ v: 1, context_commit: "1".repeat(40), context_release: "2".repeat(64), engine_sha256: "3".repeat(64),
  steps: [{ stage: "lexical", items: [{ source_id: "dialogue-synthetic-01", fragment_id: "dialogue-synthetic-01:unit-0001#t42", rank: 1, reason: "candidate" }], elapsed_ms: 12 },
    { stage: "cited", items: [{ source_id: "dialogue-synthetic-01", fragment_id: "dialogue-synthetic-01:unit-0001#t42", rank: 1, reason: "cited" }], elapsed_ms: 15 }],
  gaps: [{ source_id: "video-synthetic", reason: "missing_text" }] });
function proof(body: Buffer) {
  const expiry = Math.floor(Date.now() / 1000) + 45;
  return `v3.${expiry}.${createHmac("sha256", SECRET).update(`ask-ops-store:v3:${expiry}:${createHash("sha256").update(body).digest("hex")}`).digest("hex")}`;
}
beforeEach(() => {
  for (const key of ["ASK_OPS_ENABLED", "ASK_QUERY_LOG_ENABLED", "ASK_QUOTA_ENABLED"]) vi.stubEnv(key, "true");
  vi.stubEnv("ASK_QUOTA_STORE_SECRET", SECRET);
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("unexpected network"); }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("bounded metadata-only retrieval trace", () => {
  it("accepts public IDs, all stages/reasons and optional absence without changing data", () => {
    expect(retrievalTrace(trace())).toEqual(trace());
    expect(retrievalTrace(null)).toBeNull();
    expect(retrievalTrace(undefined)).toBeNull();
    const t = trace();
    t.steps = ["lexical", "hybrid", "navigation", "supplement", "selected", "cited"].map((stage, i) => ({ stage,
      elapsed_ms: 0, items: [{ source_id: "a".repeat(240), fragment_id: "fragment:42#t15", rank: 20000,
        reason: ["candidate", "selected", "cited", "speaker_unresolved", "not_answer_material", "not_selected"][i] }] }));
    expect(retrievalTrace(t)).toEqual(t);
    expect(storedRetrievalTrace(JSON.stringify(trace()))).toEqual(trace());
    expect(storedRetrievalTrace("malformed historical optional diagnostic")).toBeNull();
  });
  it.each(["https://example.test/source", "/Users/private", "person@example.test", "空白", "has space", "a".repeat(241)])("rejects non-public ID %s", id => {
    const t = trace(); t.steps[0].items[0].source_id = id;
    expect(() => retrievalTrace(t)).toThrow("invalid_retrieval_trace");
  });
  it.each([
    (t: any) => { t.question = "not permitted"; },
    (t: any) => { t.steps[0].context = "not permitted"; },
    (t: any) => { t.steps[0].items[0].reasoning = "not permitted"; },
    (t: any) => { t.gaps[0].email = "not permitted"; },
    (t: any) => { t.v = 2; },
    (t: any) => { t.context_commit = "a".repeat(39); },
    (t: any) => { t.engine_sha256 = "A".repeat(64); },
    (t: any) => { t.steps[0].stage = "reasoning"; },
    (t: any) => { t.steps[0].items[0].reason = "free text"; },
    (t: any) => { t.steps[0].items[0].rank = 0; },
    (t: any) => { t.steps[0].items[0].rank = 20001; },
    (t: any) => { t.steps[0].items[0].rank = 1.5; },
    (t: any) => { t.steps[0].elapsed_ms = 600001; },
    (t: any) => { t.gaps[0].reason = "free text"; },
    (t: any) => { t.steps = Array(9).fill(t.steps[0]); },
    (t: any) => { t.steps[0].items = Array(25).fill(t.steps[0].items[0]); },
    (t: any) => { t.gaps = Array(13).fill(t.gaps[0]); },
    (t: any) => { t.steps = Array.from({ length: 8 }, () => ({ ...t.steps[0], items: Array(24).fill({ source_id: "a".repeat(240), fragment_id: "b".repeat(240), rank: 1 }) })); },
  ])("rejects extra fields and structural/numeric/byte-limit violations", mutate => {
    const t = trace(); mutate(t); expect(() => retrievalTrace(t)).toThrow("invalid_retrieval_trace");
  });
});

describe("signed finish writes a private sibling, not answer metadata", () => {
  it("binds the exact trace body and sends one atomic finish with untouched answer", async () => {
    const value = { ...fixture(), retrieval_trace: trace() }, body = Buffer.from(JSON.stringify(value));
    const send = vi.fn(async (_command: (string | number)[]) => [1, "", "2026-10-14"]);
    await expect(storeOpsEvent(body, proof(body), send)).resolves.toEqual({ ok: true });
    const command = send.mock.calls[0][0];
    expect(command).toHaveLength(15);
    expect(JSON.parse(String(command[8]))).toEqual(value.answer);
    expect(String(command[8])).not.toContain("retrieval_trace");
    expect(JSON.parse(String(command[14]))).toEqual(trace());
    const changed = Buffer.from(JSON.stringify({ ...value, retrieval_trace: { ...trace(), engine_sha256: "4".repeat(64) } }));
    await expect(storeOpsEvent(changed, proof(body), send)).rejects.toMatchObject({ code: "invalid_admission" });
    expect(send).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([undefined, null])("keeps old or explicit-null finishes valid: %s", async value => {
    const body = Buffer.from(JSON.stringify({ ...fixture(), retrieval_trace: value }));
    const send = vi.fn(async (_command: (string | number)[]) => [1, "", "2026-10-14"]);
    await storeOpsEvent(body, proof(body), send);
    expect(send.mock.calls[0][0][14]).toBe("");
  });
  it("rejects a signed invalid trace before Redis and never accepts it on start", async () => {
    const value = { ...fixture(), retrieval_trace: { ...trace(), context: "not permitted" } };
    const body = Buffer.from(JSON.stringify(value)), send = vi.fn();
    await expect(storeOpsEvent(body, proof(body), send)).rejects.toMatchObject({ status: 400, code: "invalid_request" });
    expect(send).not.toHaveBeenCalled();
    expect(() => opsEvent(Buffer.from(JSON.stringify({ ...value, event: "start" })))).toThrow("invalid_request");
  });
});
