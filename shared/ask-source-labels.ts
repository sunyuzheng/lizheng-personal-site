/**
 * Until 2026-10-04 an answer could name its sources in its prose by their internal labels ("S1 说得
 * 更直接"), which mean nothing to a reader; Builder now keeps them inside citation marks ([S1]).
 * Answers published before that still carry them, so what leaves this site reads each such label as
 * 出处1, 出处2…, the number a reader sees beside that source. Only the answer's own sources' labels,
 * never inside its citation marks, and never in a quoted excerpt.
 */
// A space set between the label and Chinese text goes with it: "S1 说得" reads 出处1说得.
const LABEL = /(?:(?<=[\u3000-\u9fff\uff00-\uffef]) )?(?<![A-Za-z0-9[])S(\d{1,2})(?![0-9A-Za-z\]])(?: (?=[\u3000-\u9fff\uff00-\uffef]))?/g;

export function plainSourceLabels(text: string, ids: ReadonlySet<string>): string {
  return text.replace(LABEL, (whole, n: string) => (ids.has(`S${n}`) ? `出处${n}` : whole));
}

type Answerish = { summary: string; limitations: string; sections: { heading: string; body: string }[]; sources: Record<string, unknown>[] };

/** The same answer, its prose and its notes on sources with plain source numbers. */
export function withPlainSourceLabels<T extends Answerish>(answer: T): T {
  const ids = new Set(answer.sources.map(source => String(source.id)));
  if (!ids.size) return answer;
  const fix = (value: unknown) => (typeof value === "string" ? plainSourceLabels(value, ids) : value);
  return {
    ...answer,
    summary: fix(answer.summary) as string,
    limitations: fix(answer.limitations) as string,
    sections: answer.sections.map(section => ({ ...section, heading: fix(section.heading) as string, body: fix(section.body) as string })),
    sources: answer.sources.map(source => ({
      ...source,
      ...("reason" in source ? { reason: fix(source.reason) } : {}),
      ...("attribution_note" in source ? { attribution_note: fix(source.attribution_note) } : {}),
    })),
  };
}

/** For a detail read as JSON: the answer with plain source numbers, when it has the expected shape. */
export function detailWithPlainSourceLabels(value: Record<string, unknown>): Record<string, unknown> {
  const answer = value.answer as Partial<Answerish> | undefined;
  if (!answer || typeof answer !== "object" || typeof answer.summary !== "string" || typeof answer.limitations !== "string" ||
      !Array.isArray(answer.sections) || !Array.isArray(answer.sources)) return value;
  return { ...value, answer: withPlainSourceLabels(answer as Answerish) };
}
