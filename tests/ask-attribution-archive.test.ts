import { readFileSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/components/site/LizhengMark", () => ({ MARK_PATHS: [] }));
import { archivedAnswer } from "../shared/ask-archive-answer";
import { OPS_BODY_LIMIT, opsEvent, storeOpsEvent, verifyOpsProof } from "../shared/ask-ops-storage";
import { parseAskFrame, applyAskEvent } from "../client/src/lib/ask-lizheng";
import { discoveryDetail } from "../client/src/lib/ask-discovery";
const raw = readFileSync(new URL("./fixtures/ask-attribution-finish.json", import.meta.url));
const fixture = () => JSON.parse(raw.toString("utf8"));
const ID = "01234567-89ab-4cde-8f01-23456789abcd";
const SECRET = "a".repeat(64);
const limits: Record<string, number> = { data_layer:32, speaker_id:200, speaker_name:400, speaker_status:100, fragment_id:1000, source_snapshot_sha256:64, participant_names:4096, participant_entity_ids:4096, participant_aliases:4096, participant_metadata_basis:256, speech_act:100, content_origin:200, generation_method:200 };
function proof(body: Buffer) {
  const expiry = Math.floor(Date.now()/1000)+45;
  return `v3.${expiry}.${createHmac("sha256", SECRET).update(`ask-ops-store:v3:${expiry}:${createHash("sha256").update(body).digest("hex")}`).digest("hex")}`;
}
beforeEach(() => {
  for (const k of ["ASK_OPS_ENABLED", "ASK_QUERY_LOG_ENABLED", "ASK_QUOTA_ENABLED"]) vi.stubEnv(k,"true");
  vi.stubEnv("ASK_QUOTA_STORE_SECRET",SECRET);
  vi.stubGlobal("fetch",vi.fn(() => { throw new Error("unexpected network"); }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe("new source attribution archive contract", () => {
  it("accepts actual Python producer shape and preserves compact answer bytes/hash", () => {
    const r=fixture();
    expect(Object.keys(r.answer.sources[0])).toHaveLength(33);
    expect(archivedAnswer(r.answer)).toEqual(r.answer);
    expect(JSON.stringify(opsEvent(raw))).toBe(raw.toString("utf8"));
    expect(createHash("sha256").update(JSON.stringify(opsEvent(raw))).digest("hex")).toBe(createHash("sha256").update(raw).digest("hex"));
    expect(fetch).not.toHaveBeenCalled();
  });
  it("accepts legacy source rows without new optional fields", () => {
    const r=fixture(); for(const k of Object.keys(limits)) delete r.answer.sources[0][k];
    expect(archivedAnswer(r.answer).sources[0]).toEqual(r.answer.sources[0]);
  });
  it.each(Object.keys(limits))("rejects a non-string attribution field: %s", k => {
    const r=fixture(); r.answer.sources[0][k]=["must-not-pass"];
    expect(() => archivedAnswer(r.answer)).toThrow();
  });
  it.each(Object.entries(limits))("keeps bounded field guard: %s", (k,max) => {
    const r=fixture(); r.answer.sources[0][k]="x".repeat(max+1);
    expect(() => archivedAnswer(r.answer)).toThrow();
  });
  it("rejects unknown private fields and lone UTF16 surrogates", () => {
    const a=fixture(); a.answer.sources[0].private_detail="not-public";
    expect(() => archivedAnswer(a.answer)).toThrow();
    const b=fixture(); b.answer.sources[0].participant_aliases="\ud800";
    expect(() => archivedAnswer(b.answer)).toThrow();
  });
  it("retains status, URL, id and body budget guards", async () => {
    const a=fixture(); a.answer.status="clarify"; expect(() => opsEvent(Buffer.from(JSON.stringify(a)))).toThrow();
    const b=fixture(); b.answer.sources[0].url="http://example.test/source"; expect(() => archivedAnswer(b.answer)).toThrow();
    const c=fixture(); c.answer.sources.push(c.answer.sources[0]); expect(() => archivedAnswer(c.answer)).toThrow();
    const sender=vi.fn(); await expect(storeOpsEvent(Buffer.alloc(OPS_BODY_LIMIT+1),proof(raw),sender)).rejects.toMatchObject({code:"input_too_large"});
    expect(sender).not.toHaveBeenCalled();
  });
  it("signed intake writes full unchanged source snapshot only to mocked storage", async () => {
    const sender=vi.fn(async (_command: (string | number)[]) => 1);
    await expect(storeOpsEvent(raw,proof(raw),sender)).resolves.toEqual({ok:true});
    expect(sender).toHaveBeenCalledOnce();
    const args=sender.mock.calls[0][0];
    expect(JSON.parse(String(args[8]))).toEqual(fixture().answer);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("body tampering still fails digest before storage", async () => {
    const sender=vi.fn();
    await expect(storeOpsEvent(Buffer.concat([raw,Buffer.from(" ")]),proof(raw),sender)).rejects.toMatchObject({code:"invalid_admission"});
    expect(sender).not.toHaveBeenCalled();
  });
  it("live event parsing/types do not remove provenance fields", () => {
    const answer=fixture().answer;
    const event=parseAskFrame(`event: result\ndata: ${JSON.stringify(answer)}\n`)!;
    expect(applyAskEvent({sources:[]},event).result?.sources[0]).toEqual(answer.sources[0]);
  });
  it("discovery cache sanitizer retains same approved source fields", async () => {
    const answer=fixture().answer;
    vi.stubGlobal("fetch",vi.fn(async () => Response.json({public_id:ID,revision:1,question:"Synthetic question",answer})));
    const detail=await discoveryDetail(ID);
    expect(detail?.answer.sources[0]).toEqual(answer.sources[0]);
    expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
  });
  it("discovery keeps dropping unknown and non-string metadata", async () => {
    const answer=fixture().answer; answer.sources[0].participant_aliases=42; answer.sources[0].private_detail="not-public";
    vi.stubGlobal("fetch",vi.fn(async () => Response.json({public_id:ID,revision:1,question:"Synthetic question",answer})));
    const detail=await discoveryDetail(ID);
    expect(detail?.answer.sources[0]).not.toHaveProperty("participant_aliases");
    expect(detail?.answer.sources[0]).not.toHaveProperty("private_detail");
  });
});
