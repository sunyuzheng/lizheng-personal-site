import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { Readable } from "node:stream";
import type { IncomingMessage } from "node:http";
import { decryptRecord, encryptRecord } from "../shared/ask-access.js";
import { INTAKE_BODY_LIMIT, escapeIntakeCsvCell, intakeCsv, validateIntake, validateIntakeUpdate, type IntakeRecord } from "../shared/guest-intake.js";
import { openIntake, sealIntake } from "../shared/guest-intake-storage.js";
import { intakeRequestBody } from "../api/guest-intake.js";

const input = { name: " 测试用户 ", contactMethod: "wechat", contact: " test_wechat ", industry: "软件", work: "构建知识工具",
  topics: [" AI 产品 "], membership: "stay", consent: true, submissionKey: "8240725a-ed81-4d89-b527-f884298f00bd" };
function record(): IntakeRecord {
  const { website, ...answers } = validateIntake(input); void website;
  return { ...answers, id: "8240725a-ed81-4d89-b527-f884298f00be", status: "new", notes: "", submittedAt: "2026-10-16T00:00:00.000Z", updatedAt: "2026-10-16T00:00:00.000Z" };
}
beforeEach(() => { vi.stubGlobal("crypto", webcrypto); vi.stubEnv("ASK_AUTH_SECRET", "test-only-auth-secret-at-least-32-bytes"); vi.stubEnv("GUEST_INTAKE_ENCRYPTION_KEY", "test-only-guest-intake-secret-at-least-32-bytes"); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("guest intake validation and export", () => {
  it("normalizes required text and optional answers without coercing data types", () => {
    expect(validateIntake(input)).toMatchObject({ name: "测试用户", contact: "test_wechat", topics: ["AI 产品"], city: "", website: "" });
    for (const value of [{ ...input, membership: ["stay"] }, { ...input, name: 123 }, { ...input, city: null }, { ...input, consent: "true" }]) expect(() => validateIntake(value)).toThrow();
  });
  it("enforces required answers, consent, email, topic uniqueness, UUID and length limits", () => {
    for (const key of ["name", "contact", "industry", "work"]) expect(() => validateIntake({ ...input, [key]: " \n " })).toThrow();
    for (const topics of [[], [""], ["AI", " ai "], ["a", "b", "c", "d"], ["x".repeat(301)]]) expect(() => validateIntake({ ...input, topics })).toThrow();
    for (const change of [{ consent: false }, { contactMethod: "email" }, { submissionKey: "invalid" }, { work: "x".repeat(5001) }, { name: "\ud800" }]) expect(() => validateIntake({ ...input, ...change })).toThrow();
    expect(validateIntake({ ...input, contactMethod: "email", contact: " sample@example.test " }).contact).toBe("sample@example.test");
    expect(validateIntake({ ...input, topics: ["a".repeat(300)], work: "x".repeat(5000) }).work).toHaveLength(5000);
  });
  it("permits only status and notes edits, including clearing a note", () => {
    expect(validateIntakeUpdate({ notes: " " })).toEqual({ notes: "" });
    for (const update of [{}, { status: "deleted" }, { name: "changed" }, { notes: "x".repeat(5001) }, { notes: 1 }]) expect(() => validateIntakeUpdate(update)).toThrow();
  });
  it("exports BOM, Unicode, line breaks, quotes and neutralized spreadsheet formulas", () => {
    for (const value of ["=1+1", "+1", "-1", "@SUM(A1)", " \t=1", "\nplain"]) expect(escapeIntakeCsvCell(value)).toBe(`"'${value}"`);
    const csv = intakeCsv([{ ...record(), notes: '两行\n"文字"', name: '=HYPERLINK("https://example.invalid")' }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff); expect(csv).toContain('"两行\n""文字"""'); expect(csv).toContain('"\'=HYPERLINK(');
  });
});
describe("purpose-bound encrypted records", () => {
  it("supports a 50KB submission plus notes without widening the existing auth decrypt cap", async () => {
    const large = { ...record(), work: "中".repeat(5000), experience: "中".repeat(5000), practice: "x".repeat(5000), notes: "中".repeat(5000) };
    const sealed = sealIntake(large);
    expect(sealed.length).toBeGreaterThan(24_000); expect(sealed).not.toContain("测试用户"); expect(openIntake(sealed, large.id)).toEqual(large);
    await expect(decryptRecord(sealed)).rejects.toMatchObject({ code: "access_unavailable" });
  });
  it("rejects modified ciphertext, record substitution, auth ciphertext and wrong secrets", async () => {
    const original = record(), sealed = sealIntake(original);
    const parts = sealed.split("."); parts[3] = (parts[3][0] === "a" ? "b" : "a") + parts[3].slice(1);
    expect(() => openIntake(parts.join("."), original.id)).toThrow();
    expect(() => openIntake(sealed, input.submissionKey)).toThrow();
    expect(() => openIntake("x".repeat(120_000), original.id)).toThrow();
    const authCiphertext = await encryptRecord(original);
    expect(() => openIntake(authCiphertext, original.id)).toThrow();
    vi.stubEnv("ASK_AUTH_SECRET", "different-test-only-auth-secret-at-least-32-bytes"); expect(openIntake(sealed, original.id)).toEqual(original);
    vi.stubEnv("GUEST_INTAKE_ENCRYPTION_KEY", "different-test-only-secret-at-least-32-bytes"); expect(() => openIntake(sealed, original.id)).toThrow();
  });
});

describe("bounded JSON input", () => {
  const request = (body: unknown, headers: Record<string, string> = {}) => ({ body, headers: { "content-type": "application/json", ...headers } }) as IncomingMessage;
  it("bounds raw, parsed and chunked UTF-8 bytes and rejects malformed JSON", async () => {
    expect(await intakeRequestBody(request('{"name":"测试"}'))).toEqual({ name: "测试" });
    for (const body of [{ value: "中".repeat(INTAKE_BODY_LIMIT / 2) }, Buffer.alloc(INTAKE_BODY_LIMIT + 1), '"' + "x".repeat(INTAKE_BODY_LIMIT) + '"']) await expect(intakeRequestBody(request(body))).rejects.toMatchObject({ status: 413 });
    const chunked = Readable.from([Buffer.from('{"value":"'), Buffer.from("中".repeat(20_000)), Buffer.from('"}')]);
    Object.assign(chunked, { headers: { "content-type": "application/json", "content-length": "1" } });
    await expect(intakeRequestBody(chunked as IncomingMessage)).rejects.toMatchObject({ status: 413 });
    await expect(intakeRequestBody(request("{"))).rejects.toMatchObject({ status: 400 });
    await expect(intakeRequestBody(request(Buffer.from([0xff])))).rejects.toMatchObject({ status: 400 });
    await expect(intakeRequestBody(request("{}", { "content-type": "text/plain" }))).rejects.toMatchObject({ status: 415 });
  });
});
