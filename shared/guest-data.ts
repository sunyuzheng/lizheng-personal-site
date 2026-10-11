import { guestCatalog, guestArticleCatalog } from "./guest-catalog-snapshot";
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
}

export async function fetchGuestDirectory(): Promise<GuestProfile[]> {
  return catalogGuestDirectory(guestCatalog, guestArticleCatalog);
}

export function getGuestsPageMeta(guests: GuestProfile[]): PageMeta {
  const totalGuests = guests.length;
  const uniqueProgrammes = new Set(guests.flatMap(guest => guest.episodes.map(episode => episode.url))).size;
  return {
    title: `嘉宾与对谈 · 课代表立正 — ${totalGuests}个嘉宾档案，${uniqueProgrammes}期节目`,
    description: `课代表立正的嘉宾与对谈资料库：${totalGuests}个嘉宾档案，${uniqueProgrammes}期节目，可按嘉宾、人物别名或话题查找。`,
    canonical: `${SITE_URL}/guests`,
    ogImage: `${SITE_URL}/yuzheng-sun-headshot.jpg`,
  };
}

export function getGuestPageMeta(guest: GuestProfile): PageMeta {
  const companyAndTitle = truncateMetaText(
    [guest.guest_company, guest.guest_title].filter(Boolean).join(" · "),
    52
  );
  const leadTitle = guest.primary_episode?.title
    ? truncateMetaText(guest.primary_episode.title, 56)
    : "";
  const identity = `${guest.guest_name}${companyAndTitle ? `，${companyAndTitle}` : ""}`;
  const description = `${identity}。在「课代表立正」的${guest.episode_count}期对谈中，包括《${leadTitle || guest.primary_episode.title}》。`;

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
