/** Only the validated, public-facing answer belongs in the private archive. */
import { AccessError } from "./ask-access.js";

export type ArchivedAnswer = {
  status: "answered" | "clarify" | "unsupported" | "sources-only";
  summary: string;
  sections: {
    heading: string;
    body: string;
    source_ids: string[];
    kind: "source" | "synthesis" | "application";
  }[];
  sources: Record<string, string>[];
  followups: string[];
  clarifying_questions: string[];
  limitations: string;
  retryable?: boolean;
  failure_code?: string;
};
const REQUIRED = [
  "status",
  "summary",
  "sections",
  "sources",
  "followups",
  "clarifying_questions",
  "limitations",
];
const SOURCE_LIMITS: Record<string, number> = {
  id: 3,
  title: 1000,
  url: 2048,
  date: 100,
  excerpt: 2600,
  author: 400,
  source_type: 100,
  reason: 350,
  attribution_note: 1000,
  evidence_role: 100,
  public_copy_url: 2048,
  timecode: 30,
  source_visibility: 64,
  text_access: 32,
  membership_platform: 32,
  membership_url: 2048,
  membership_verified_at: 35,
  transcript_source_kind: 100,
  transcript_quality: 64,
  speaker_classification: 100,
};
function invalid(): never {
  throw new AccessError("invalid_request", 400);
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, nonblank = false): value is string {
  return (
    typeof value === "string" &&
    Array.from(value).length <= max &&
    (!nonblank || !!value.trim()) &&
    !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(
      value
    )
  );
}
function list(value: unknown, max: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= max &&
    value.every(v => text(v, 250, true))
  );
}
function https(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function archivedAnswer(value: unknown): ArchivedAnswer {
  const r = object(value);
  if (
    REQUIRED.some(k => !(k in r)) ||
    Object.keys(r).some(
      k => ![...REQUIRED, "retryable", "failure_code"].includes(k)
    ) ||
    !["answered", "clarify", "unsupported", "sources-only"].includes(
      String(r.status)
    ) ||
    !text(r.summary, 350, true) ||
    !text(r.limitations, 900) ||
    !list(r.followups, 3) ||
    !list(r.clarifying_questions, 2) ||
    !Array.isArray(r.sections) ||
    r.sections.length > 3 ||
    !Array.isArray(r.sources) ||
    r.sources.length > 12 ||
    ("retryable" in r && typeof r.retryable !== "boolean") ||
    ("failure_code" in r &&
      (typeof r.failure_code !== "string" ||
        !/^[a-z_]{1,80}$/.test(r.failure_code)))
  )
    invalid();
  for (const section of r.sections) {
    const s = object(section);
    if (
      Object.keys(s).sort().join() !==
        ["body", "heading", "kind", "source_ids"].join() ||
      !text(s.heading, 90, true) ||
      !text(s.body, 2600, true) ||
      !["source", "synthesis", "application"].includes(String(s.kind)) ||
      !Array.isArray(s.source_ids) ||
      s.source_ids.length > 8 ||
      s.source_ids.some(id => typeof id !== "string" || !/^S\d{1,2}$/.test(id))
    )
      invalid();
  }
  const ids = new Set<string>();
  for (const source of r.sources) {
    const s = object(source);
    if (
      !text(s.id, 3, true) ||
      !/^S\d{1,2}$/.test(s.id) ||
      ids.has(s.id) ||
      !text(s.title, 1000, true) ||
      !text(s.url, 2048, true) ||
      !https(s.url) ||
      Object.entries(s).some(
        ([k, v]) => !(k in SOURCE_LIMITS) || !text(v, SOURCE_LIMITS[k])
      ) ||
      (typeof s.public_copy_url === "string" && !https(s.public_copy_url)) ||
      (typeof s.membership_url === "string" && !https(s.membership_url))
    )
      invalid();
    ids.add(s.id);
  }
  for (const s of r.sections as ArchivedAnswer["sections"])
    if (s.source_ids.some(id => !ids.has(id))) invalid();
  if (r.status === "answered" && !r.sections.length) invalid();
  return r as unknown as ArchivedAnswer;
}
