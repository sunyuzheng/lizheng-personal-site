// Types for ask-report-client.js, 反馈问题 as the pages send it, copied from ask-lizheng by scripts/sync-ask-app.mjs.
type ReportWords = {
  button: string;
  title: string;
  introTurn: string;
  introPage: string;
  label: string;
  placeholder: string;
  withTurn: string;
  withPage: string;
  send: string;
  sending: string;
  cancel: string;
  close: string;
  sent: string;
  failed: string;
  limited: string;
  community: string;
  communityLink: string;
};
export type ReportPlace = "waiting" | "failed" | "answer" | "page";
export type ReportTurn = {
  question?: string;
  askedAt?: number | string;
  elapsed?: number;
  quiet?: number;
  stage?: string;
  error?: string;
  status?: string;
  model?: string;
  share?: string;
};
export type ReportResult = "sent" | "limited" | "failed";
export const REPORT_ENDPOINT: string;
export const REPORT_TEXT_MAX: number;
export const REPORT_COPY: { zh: ReportWords; en: ReportWords };
export function reportCopy(lang: "zh" | "en", owner: string): ReportWords;
export function reportPayload(input: { surface: "ask" | "app" | "home"; place: ReportPlace; text?: string; turn?: ReportTurn }): Record<string, unknown>;
export function sendReport(payload: Record<string, unknown>): Promise<ReportResult>;
