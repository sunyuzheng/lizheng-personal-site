import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { AccessError, officialOrigin, sameOrigin } from "../shared/ask-access.js";
import { INTAKE_BODY_LIMIT, IntakeError, intakeCsv, intakeUuid, validateIntake, validateIntakeUpdate } from "../shared/guest-intake.js";
import { createIntake, listIntakes, requireGuestIntakeAdmin, updateIntake } from "../shared/guest-intake-storage.js";

export const config = { api: { bodyParser: false } };
export async function intakeRequestBody(req: IncomingMessage): Promise<unknown> {
  if (String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase() !== "application/json") throw new IntakeError("invalid_content_type", 415, "请使用 JSON 格式提交。");
  const size = req.headers["content-length"];
  if (size !== undefined && (typeof size !== "string" || !/^\d+$/.test(size) || Number(size) > INTAKE_BODY_LIMIT)) throw new IntakeError("input_too_large", 413, "填写内容过长，请精简后重试。");
  let raw = (req as IncomingMessage & { body?: unknown }).body;
  if (raw === undefined) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      raw = await Promise.race([
        (async () => {
          const chunks: Buffer[] = []; let bytes = 0;
          for await (const chunk of req) {
            const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            bytes += value.byteLength;
            if (bytes > INTAKE_BODY_LIMIT) throw new IntakeError("input_too_large", 413, "填写内容过长，请精简后重试。");
            chunks.push(value);
          }
          return Buffer.concat(chunks);
        })(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => { req.destroy(); reject(new IntakeError("invalid_request", 400, "读取提交内容超时，请重试。")); }, 5000); }),
      ]);
    } finally { clearTimeout(timer); }
  }
  try {
    if (Buffer.isBuffer(raw)) {
      if (raw.byteLength > INTAKE_BODY_LIMIT) throw new IntakeError("input_too_large", 413, "填写内容过长，请精简后重试。");
      raw = new TextDecoder("utf-8", { fatal: true }).decode(raw);
    }
    if (typeof raw === "string") {
      if (Buffer.byteLength(raw) > INTAKE_BODY_LIMIT) throw new IntakeError("input_too_large", 413, "填写内容过长，请精简后重试。");
      return JSON.parse(raw);
    }
    if (Buffer.byteLength(JSON.stringify(raw) ?? "") > INTAKE_BODY_LIMIT) throw new IntakeError("input_too_large", 413, "填写内容过长，请精简后重试。");
    return raw;
  } catch (error) {
    if (error instanceof IntakeError) throw error;
    throw new IntakeError("invalid_request", 400, "提交内容格式有误，请刷新后重试。");
  }
}
function requestFrom(req: IncomingMessage) {
  const host = req.headers.host;
  if (typeof host !== "string" || !host) throw new IntakeError("invalid_origin", 403, "请从本站页面提交。");
  const origin = officialOrigin(`https://${host}`), url = new URL(req.url || "/", origin);
  if (url.origin !== origin) throw new IntakeError("invalid_origin", 403, "请从本站页面提交。");
  const headers = new Headers();
  for (const name of ["cookie", "origin", "sec-fetch-site", "x-vercel-forwarded-for", "x-forwarded-for"]) {
    const value = req.headers[name];
    if (value !== undefined && typeof value !== "string") throw new IntakeError("invalid_request", 400, "请求格式有误。");
    if (typeof value === "string") headers.set(name, value);
  }
  if (headers.has("origin") && headers.get("origin") !== origin) throw new IntakeError("invalid_origin", 403, "请从本站页面提交。");
  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) throw new IntakeError("invalid_origin", 403, "请从本站页面提交。");
  return new Request(url, { method: req.method || "GET", headers });
}
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  for (const [name, value] of Object.entries({ "Cache-Control": "no-store, no-transform", "X-Robots-Tag": "noindex, nofollow, noarchive",
    Vary: "Cookie", "Cross-Origin-Resource-Policy": "same-origin", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" })) res.setHeader(name, value);
  const json = (status: number, value: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(value)); };
  try {
    const request = requestFrom(req), url = new URL(request.url), action = url.searchParams.get("__route") || "submit";
    const params = [...url.searchParams.keys()];
    if (new Set(params).size !== params.length || params.some(key => !["__route", ...(action === "update" ? ["id"] : action === "list" || action === "export" ? ["cursor"] : [])].includes(key))) throw new IntakeError("invalid_request", 400, "请求参数无效。");
    if (!["submit", "list", "update", "export", "session"].includes(action)) throw new IntakeError("not_found", 404, "未找到此接口。");
    const method = action === "submit" ? "POST" : action === "update" ? "PATCH" : "GET";
    if (request.method !== method) { res.setHeader("Allow", method); throw new IntakeError("method_not_allowed", 405, "请求方式无效。"); }
    if (action === "submit" || action === "update") sameOrigin(request);
    if (action === "submit") {
      const input = await intakeRequestBody(req);
      if (input && typeof input === "object" && "website" in input && typeof input.website === "string" && input.website.trim()) return json(201, { id: randomUUID() });
      const result = await createIntake(validateIntake(input), request);
      return json(result.created ? 201 : 200, { id: result.id });
    }
    const owner = await requireGuestIntakeAdmin(request);
    if (action === "session") return json(200, { admin: true, email: owner.email });
    if (action === "update") {
      const id = url.searchParams.get("id");
      if (!intakeUuid(id)) throw new IntakeError("invalid_id", 400, "记录标识无效。");
      return json(200, { record: await updateIntake(id, validateIntakeUpdate(await intakeRequestBody(req))) });
    }
    const page = await listIntakes(url.searchParams.get("cursor"));
    if (action === "list") return json(200, page);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="guest-intakes-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.setHeader("X-Guest-Intake-Next-Cursor", page.nextCursor || "");
    res.setHeader("X-Guest-Intake-Complete", page.nextCursor ? "false" : "true");
    res.end(intakeCsv(page.records));
  } catch (error) {
    const code = error instanceof IntakeError || error instanceof AccessError ? error.code : "guest_intake_unavailable";
    const status = error instanceof IntakeError || error instanceof AccessError ? error.status : 503;
    const message = error instanceof IntakeError ? error.messageText : status === 403 ? "请从本站页面提交。" : "登记服务暂时不可用，请稍后重试。";
    if (status === 429) res.setHeader("Retry-After", "600");
    json(status, { code, error: message, ...(error instanceof IntakeError && error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}) });
  }
}
