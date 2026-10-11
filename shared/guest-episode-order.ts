import type { GuestEpisode } from "./guest-data";

export function compareGuestEpisodesByViews(a: GuestEpisode, b: GuestEpisode): number {
  const viewsA = a.viewCount ?? -1;
  const viewsB = b.viewCount ?? -1;
  if (viewsA !== viewsB) return viewsB - viewsA;
  const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  if (dateA !== dateB) return dateB - dateA;
  return a.index - b.index;
}
