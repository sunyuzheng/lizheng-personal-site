import { guestInsightSnapshot } from "./guest-insights-snapshot";

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
  return guestInsightSnapshot.filter(article => article.guestSlug === slug);
}
