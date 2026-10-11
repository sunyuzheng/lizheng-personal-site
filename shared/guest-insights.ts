import { guestInsightSnapshot } from "./guest-insights-snapshot";
import { guestIdentityOverlay } from "./guest-identity-overlay";

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
  const links = [...guestIdentityOverlay.redirects, ...guestIdentityOverlay.profile_aliases];
  const canonical = links.find(row => row.from_slug === slug)?.canonical_slug || slug;
  const slugs = new Set([canonical, ...links.filter(row => row.canonical_slug === canonical).map(row => row.from_slug)]);
  return unionGuestInsights(guestInsightSnapshot, slugs);
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
