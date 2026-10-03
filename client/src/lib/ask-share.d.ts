import type { AskResult } from "./ask-lizheng";

/** Draws an answer as a long PNG or an A4 PDF; see ask-share.js. */
export function exportAnswer(
  kind: "png" | "pdf",
  data: { question: string; result: AskResult; date: Date; personal?: boolean },
  lang?: "zh" | "en"
): Promise<{ blob: Blob; name: string; type: string }>;
