import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGuestDirectory } from "../shared/guest-data";
import type { GuestInsight } from "../shared/guest-insights";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.env.GUEST_INSIGHTS_MANIFEST;
if (!source)
  throw new Error(
    "Set GUEST_INSIGHTS_MANIFEST to the owner's published guest-insights.json."
  );
const manifest = JSON.parse(fs.readFileSync(source, "utf8")) as {
  schemaVersion: number;
  articles: GuestInsight[];
};
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.articles)) {
  throw new Error("Unsupported guest insights manifest.");
}
const guests = new Map(
  (await fetchGuestDirectory()).map(guest => [guest.slug, guest])
);
const ids = new Set<string>();
for (const article of manifest.articles) {
  const guest = guests.get(article.guestSlug);
  if (!guest || ids.has(article.id))
    throw new Error(`Unknown guest or duplicate article: ${article.id}`);
  ids.add(article.id);
  if (article.status !== "published")
    throw new Error(`Draft must stay out of deployment: ${article.id}`);
  const url = new URL(article.url);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "yuzheng.substack.com" ||
    !url.pathname.startsWith("/p/")
  ) {
    throw new Error(`Unverified article destination: ${article.id}`);
  }
  if (!article.title.trim() || !article.summary.trim())
    throw new Error(`Incomplete article: ${article.id}`);
  if (article.sourceVideoIds.some(id => !guest.all_video_ids.includes(id))) {
    throw new Error(`Article source does not belong to guest: ${article.id}`);
  }
  if (
    article.sourceUrls?.some(url => !guest.all_urls.includes(url)) ||
    (guest.primary_source_type === "circle" &&
      !article.sourceUrls?.includes(guest.primary_url))
  ) {
    throw new Error(`Article source URL does not belong to guest: ${article.id}`);
  }
}
// Explicit public field projection keeps editorial/source notes out of the website.
const publicArticles = manifest.articles.map(article => ({
  id: article.id,
  guestSlug: article.guestSlug,
  status: article.status,
  title: article.title,
  summary: article.summary,
  ...(article.takeaways?.length ? { takeaways: article.takeaways } : {}),
  url: article.url,
  sourceVideoIds: article.sourceVideoIds,
  ...(article.sourceUrls?.length ? { sourceUrls: article.sourceUrls } : {}),
  ...(article.readTimeMinutes ? { readTimeMinutes: article.readTimeMinutes } : {}),
}));
const output = `// GENERATED from the English content owner's website/guest-insights.json.\n// Run pnpm sync:guest-insights with GUEST_INSIGHTS_MANIFEST. Do not edit by hand.\n\nexport const guestInsightSnapshot = ${JSON.stringify(publicArticles, null, 2)} as const;\n`;
fs.writeFileSync(path.join(root, "shared/guest-insights-snapshot.ts"), output);
console.log(
  `Synced ${manifest.articles.length} published English guest articles.`
);
