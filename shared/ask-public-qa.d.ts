// Types for ask-public-qa.js, the words about public Q&A copied from ask-lizheng by scripts/sync-ask-app.mjs.
type Situational = string | { kept: string; notKept: string };
type Words = {
  notice: string;
  title: string;
  about: Situational[];
  situation: { kept: string; notKept: string };
  share: string;
  policy: string;
  answerer: string;
};
export const PUBLIC_QA: { zh: Words; en: Words };
export function answerService(model: string | null | undefined): string | null;
export function publicQaCopy(
  lang: "zh" | "en",
  voice: { owner: string; self: string; answerer: string | null | undefined; contextKept: boolean }
): { notice: string; title: string; about: string[]; situation: string; share: string; policy: string };
