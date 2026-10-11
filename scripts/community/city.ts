/**
 * The homepage dot map's file (city.json): the fallback drawn where
 * city.lizheng.ai cannot be (no WebGL2). One entry per member, most active
 * first. It comes from the same member list as the connection map, in the
 * same run (docs/community-graph.md).
 *
 * - heat[i] is one digit 0–9 per member (memberHeat);
 * - linked[i] is member i's public profile id and names[i] their display name;
 * - joined[i] is the month member i joined as YYYYMM (0 when unknown);
 * - posts[i] and comments[i] are member i's counts. Members are sorted by
 *   activity, so both arrays stop after the last member with any.
 */
import type { MemberRecord } from "./circle";

export interface CityFile {
  version: 1;
  generatedAt: string;
  count: number;
  heat: string;
  linked: string[];
  names: string[];
  joined: number[];
  posts: number[];
  comments: number[];
}

const DAY = 24 * 60 * 60 * 1000;
const STEPS = [3, 10, 30, 100, 300, 1000];

/**
 * How brightly a member shows, 0–9 (also in graph.json): 3–9 from posts × 3
 * + comments, and for members with neither 0–2 from how recently they
 * visited (within 30 days, within 180 days).
 */
export function memberHeat(
  member: Pick<MemberRecord, "posts" | "comments" | "seen">,
  now: number
) {
  const score = member.posts * 3 + member.comments;
  if (score > 0) return 3 + STEPS.filter(step => score >= step).length;
  const away = now - member.seen;
  return member.seen && away < 30 * DAY
    ? 2
    : member.seen && away < 180 * DAY
      ? 1
      : 0;
}

export function toCityFile(members: MemberRecord[], now: Date): CityFile {
  const entries = members
    .filter(member => member.uid)
    .map(member => ({
      member,
      score: member.posts * 3 + member.comments,
      heat: memberHeat(member, now.getTime()),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.heat - a.heat ||
        a.member.created - b.member.created
    );
  const active = entries.filter(entry => entry.score > 0).length;
  const month = (time: number) => {
    if (!time) return 0;
    const date = new Date(time);
    return date.getUTCFullYear() * 100 + date.getUTCMonth() + 1;
  };
  return {
    version: 1,
    generatedAt: now.toISOString().slice(0, 10),
    count: entries.length,
    heat: entries.map(entry => entry.heat).join(""),
    linked: entries.map(entry => entry.member.uid),
    names: entries.map(entry => entry.member.name),
    joined: entries.map(entry => month(entry.member.created)),
    posts: entries.slice(0, active).map(entry => entry.member.posts),
    comments: entries.slice(0, active).map(entry => entry.member.comments),
  };
}
