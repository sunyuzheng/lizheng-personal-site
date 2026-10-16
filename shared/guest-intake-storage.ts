/** Node-only, purpose-bound encrypted guest records in the existing private Redis. */
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { authDigest, clientNetwork, redis, verifiedSessionEmail } from "./ask-access.js";
import { IntakeError, intakeUuid, validateIntake, validateIntakeUpdate, type IntakeInput, type IntakeRecord, type IntakeUpdate } from "./guest-intake.js";

export const INTAKE_PREFIX = "guest-intake:{v1}:";
export const INTAKE_PAGE_SIZE = 50;
export const INTAKE_NETWORK_WINDOW_SECONDS = 600;
export const INTAKE_NETWORK_LIMIT = 20;
const INDEX_KEY = `${INTAKE_PREFIX}index`;
const RECORD_PREFIX = `${INTAKE_PREFIX}record:`;
const MAX_PLAIN_BYTES = 80 * 1024;
const MAX_SEALED_BYTES = 112 * 1024;
const unavailable = () => new IntakeError("guest_intake_unavailable", 503, "登记服务暂时不可用，请稍后重试。");

export const INTAKE_CREATE_SCRIPT = `
local existing = redis.call('GET', KEYS[1])
if existing then return {'existing', existing} end
if redis.call('EXISTS', KEYS[2]) == 1 then return {'collision'} end
local used = tonumber(redis.call('GET', KEYS[4]) or '0')
if used >= tonumber(ARGV[5]) then return {'limited'} end
local count = redis.call('INCR', KEYS[4])
if count == 1 then redis.call('EXPIRE', KEYS[4], ARGV[6]) end
redis.call('SET', KEYS[2], ARGV[2])
redis.call('SET', KEYS[1], ARGV[1])
redis.call('ZADD', KEYS[3], 0, ARGV[3])
return {'created', ARGV[1]}
`;
export const INTAKE_UPDATE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if not current then return -1 end
if current ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
return 1
`;

function encryptionKey() {
  const secret = process.env.GUEST_INTAKE_ENCRYPTION_KEY;
  if (!secret || Buffer.byteLength(secret) < 32) throw unavailable();
  return createHash("sha256").update("guest-intake:sealed-record:v1\0", "utf8").update(secret, "utf8").digest();
}
export function sealIntake(record: IntakeRecord) {
  const plain = Buffer.from(JSON.stringify(record), "utf8");
  if (!intakeUuid(record.id) || plain.byteLength > MAX_PLAIN_BYTES) throw unavailable();
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(`guest-intake:sealed-record:v1:${record.id}`, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`;
}
export function openIntake(sealed: unknown, id: string): IntakeRecord {
  if (!intakeUuid(id) || typeof sealed !== "string" || sealed.length > MAX_SEALED_BYTES) throw unavailable();
  try {
    const [version, ivText, tagText, dataText, extra] = sealed.split(".");
    if (version !== "v1" || extra || ![ivText, tagText, dataText].every(value => value && /^[A-Za-z0-9_-]+$/.test(value))) throw unavailable();
    const iv = Buffer.from(ivText, "base64url"), tag = Buffer.from(tagText, "base64url"), data = Buffer.from(dataText, "base64url");
    if (iv.length !== 12 || tag.length !== 16 || data.length > MAX_PLAIN_BYTES) throw unavailable();
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAAD(Buffer.from(`guest-intake:sealed-record:v1:${id}`, "utf8")); decipher.setAuthTag(tag);
    const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat([decipher.update(data), decipher.final()])));
    const input = validateIntake(raw), update = validateIntakeUpdate({ status: raw.status, notes: raw.notes });
    const validDate = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
    if (raw.id !== id || !validDate(raw.submittedAt) || !validDate(raw.updatedAt) || input.website) throw unavailable();
    const { website, ...answers } = input; void website;
    return { ...answers, id, status: update.status!, notes: update.notes!, submittedAt: raw.submittedAt, updatedAt: raw.updatedAt };
  } catch { throw unavailable(); }
}

