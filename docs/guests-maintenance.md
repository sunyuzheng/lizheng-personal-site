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

## Guest appearance archive

The creator page imports `shared/guest-appearances-snapshot.ts`, generated from Open Context's `catalog/guest-appearances.jsonl`. That catalog owns dates, shows, titles, links and formats. The website's guest directory consumes only the guest entities from the shared name table; external hosts remain in the upstream name table without acquiring guest pages here.

`shared/guest-appearances-pin.json` records the source path, upstream commit, manifest/catalog/snapshot hashes and row count. A local candidate explicitly uses `source_status: local-draft`; its commit identifies the base checkout, and `catalog_matches_manifest` records whether the in-progress catalog already matches that checkout's current manifest. Draft provenance is not an immutable release pin.

```sh
# Review a local candidate; add --apply to replace its generated snapshot and pin.
pnpm sync:guest-appearances --source-root /absolute/path/to/open-context --draft
# After the upstream release is approved and committed, omit --draft.
pnpm sync:guest-appearances --source-root /absolute/path/to/open-context --apply
# Or use an exact published commit and manifest hash.
pnpm sync:guest-appearances --commit COMMIT_SHA --manifest-sha256 MANIFEST_SHA256 --apply
# Build runs this offline integrity check; supply source arguments to also check the canonical projection.
pnpm sync:guest-appearances --check
```

An unchanged display payload produces the same snapshot bytes when its draft provenance is promoted to a committed release. The sync command defaults to dry-run and does not commit, push or deploy.
