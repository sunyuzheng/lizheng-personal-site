# English resources on guest pages

Guest identity, page slugs, featured videos, episode order, and social links remain owned by `kedaibiao-content-tools/guests.json`. The English article resource list is owned by Superlinear's `english-community-strategy/guest-insights-2026-09-15/website/guest-insights.json`.

This site stores a generated deployment snapshot in `shared/guest-insights-snapshot.ts`. It associates published articles with existing guest slugs without duplicating the roster or full Substack body. The shared selector supplies the browser card, the prerendered readable fallback, and `Article` entries in guest `ProfilePage` structured data.

## Refresh

```sh
GUEST_INSIGHTS_MANIFEST=/path/to/owner/website/guest-insights.json pnpm sync:guest-insights
pnpm check
pnpm build
```

The sync rejects unpublished records, unknown guest slugs, duplicate article IDs, non-Substack destinations, missing text, and sources that are not mapped to that guest. Circle articles must include the guest’s real `primary_url` in `sourceUrls`. Only add a new article after its actual published URL has been recorded and reviewed. Adding content to this local source or running sync does not authorize deployment.

## Local draft review

```sh
GUEST_INSIGHTS_REVIEW_DIR=/path/to/guest-insights-2026-09-15 pnpm exec vite --host 127.0.0.1 --port 8875 --strictPort
```

Open `/guests/zhou-nan?insightReview=1` or `/guests/jinjing-liang?insightReview=1`. The Vite serve-only plugin reads `website/pending-insights.json` and exposes those two Markdown drafts through exact local routes. The browser requests draft records only in development mode and only with the review query present. Drafts, local URLs, and article bodies are absent from production output, prerendered metadata, and sitemap.

The review plugin can resolve an existing node_modules symlink for isolated worktrees; this grants local Vite access only to that dependency directory. It never serves arbitrary files from the content owner.

## Current scope

The initial resource snapshot contains 21 already-published Conversations articles. Their existing titles and subtitles supply the card copy. These are thematic selections, not claims that every source interview has received a complete English summary.

Both new articles remain local previews until their actual Substack publication is verified.

## Circle-backed guest pages

Guest identity and interview source stay in upstream `guests.json`. The Circle source variant has `primary_source_type: "circle"`, `primary_video_id: null`, empty `all_video_ids`, a real Superlinear URL, separate recording/publication dates, and no fabricated views. The site’s generated roster snapshot includes that entry; native UI and prerendering use the same source model.

For Jinjing Liang, `/guests/jinjing-liang` links to `https://www.superlinear.academy/c/recording/orca`. `/guest-media/jinjing-liang.png` is an unchanged original interview still. The pending English article is available only with the opt-in local review environment and `?insightReview=1`. Its planned Substack URL is not a production link until publication is verified.
