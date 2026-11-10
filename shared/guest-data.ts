import { guestCatalog, guestArticleCatalog, guestNameTable } from "./guest-catalog-snapshot";
import { catalogGuestDirectory } from "./guest-catalog";
import type { PageMeta } from "./page-meta";
import type { GuestEntityType } from "./guest-identity";

export const SITE_URL = "https://www.lizheng.ai";
// Public guest metadata is derived only from the pinned Open Context catalog.

export interface GuestCommunityResource {
  kind: "guest_post" | "student_resource" | "event";
  title: string;
  url: string;
  summary: string;
  author?: string;
}

export interface GuestEpisode {
  videoId: string | null;
  sourceType: "youtube" | "circle";
  url: string;
  title: string;
  thumbnailUrl: string;
  publishedAt?: string;
  viewCount?: number;
  isPrimary: boolean;
  index: number;
}

export interface GuestPersonLink { name: string; en_name?: string; slug?: string }
/** An introduction a programme gave, with the programme it comes from. */
export interface GuestQuotedIntroduction { text: string; quote: string; title: string; url: string; year?: number }

export interface GuestProfile {
  entity_id: string;
  entity_type: GuestEntityType;
  aliases: readonly string[];
  alias_slugs: readonly string[];
  guest_name: string;
  guest_en_name: string;
  guest_title: string;
  guest_company: string;
  xiaohongshu_url?: string;
  linkedin_url?: string;
  primary_video_id: string | null;
  primary_source_type: "youtube" | "circle";
  interview_date?: string;
  guest_bio?: string;
  guest_bio_en?: string;
  max_views: number | null;
  thumbnail_url: string;
  primary_url: string;
  episode_count: number;
  all_video_ids: string[];
  all_urls: string[];
  slug: string;
  share_url: string;
  episodes: GuestEpisode[];
  primary_episode: GuestEpisode;
  youtube_playlist_url?: string;
  community_resources?: readonly GuestCommunityResource[];
  /** Further names that find this profile (from Open Context's name table). */
  search_names: string[];
  /** A group's members; slug when the member has their own page. */
  members?: GuestPersonLink[];
  /** Groups this person appeared in. */
  member_of?: GuestPersonLink[];
  /** Introductions quoted from the programmes' transcripts, newest first. */
  introductions?: GuestQuotedIntroduction[];
  first_year?: number;
  last_year?: number;
}

export async function fetchGuestDirectory(): Promise<GuestProfile[]> {
  return catalogGuestDirectory(guestCatalog, guestArticleCatalog, guestNameTable);
}

/** "2020" or "2020–2025": the years of a guest's programmes. */
export function guestYears(guest: Pick<GuestProfile, "first_year" | "last_year">): string {
  if (!guest.first_year || !guest.last_year) return "";
  return guest.first_year === guest.last_year ? `${guest.first_year}` : `${guest.first_year}–${guest.last_year}`;
}

/** How the programmes introduced the guest, at the time; the site never states it as a current title. */
export function guestIntro(guest: Pick<GuestProfile, "guest_company" | "guest_title">): string {
  return [guest.guest_company, guest.guest_title].filter(Boolean).join(" · ");
}

/**
 * The line under a guest's name in the directory: the catalog's profile line, or, for a guest who
 * has none yet (a new guest may be published before one is written), what their newest programme
 * said about them. Empty when there is neither.
 */
export function guestLine(guest: Pick<GuestProfile, "guest_company" | "guest_title" | "introductions">): string {
  return guestIntro(guest) || guest.introductions?.[0]?.text || "";
}

/** Ask Lizheng opened on 从哪读起 with this guest's name in the box (not sent). */
export function guestAskLink(guest: Pick<GuestProfile, "guest_name">): string {
  return `https://ask.lizheng.ai/?${new URLSearchParams({ q: guest.guest_name, mode: "find" })}`;
}

export function getGuestsPageMeta(guests: GuestProfile[]): PageMeta {
  const totalGuests = guests.length;
  const uniqueProgrammes = new Set(guests.flatMap(guest => guest.episodes.map(episode => episode.url))).size;
  return {
    title: `嘉宾与对谈 · 课代表立正 — ${totalGuests}位嘉宾，${uniqueProgrammes}个视频`,
    description: `课代表立正的嘉宾与对谈：${totalGuests}位嘉宾、${uniqueProgrammes}个视频，可按名字、公司或话题查找。`,
    canonical: `${SITE_URL}/guests`,
    ogImage: `${SITE_URL}/yuzheng-sun-headshot.jpg`,
  };
}

/** "2024年《标题》" — which programme an introduction comes from. */
export function introductionSource(intro: Pick<GuestQuotedIntroduction, "title" | "year">, lang: "en" | "zh" = "zh"): string {
  const title = intro.title.length > 28 ? `${intro.title.slice(0, 27).trimEnd()}…` : intro.title;
  return lang === "en" ? `${intro.year ? `${intro.year}, ` : ""}“${title}”` : `${intro.year ? `${intro.year}年` : ""}《${title}》`;
}

export function getGuestPageMeta(guest: GuestProfile): PageMeta {
  const latest = guest.introductions?.[0];
  const about = truncateMetaText(guestIntro(guest), 48);
  const leadTitle = guest.primary_episode?.title
    ? truncateMetaText(guest.primary_episode.title, 56)
    : "";
  const years = guestYears(guest);
  // The catalog's line is an "about"; an introduction is labelled as the programme's own, with its year,
  // so a search result never presents either as a current job.
  const quoted = latest ? `${latest.year ? `${latest.year}年` : ""}节目中的介绍：${truncateMetaText(latest.text, 52)}。` : "";
  const lead = leadTitle || guest.primary_episode.title;
  // One recording is often several videos (a full version, parts, clips), so the page counts videos.
  const programmes = guest.episode_count === 1
    ? `${guest.guest_name}在「课代表立正」的对谈${years ? `（${years}）` : ""}：《${lead}》。`
    : `${guest.guest_name}在「课代表立正」的对谈，共${guest.episode_count}个视频${years ? `（${years}）` : ""}，包括《${lead}》。`;
  const description = `${programmes}${about ? `简介：${about}。` : ""}${quoted}`;

  return {
    title: `${guest.guest_name} · 课代表立正`,
    description,
    canonical: guest.share_url,
    ogImage: new URL(
      guest.primary_episode.thumbnailUrl || guest.thumbnail_url,
      SITE_URL
    ).href,
  };
}

function truncateMetaText(value: string, maxLength: number): string {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1).trimEnd()}…`
    : value;
}
