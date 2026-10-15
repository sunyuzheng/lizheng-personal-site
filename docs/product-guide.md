# Products and resources guide

The public guide lives at `/for-agents` and `/en/for-agents`. It explains the relationship between Yuzheng Sun, Superlinear Academy, its free community, AI Builders, Stay Superlinear, and enterprise programs. It is a selection and source-discovery page for readers and their AI assistants.

## Ownership

- `shared/product-guide.ts`: bilingual product summaries, dated prices and access, metadata, and the CollectionPage / unordered ItemList structured data.
- `client/src/pages/ProductGuide.tsx`: visible identity, product comparison, course/membership overlap, and public source links.
- `client/src/pages/product-guide.css`: existing personal-site design tokens and responsive layout; imported by `client/src/index.css` so Node prerendering does not import CSS.
- The shared navigation, sitemap, and `llms.txt` link to both language versions. Both pages use the existing complete React prerender pipeline. No JavaScript is required to read their content.

This page is a consumer of existing product facts. It does not own pricing, membership entitlements, checkout, product positioning, or the free community's access rules. Updates here do not authorize changes in those systems.

## Sources checked on 2026-10-15

| Subject | Canonical owner / evidence |
| --- | --- |
| Identity and product family | `yuzheng-profile/ECOSYSTEM.md`; personal site's About and `shared/structured-data.ts` |
| AI Builders audience, curriculum, access, price and refund | `course-marketing-system/01_offers/ai-builders-2027-offer.md`; https://ai-builders.com/ |
| AI Builders USD and CNY checkout | Reopened both live Circle checkout pages in the browser: $1,048 / ¥7,145; four courses with lifetime access and updates, 12 months of Stay, AI Builders and AI Architect in Chinese and English, 14-day refund |
| Stay price, access and standalone membership | `stay-superlinear-membership/docs/10-fact-sheet.md` and current README; https://stay.superlinear.academy/ and `/join/` |
| Free community entry and participation | `superlinear-academy-onboarding/README.md`; https://www.superlinear.academy/community |
| Enterprise scope and planning price | This site's `EnterpriseTraining.tsx` and https://www.lizheng.ai/collab/enterprise |
| Public corpus, authorship and reuse | https://github.com/sunyuzheng/lizheng-open-context (README and per-item licenses) |
| AI answers with original citations | https://www.lizheng.ai/ask |

No authenticated account details or payment data are included in the guide or its evidence files.

## Maintenance

When a product owner changes prices, access duration, course languages, renewal terms, or product boundaries, review both language entries here. Reopen the official product and checkout pages before a commercial update is published. Advance `GUIDE_REVIEWED_AT` only after an actual check; it also supplies the guide's `dateModified` and sitemap date. Prices remain a dated summary; the visible guide links to the official product pages and states where current purchase terms are confirmed.

Keep source attribution separate from synthesized AI answers: articles and conversations retain their author/speaker, date, and source; Ask Lizheng and derived context point back to original material. This page grants no new content reuse rights.

## Validation

Run `pnpm check` and `pnpm build`. Inspect the emitted `dist/public/for-agents/index.html` and `dist/public/en/for-agents/index.html` without executing JavaScript: each must contain the complete localized guide, a unique h1, its own canonical, reciprocal language links, valid JSON-LD, and links to all four official destinations. Check both URLs in the sitemap and `llms.txt`, language switching, section links, desktop/mobile layout, and browser console errors.

Local preview note: Vite preview can serve the homepage fallback for extensionless directory routes, which produces a misleading hydration error (the same occurs for the existing `/about` page). Use a static preview server that internally resolves `/for-agents` to `/for-agents/index.html`, matching the existing Vercel filesystem routing, or inspect the trailing-slash preview URL. Production uses the established `cleanUrls` directory-index pattern; no new Vercel route is required.
