import type { IncomingMessage, ServerResponse } from "node:http";
import { ACCESS_HEADERS, AccessError, officialOrigin } from "../shared/ask-access.js";
import { QUOTA_BODY_LIMIT, runQuotaCommand } from "../shared/ask-quota-storage.js";

async function input(req: IncomingMessage): Promise<Buffer> {
  if (String(req.headers["content-type"] || "").split(";")[0] !== "application/octet-stream")
    throw new AccessError("invalid_request", 400);
  const length = req.headers["content-length"];
  if (length && (typeof length !== "string" || !/^\d+$/.test(length) || Number(length) > QUOTA_BODY_LIMIT))
    throw new AccessError("input_too_large", 413);
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  if (parsed !== undefined) {
    if (!Buffer.isBuffer(parsed) && typeof parsed !== "string") throw new AccessError("invalid_request", 400);
    const body = Buffer.from(parsed);
    if (body.byteLength > QUOTA_BODY_LIMIT) throw new AccessError("input_too_large", 413);
    return body;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        let size = 0;
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += bytes.byteLength;
          if (size > QUOTA_BODY_LIMIT) throw new AccessError("input_too_large", 413);
          chunks.push(bytes);
        }
        return Buffer.concat(chunks);
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { req.destroy(); reject(new AccessError("invalid_request", 400)); }, 2_000);
      }),
    ]);
  } finally { clearTimeout(timer); }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  for (const [key, value] of Object.entries(ACCESS_HEADERS)) res.setHeader(key, value);
  res.setHeader("Content-Type", "application/json");
  try {
    if (req.method !== "POST") throw new AccessError("method_not_allowed", 405);
    officialOrigin(`https://${req.headers.host || ""}/`);
    const result = await runQuotaCommand(await input(req), req.headers["x-ask-quota-proof"]);
    res.statusCode = 200;
    res.end(JSON.stringify({ result }));
  } catch (error) {
    const failure = error instanceof AccessError ? error : new AccessError("quota_unavailable");
    res.statusCode = failure.status;
    res.end(JSON.stringify({ code: failure.code }));
  }
}
