/** Private, metadata-only retrieval diagnostics. Never part of an archived answer/public projection. */
export const RETRIEVAL_TRACE_BYTES = 16_384;
export const TRACE_ID = /^[A-Za-z0-9][A-Za-z0-9._:#-]{0,239}$/;
const HASH = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const STAGES = ["lexical", "hybrid", "navigation", "supplement", "selected", "cited"] as const;
const REASONS = ["candidate", "selected", "cited", "speaker_unresolved", "not_answer_material", "not_selected"] as const;
const GAPS = ["missing_text", "speaker_unresolved", "not_answer_material", "coverage_gap"] as const;
export type RetrievalTrace = {
  v: 1;
  context_commit: string;
  context_release: string;
  engine_sha256: string;
  steps: { stage: (typeof STAGES)[number]; items: { source_id: string; fragment_id: string; rank: number; reason?: (typeof REASONS)[number] }[]; elapsed_ms: number }[];
  gaps: { source_id: string; reason: (typeof GAPS)[number] }[];
};
function fail(): never { throw new Error("invalid_retrieval_trace"); }
function object(value: unknown, required: string[], optional: string[] = []): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail();
  const r = value as Record<string, unknown>, keys = Object.keys(r);
  if (required.some(k => !Object.hasOwn(r, k)) || keys.some(k => !required.includes(k) && !optional.includes(k))) fail();
  return r;
}
function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) fail();
  return value;
}
function id(value: unknown): string {
  if (typeof value !== "string" || !TRACE_ID.test(value)) fail();
  return value;
}
export function retrievalTrace(value: unknown): RetrievalTrace | null {
  if (value === null || value === undefined) return null;
  let raw: string;
  try { raw = JSON.stringify(value); } catch { fail(); }
  if (new TextEncoder().encode(raw!).byteLength > RETRIEVAL_TRACE_BYTES) fail();
  const r = object(value, ["v", "context_commit", "context_release", "engine_sha256", "steps", "gaps"]);
  if (r.v !== 1 || typeof r.context_commit !== "string" || !COMMIT.test(r.context_commit) ||
      typeof r.context_release !== "string" || !HASH.test(r.context_release) ||
      typeof r.engine_sha256 !== "string" || !HASH.test(r.engine_sha256) ||
      !Array.isArray(r.steps) || r.steps.length > 8 || !Array.isArray(r.gaps) || r.gaps.length > 12) fail();
  const steps = r.steps.map(value => {
    const step = object(value, ["stage", "items", "elapsed_ms"]);
    if (!(STAGES as readonly unknown[]).includes(step.stage) || !Array.isArray(step.items) || step.items.length > 24) fail();
    return {
      stage: step.stage as RetrievalTrace["steps"][number]["stage"],
      items: step.items.map(value => {
        const item = object(value, ["source_id", "fragment_id", "rank"], ["reason"]);
        if ("reason" in item && !(REASONS as readonly unknown[]).includes(item.reason)) fail();
        return { source_id: id(item.source_id), fragment_id: id(item.fragment_id),
          rank: integer(item.rank, 1, 20_000), ...("reason" in item ? { reason: item.reason as (typeof REASONS)[number] } : {}) };
      }),
      elapsed_ms: integer(step.elapsed_ms, 0, 600_000),
    };
  });
  const gaps = r.gaps.map(value => {
    const gap = object(value, ["source_id", "reason"]);
    if (!(GAPS as readonly unknown[]).includes(gap.reason)) fail();
    return { source_id: id(gap.source_id), reason: gap.reason as (typeof GAPS)[number] };
  });
  return { v: 1, context_commit: r.context_commit, context_release: r.context_release, engine_sha256: r.engine_sha256, steps, gaps };
}
/** A corrupt optional diagnostic never makes the complete historical answer unreadable. */
export function storedRetrievalTrace(value: unknown): RetrievalTrace | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || new TextEncoder().encode(value).byteLength > RETRIEVAL_TRACE_BYTES) return null;
  try { return retrievalTrace(JSON.parse(value)); } catch { return null; }
}
