# Guests maintenance

Guest facts and published reading links are maintained in [Open Context](https://github.com/sunyuzheng/lizheng-open-context). Read [the data flow](guest-data.md) for the source contract.

## Page behavior

`/guests` lists canonical profiles. `/guests/:slug` displays the selected featured programme, all associated programmes, social links and companion reading. Old slugs open the canonical profile.

The featured programme is an explicit editorial choice. Episode grids sort by stored view-count snapshots; dates use UTC. Community resources are separate from programme counts. Historical programme introductions retain their context. Structured data uses Person for people and Thing for groups or virtual characters.

## Update and verify

1. Update and validate Open Context's catalog and release manifest.
2. Pin that release and review `pnpm sync:guests`, then apply it with `--apply`.
3. Run typecheck, guest tests and build.
4. Review the generated diff and deploy the website.
5. Verify the changed canonical pages, old links, featured programme, episode order, reading links and structured data on the live site.

Page code lives in `client/src/pages/Guests.tsx` and `GuestDetail.tsx`; shared selectors in `shared/guest-data.ts` and `guest-insights.ts`; static output in `scripts/prerender-guests.ts`. Generated snapshots are replaced by the sync command.
