# Guests maintenance

Guest facts and published reading links are maintained in [Open Context](https://github.com/sunyuzheng/lizheng-open-context). Read [the data flow](guest-data.md) for the source contract.

## Page behavior

`/guests` lists canonical profiles. `/guests/:slug` displays the selected featured programme, all associated programmes, social links and companion reading. Old slugs open the canonical profile.

The featured programme is an explicit editorial choice. Programmes are listed newest first, with their date and stored view count; dates use UTC. Introductions quoted from a programme are labelled 节目中的介绍 with that programme and year, in the page, its description and its crawler HTML; the catalog line without a source is labelled 简介. Community resources are separate from programme counts. Historical programme introductions retain their context. Structured data uses Person for people and Thing for groups or virtual characters.

## Update and verify

1. Update and validate Open Context's catalog and release manifest, then push its main.
2. `.github/workflows/sync-guests.yml` regenerates the snapshot and pin from that release within half an hour, checks and builds them, and commits them to main; run it on demand from GitHub Actions to go sooner. A manual refresh (`guest-data.md`) remains for local work.
3. Vercel deploys the commit.
5. Verify the changed canonical pages, old links, featured programme, episode order, reading links and structured data on the live site.

Page code lives in `client/src/pages/Guests.tsx` and `GuestDetail.tsx`; shared selectors in `shared/guest-data.ts` and `guest-insights.ts`; static output in `scripts/prerender-guests.ts`. Generated snapshots are replaced by the sync command.
