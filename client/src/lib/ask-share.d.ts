import type { AskResult } from "./ask-lizheng";

/** What an exported answer shows; `other`: someone else asked it (别人在问什么). */
export type ExportData = { question: string; result: AskResult; date: Date; personal?: boolean; link?: string; other?: boolean };

/** Draws an answer as a long PNG or an A4 PDF; see ask-share.js. */
export function exportAnswer(
  kind: "png" | "pdf",
  data: ExportData,
  lang?: "zh" | "en"
): Promise<{ blob: Blob; name: string; type: string }>;
