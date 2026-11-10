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

export const COMMUNITY_MEMBERS = COMMUNITY_MEMBER_COUNT;

/** 28,377 → "28,000+": a figure that stays true while the community grows. */
export function membersFigure(count: number = COMMUNITY_MEMBERS): string {
  return `${(Math.floor(count / 1000) * 1000).toLocaleString("en-US")}+`;
}

/** 28,377 → "2.8万"; 30,412 → "3万". For Chinese prose: 2.8万人, 2.8万成员. */
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
