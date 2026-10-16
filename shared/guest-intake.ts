export const INTAKE_BODY_LIMIT = 50 * 1024;
export const INTAKE_STATUSES = ["new", "contacted", "matched", "archived"] as const;
export type IntakeStatus = typeof INTAKE_STATUSES[number];
export type IntakeInput = {
  name: string; contactMethod: "wechat" | "email"; contact: string; city: string;
  industry: string; role: string; work: string; experience: string; topics: string[];
  practice: string; cases: string; knownFor: string; links: string;
  membership: "stay" | "builders" | "community" | "other"; connection: string;
  consent: true; website: string; submissionKey: string;
};
export type IntakeRecord = Omit<IntakeInput, "website"> & {
  id: string; status: IntakeStatus; notes: string; submittedAt: string; updatedAt: string;
};
export type IntakeUpdate = { status?: IntakeStatus; notes?: string };
export class IntakeError extends Error {
  constructor(readonly code: string, readonly status: number, readonly messageText: string, readonly fieldErrors?: Record<string, string[]>) {
    super(code);
  }
}
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export function intakeUuid(value: unknown): value is string { return typeof value === "string" && UUID.test(value); }
const invalidUnicode = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

export function validateIntake(value: unknown): IntakeInput {
  if (!isObject(value)) throw new IntakeError("invalid_intake", 400, "提交内容格式有误。");
  const errors: Record<string, string[]> = {};
  const error = (key: string, message: string) => { errors[key] = [...(errors[key] || []), message]; };
  const text = (key: string, label: string, max: number, required = false) => {
    const raw = value[key];
    if (raw === undefined && !required) return "";
    if (typeof raw !== "string") { error(key, `请填写${label}`); return ""; }
    const result = raw.trim();
    if (required && !result) error(key, `请填写${label}`);
    if (result.length > max) error(key, `${label}请控制在 ${max} 字以内`);
    if (invalidUnicode.test(result) || /\u0000/.test(result)) error(key, `${label}包含无效字符`);
    return result;
  };
  const name = text("name", "称呼", 80, true), contact = text("contact", "联系方式", 200, true);
  const city = text("city", "城市", 100), industry = text("industry", "行业", 160, true), role = text("role", "角色", 160);
  const work = text("work", "正在做的事", 5000, true), experience = text("experience", "经历", 5000);
  const practice = text("practice", "实践经验", 5000), cases = text("cases", "案例", 5000);
  const knownFor = text("knownFor", "希望被记住的特点", 5000), links = text("links", "相关链接", 5000);
  const connection = text("connection", "希望获得的连接", 5000), website = text("website", "网站", 300);
  const contactMethod = value.contactMethod;
  if (contactMethod !== "wechat" && contactMethod !== "email") error("contactMethod", "请选择联系方式");
  if (contactMethod === "email" && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) || /[\x00-\x1f\x7f<>"\\]/.test(contact))) error("contact", "请填写有效的邮箱地址");
  const membership = value.membership;
  if (typeof membership !== "string" || !["stay", "builders", "community", "other"].includes(membership)) error("membership", "请选择你的参与方式");
  const topics: string[] = [];
  if (!Array.isArray(value.topics) || value.topics.length < 1 || value.topics.length > 3) error("topics", "请填写 1–3 个主题");
  else {
    for (const topic of value.topics) {
      if (typeof topic !== "string" || !topic.trim() || topic.trim().length > 300 || invalidUnicode.test(topic) || topic.includes("\u0000")) error("topics", "每个主题请填写 1–300 字");
      else topics.push(topic.trim());
    }
    if (new Set(topics.map(topic => topic.toLowerCase())).size !== topics.length) error("topics", "主题请勿重复");
  }
  if (value.consent !== true) error("consent", "请先同意信息使用说明");
  if (!intakeUuid(value.submissionKey)) error("submissionKey", "提交标识无效，请刷新后重试");
  if (Object.keys(errors).length) throw new IntakeError("invalid_intake", 400, "请检查并补充标记的内容。", errors);
  return { name, contactMethod: contactMethod as IntakeInput["contactMethod"], contact, city, industry, role, work, experience,
    topics, practice, cases, knownFor, links, membership: membership as IntakeInput["membership"], connection,
    consent: true, website, submissionKey: (value.submissionKey as string).toLowerCase() };
}
export function validateIntakeUpdate(value: unknown): IntakeUpdate {
  if (!isObject(value) || !Object.keys(value).length || Object.keys(value).some(key => key !== "status" && key !== "notes"))
    throw new IntakeError("invalid_update", 400, "请仅提供状态或备注。");
  const update: IntakeUpdate = {};
  if ("status" in value) {
    if (!INTAKE_STATUSES.includes(value.status as IntakeStatus)) throw new IntakeError("invalid_update", 400, "跟进状态无效。", { status: ["请选择有效的跟进状态"] });
    update.status = value.status as IntakeStatus;
  }
  if ("notes" in value) {
    if (typeof value.notes !== "string" || value.notes.trim().length > 5000 || invalidUnicode.test(value.notes) || value.notes.includes("\u0000")) throw new IntakeError("invalid_update", 400, "备注请控制在 5000 字以内。", { notes: ["备注请控制在 5000 字以内"] });
    update.notes = value.notes.trim();
  }
  return update;
}
export function escapeIntakeCsvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
const CSV_COLUMNS: Array<[keyof IntakeRecord, string]> = [
  ["id", "登记编号"], ["submittedAt", "提交时间（UTC）"], ["name", "称呼"], ["contactMethod", "联系方式类型"],
  ["contact", "联系方式"], ["city", "城市"], ["industry", "行业"], ["role", "角色"], ["work", "正在做的事"],
  ["experience", "经历"], ["topics", "主题"], ["practice", "实践经验"], ["cases", "案例"], ["knownFor", "希望被记住的特点"],
  ["links", "相关链接"], ["membership", "参与方式"], ["connection", "希望获得的连接"], ["consent", "同意信息使用"],
  ["status", "跟进状态"], ["notes", "内部备注"], ["updatedAt", "更新时间（UTC）"],
];
export function intakeCsv(records: IntakeRecord[]) {
  const rows = [CSV_COLUMNS.map(([, label]) => escapeIntakeCsvCell(label)).join(",")];
  for (const record of records) rows.push(CSV_COLUMNS.map(([key]) => {
    const value = record[key];
    return escapeIntakeCsvCell(Array.isArray(value) ? value.join("；") : value);
  }).join(","));
  return `\uFEFF${rows.join("\r\n")}\r\n`;
}
