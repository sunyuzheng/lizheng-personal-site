import {
  COMMUNITY_MEMBER_COUNT,
  COMMUNITY_MEMBER_COUNT_AS_OF,
} from "./community-count.generated";

/*
 * How many people are in the free community, and how the pages say it.
 *
 * The member count is the community map's (city.json, published every day by
 * .github/workflows/community-city.yml). `pnpm build` reads it first
 * (scripts/sync-community-count.ts), so every build writes the pages with that day's count.
 * It used to be typed into each page by hand; within ten days the hero said 两万多, the map
 * under it 28,255, and the last chapter 20,000+.
 */

/** The map's data, published daily. The homepage's dot field reads the same file. */
export const CITY_DATA_URL =
  "https://kwicxc1px65aokwa.public.blob.vercel-storage.com/community/city.json";

/** The map's own count: one dot per member who finished their profile. */
export const MAP_MEMBERS = COMMUNITY_MEMBER_COUNT;

/*
 * The figure the pages state never goes below 3万 / 30,000+ (立正, 2026-11-10). That figure
 * counts every community account, including people invited who have not finished their
 * profile (29,417 on 2026-11-10), plus the Maven waitlist: a wider base than the map's
 * profile-complete members (28,377 the same day). Once the map's count passes 30,000, the
 * daily number takes over again. The map itself (its dots and the count beside it) always
 * shows MAP_MEMBERS.
 */
export const PUBLIC_MEMBERS_FLOOR = 30_000;

export const COMMUNITY_MEMBERS = Math.max(MAP_MEMBERS, PUBLIC_MEMBERS_FLOOR);

/** 30,000 → "30,000+"; 31,250 → "31,000+": a figure that stays true while the community grows. */
export function membersFigure(count: number = COMMUNITY_MEMBERS): string {
  return `${(Math.floor(count / 1000) * 1000).toLocaleString("en-US")}+`;
}

/** 30,000 → "3万"; 31,900 → "3.1万". For Chinese prose: 3万人, 3万成员. */
export function membersWan(count: number = COMMUNITY_MEMBERS): string {
  const tenths = Math.floor(count / 1000);
  return `${tenths % 10 === 0 ? tenths / 10 : (tenths / 10).toFixed(1)}万`;
}

/** "2026年11月" / "November 2026": the month the member count was read. */
export function membersAsOf(lang: "en" | "zh"): string {
  const [year, month] = COMMUNITY_MEMBER_COUNT_AS_OF.split("-").map(Number);
  if (lang === "zh") return `${year}年${month}月`;
  const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${name} ${year}`;
}

// Project posts in Share Your Projects: 919 published on 2026-10-31 (Circle list_posts,
// space 1391825). There is no daily source for this one; raise it by hand at the next hundred.
export const PROJECTS_FIGURE = "900+";
export const PROJECTS_ZH = "900多";
