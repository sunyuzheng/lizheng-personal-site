// Two questions that differ only in punctuation or a word or two read as one, even when the
// curation filed them under different topics. The homepage list folds them (client/src/lib/
// ask-discovery.ts) and the public answer pages index only the first of them (ask-public-page.ts).
const shape = (text: string) => String(text || "").replace(/[\s\p{P}\p{S}]/gu, "").toLowerCase();
const PAIRS = new Map<string, Set<string>>();
function pairs(text: string) {
  let out = PAIRS.get(text);
  if (!out) {
    const s = shape(text);
    out = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
    if (PAIRS.size > 5000) PAIRS.clear();
    PAIRS.set(text, out);
  }
  return out;
}
export function sameQuestion(a: string, b: string): boolean {
  const x = pairs(a), y = pairs(b);
  if (!x.size || !y.size) return shape(a) === shape(b);
  let both = 0;
  for (const pair of x) if (y.has(pair)) both++;
  // Mostly the same characters, or the shorter one nearly contained in the longer (a question
  // with 「AI时代」 added). On the 46 questions published by 2026-10-03, this matched only three
  // rewordings of one question.
  return both / (x.size + y.size - both) >= 0.6 || (Math.min(x.size, y.size) >= 6 && both / Math.min(x.size, y.size) >= 0.8);
}
