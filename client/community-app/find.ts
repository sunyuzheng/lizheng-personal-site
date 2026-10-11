/**
 * Finding members by name, for city.lizheng.ai and the homepage window:
 * names that start with what was typed before names that contain it, people
 * with connections before people without, and the most connected first.
 * Case, width and spaces do not matter.
 */
import type { Community } from "./data";

export const normalizeName = (value: string) =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

export function findMembers(
  c: Pick<Community, "degree" | "strength">,
  /** Everyone's name, through normalizeName. */
  names: string[],
  query: string,
  options: { limit?: number; accept?: (member: number) => boolean } = {}
) {
  const term = normalizeName(query);
  if (!term) return [];
  const found: { member: number; rank: number }[] = [];
  for (let member = 0; member < names.length; member++) {
    const at = names[member].indexOf(term);
    if (at < 0 || (options.accept && !options.accept(member))) continue;
    found.push({ member, rank: (c.degree[member] ? 0 : 2) + (at ? 1 : 0) });
  }
  found.sort(
    (p, q) => p.rank - q.rank || c.strength[q.member] - c.strength[p.member]
  );
  return found.slice(0, options.limit ?? 8).map(({ member }) => member);
}