export async function requireGuestIntakeAdmin(request: Request) {
  const emails = (process.env.GUEST_INTAKE_ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  if (!emails.length || emails.some(email => email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new IntakeError("guest_intake_admin_unconfigured", 503, "嘉宾池管理权限尚未配置。");
  const session = await verifiedSessionEmail(request);
  if (!session) throw new IntakeError("guest_intake_login_required", 401, "请先登录嘉宾池管理。");
  if (!emails.includes(session.email.trim().toLowerCase())) throw new IntakeError("guest_intake_forbidden", 403, "此账号没有嘉宾池管理权限。");
  return { email: session.email };
}

export async function createIntake(input: IntakeInput, request: Request, now = Date.now()) {
  const id = randomUUID(), timestamp = new Date(now).toISOString();
  const { website, ...answers } = input; void website;
  const record: IntakeRecord = { ...answers, id, status: "new", notes: "", submittedAt: timestamp, updatedAt: timestamp };
  const window = Math.floor(now / (INTAKE_NETWORK_WINDOW_SECONDS * 1000));
  const network = await authDigest(`guest-intake:network:v1:${window}:${clientNetwork(request)}`);
  const result = await redis(["EVAL", INTAKE_CREATE_SCRIPT, 4,
    `${INTAKE_PREFIX}submission:${input.submissionKey}`, `${RECORD_PREFIX}${id}`, INDEX_KEY,
    `${INTAKE_PREFIX}rate:${window}:${network}`, id, sealIntake(record), `${timestamp}|${id}`, now,
    INTAKE_NETWORK_LIMIT, INTAKE_NETWORK_WINDOW_SECONDS * 2]);
  if (!Array.isArray(result)) throw unavailable();
  if (result[0] === "limited") throw new IntakeError("guest_intake_throttled", 429, "提交较频繁，请稍后再试。");
  if (!["existing", "created"].includes(result[0]) || !intakeUuid(result[1])) throw unavailable();
  return { id: result[1], created: result[0] === "created" };
}

function validCursor(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\|[a-f0-9-]{36}$/.test(value)) return false;
  const [date, id] = value.split("|");
  return intakeUuid(id) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString() === date;
}
export async function listIntakes(cursor: string | null = null): Promise<{ records: IntakeRecord[]; nextCursor: string | null }> {
  if (cursor !== null && !validCursor(cursor)) throw new IntakeError("invalid_cursor", 400, "分页标识无效，请刷新后重试。");
  const members = await redis(["ZREVRANGEBYLEX", INDEX_KEY, cursor ? `(${cursor}` : "+", "-", "LIMIT", 0, INTAKE_PAGE_SIZE + 1]);
  if (!Array.isArray(members) || members.some(member => typeof member !== "string" || !validCursor(member))) throw unavailable();
  const page = members.slice(0, INTAKE_PAGE_SIZE) as string[];
  if (!page.length) return { records: [], nextCursor: null };
  const ids = page.map(member => member.slice(-36));
  const sealed = await redis(["MGET", ...ids.map(id => `${RECORD_PREFIX}${id}`)]);
  if (!Array.isArray(sealed) || sealed.length !== ids.length) throw unavailable();
  const records = sealed.map((value, index) => openIntake(value, ids[index]));
  return { records, nextCursor: members.length > INTAKE_PAGE_SIZE ? page[page.length - 1] : null };
}

export async function updateIntake(id: string, update: IntakeUpdate): Promise<IntakeRecord> {
  if (!intakeUuid(id)) throw new IntakeError("invalid_id", 400, "记录标识无效。");
  const key = `${RECORD_PREFIX}${id.toLowerCase()}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const sealed = await redis(["GET", key]);
    if (sealed === null) throw new IntakeError("intake_not_found", 404, "未找到这条登记。");
    const record = { ...openIntake(sealed, id.toLowerCase()), ...update, updatedAt: new Date().toISOString() };
    const result = await redis(["EVAL", INTAKE_UPDATE_SCRIPT, 1, key, sealed as string, sealIntake(record)]);
    if (result === 1) return record;
    if (result === -1) throw new IntakeError("intake_not_found", 404, "未找到这条登记。");
    if (result !== 0) throw unavailable();
  }
  throw new IntakeError("intake_changed", 409, "记录刚刚有更新，请刷新后重试。");
}
