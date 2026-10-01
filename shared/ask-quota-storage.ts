/** Fixed quota operations for Builder; storage credentials stay in Vercel. */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { AccessError, redis } from "./ask-access.js";
import { QUOTA_SCRIPT } from "./ask-quota-script.js";

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const DAILY_KEY = /^ask-quota:v1:\{([a-f0-9]{64})\}:(\d{4}-\d{2}-\d{2}):used$/;
export const QUOTA_BODY_LIMIT = 16_384;

function unavailable(): never { throw new AccessError("quota_unavailable"); }

export function verifyQuotaStorageProof(body: Buffer, proof: unknown, now = Math.floor(Date.now() / 1000)) {
  const secret = process.env.ASK_QUOTA_STORE_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) unavailable();
  if (typeof proof !== "string" || !/^v1\.[0-9]{10}\.[a-f0-9]{64}$/.test(proof))
    throw new AccessError("invalid_admission", 403);
  const [, expiry, signature] = proof.split(".");
  if (Number(expiry) <= now || Number(expiry) > now + 60)
    throw new AccessError("invalid_admission", 403);
  const hash = createHash("sha256").update(body).digest("hex");
  const expected = createHmac("sha256", secret).update(`ask-quota-store:v1:${expiry}:${hash}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex")))
    throw new AccessError("invalid_admission", 403);
}

export function quotaCommand(body: Buffer, now = Math.floor(Date.now() / 1000)): (string | number)[] {
  let command: unknown;
  try { command = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)); }
  catch { throw new AccessError("invalid_request", 400); }
  const reject = (): never => { throw new AccessError("invalid_request", 400); };
  if (!Array.isArray(command) || command.length !== 15 ||
      command.some(value => typeof value !== "string" && typeof value !== "number")) reject();
  const c = command as (string | number)[];
  if (c[0] !== "EVAL" || c[1] !== QUOTA_SCRIPT || c[2] !== 3 ||
      typeof c[3] !== "string" || typeof c[4] !== "string" || typeof c[5] !== "string" ||
      !["reserve", "commit", "release", "status"].includes(String(c[6])) ||
      typeof c[7] !== "number" || !Number.isInteger(c[7]) || Math.abs(c[7] - now) > 60 ||
      ![0, 3].includes(Number(c[8])) || typeof c[8] !== "number" ||
      typeof c[9] !== "string" || !UUID.test(c[9]) || typeof c[10] !== "string" ||
      (c[6] === "status" ? c[10] !== "" : !UUID.test(c[10])) ||
      typeof c[11] !== "string" || typeof c[12] !== "number" || !Number.isInteger(c[12]) ||
      c[13] !== 150 || c[14] !== 172800) reject();
  const match = DAILY_KEY.exec(String(c[3]));
  if (!match || match[2] !== c[11]) reject();
  const day = String(c[11]), prefix = `ask-quota:v1:{${match![1]}}:`;
  const midnight = Date.parse(`${day}T00:00:00+08:00`) / 1000;
  if (!Number.isFinite(midnight) || new Date(midnight * 1000 + 8 * 3600_000).toISOString().slice(0, 10) !== day ||
      c[12] !== midnight + 86400 || c[12] < now - 172800 || c[12] > now + 86400 ||
      c[4] !== `${prefix}${day}:pending` || c[5] !== `${prefix}attempt:${c[9]}`) reject();
  // Preserve a command's original day when a lost-response retry crosses midnight.
  const requestDay = new Date((Number(c[7]) + 8 * 3600) * 1000).toISOString().slice(0, 10);
  if (["reserve", "status"].includes(String(c[6])) && day !== requestDay) reject();
  return c;
}

export async function runQuotaCommand(body: Buffer, proof: unknown) {
  if (body.byteLength > QUOTA_BODY_LIMIT) throw new AccessError("input_too_large", 413);
  verifyQuotaStorageProof(body, proof);
  const result = await redis(quotaCommand(body));
  if (!Array.isArray(result) || result.length !== 3 ||
      !["OK", "DUPLICATE", "EXHAUSTED", "EXPIRED"].includes(result[0]) ||
      result.slice(1).some(value => typeof value !== "number" || !Number.isInteger(value) || value < 0)) unavailable();
  return result;
}
