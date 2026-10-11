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

export function guestIntroLabel(guest: Pick<GuestProfile, "first_year" | "last_year">, lang: "en" | "zh"): string {
  const years = guestYears(guest);
  return lang === "en" ? `As introduced in the programmes${years ? `, ${years}` : ""}` : `${years ? `${years}年` : ""}节目中的介绍`;
}

/** Ask Lizheng opened on 从哪读起 with this guest's name in the box (not sent). */
export function guestAskLink(guest: Pick<GuestProfile, "guest_name">): string {
  return `https://ask.lizheng.ai/?${new URLSearchParams({ q: guest.guest_name, mode: "find" })}`;
}

export function getGuestsPageMeta(guests: GuestProfile[]): PageMeta {
  const totalGuests = guests.length;
  const uniqueProgrammes = new Set(guests.flatMap(guest => guest.episodes.map(episode => episode.url))).size;
  return {
    title: `嘉宾与对谈 · 课代表立正 — ${totalGuests}位嘉宾，${uniqueProgrammes}期对谈`,
    description: `课代表立正的嘉宾与对谈：${totalGuests}位嘉宾、${uniqueProgrammes}期对谈，可按名字、公司或话题查找。`,
    canonical: `${SITE_URL}/guests`,
    ogImage: `${SITE_URL}/yuzheng-sun-headshot.jpg`,
  };
}

export function getGuestPageMeta(guest: GuestProfile): PageMeta {
  const intro = truncateMetaText(guestIntro(guest), 52);
  const leadTitle = guest.primary_episode?.title
    ? truncateMetaText(guest.primary_episode.title, 56)
    : "";
  const years = guestYears(guest);
  // The introduction is labelled as the programmes' own, so a search result never presents it as a current job.
  const description = `${guest.guest_name}在「课代表立正」的${guest.episode_count}期对谈${years ? `（${years}）` : ""}，包括《${leadTitle || guest.primary_episode.title}》。${intro ? `节目中的介绍：${intro}。` : ""}`;

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
