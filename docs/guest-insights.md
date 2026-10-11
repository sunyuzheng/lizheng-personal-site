# Companion reading on guest pages

Open Context's `catalog/guest-articles.json` maintains published article metadata and its guest/source relationships. Article writing and full published bodies remain with their publishing owners. The website displays titles, summaries and links from the shared catalog.

The guest sync generates article links together with canonical profiles. Selectors retain links associated with old guest slugs and display each exact article URL once. Browser cards, readable prerendered content and Article structured data use the same selection.

```sh
pnpm sync:guests
pnpm check
pnpm build
```

To add an article, record its actual published URL and original programme relationship in Open Context, validate, and synchronize the reviewed release.

## Local article drafts

Editorial drafts can still be previewed through the development-only guest-insights review plugin:

```sh
GUEST_INSIGHTS_REVIEW_DIR=/path/to/guest-insights pnpm exec vite --host 127.0.0.1 --port 8875 --strictPort
```

The opt-in `?insightReview=1` route renders selected local drafts. Production cards come from the published catalog.
