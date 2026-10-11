import { guestCatalog, guestArticleCatalog } from "./guest-catalog-snapshot";

/** Article resources only. Guest identity and video membership stay upstream. */
export interface GuestInsight {
  id: string;
  guestSlug: string;
  status: "published" | "draft";
  title: string;
  summary: string;
  takeaways?: readonly string[];
  url: string;
  sourceVideoIds: readonly string[];
  sourceUrls?: readonly string[];
  readTimeMinutes?: number;
}

export function getGuestEnglishInsights(slug: string): readonly GuestInsight[] {
  const entity = guestCatalog.entities.find(e => e.slug === slug || e.alias_slugs.includes(slug));
  if (!entity) return [];
  return guestArticleCatalog.articles.filter(a => a.entity_id === entity.entity_id).map(a => ({
    id: a.id, guestSlug: a.original_guest_slug, status: "published" as const, title: a.title, summary: a.summary,
    url: a.url, sourceVideoIds: a.source_ids.filter(id => id.startsWith("youtube-")).map(id => id.slice("youtube-".length)),
    ...(a.source_urls === undefined ? {} : { sourceUrls: a.source_urls }),
    ...(a.takeaways === undefined ? {} : { takeaways: a.takeaways }),
    ...(a.read_time_minutes === undefined ? {} : { readTimeMinutes: a.read_time_minutes }),
  }));
}

/** Preserve old-slug article references while displaying each exact article URL once. */
export function unionGuestInsights(articles: readonly GuestInsight[], slugs: ReadonlySet<string>): readonly GuestInsight[] {
  const seen = new Set<string>();
  return articles.filter(article => {
    if (!slugs.has(article.guestSlug) || seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });
}
