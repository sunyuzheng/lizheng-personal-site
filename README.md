# lizheng.ai

The personal website and public profile of Yuzheng Sun (孙煜征 / 课代表立正).

The site is organized around one defining idea shared by Yuzheng and Superlinear Academy: **MAKE WHAT LASTS. / 做出你的代表作。** Yuzheng named and publicly advocates the idea, places his own work under its standard, and has chosen to build Superlinear for the long term. The site shows the work and leaves the verdict to others and to time.

The site connects that belief to the intellectual foundations Yuzheng has actually developed and taught, and to the public choices and work that make the commitment inspectable. [AI Builders](https://ai-builders.com), the [Stay Superlinear membership](https://stay.superlinear.academy), enterprise programs, books, tools, and public conversations show different parts of the work; they are not separate personal themes or competing homepages. The public meaning lives in `yuzheng-profile/THESIS.md`; its institutional application within Superlinear lives in `course-marketing-system/00_strategy/superlinear-brand-platform.md`.

**Live site:** [www.lizheng.ai](https://www.lizheng.ai)

## Public Content Model

- **Homepage:** the defining idea, the exemplary makers and works that set its horizon, the choices and work that make Yuzheng a credible steward of it, one inspectable dated judgment, Superlinear as the long-term wager, conversations, books, and an invitation back to the visitor's own work.
- **AI Builders:** a long-term learning system, co-taught with Yage, that turns understanding across models, engineering, products, and organizations into capability learners can practice, correct, and transfer.
- **Stay Superlinear membership:** the paid year-round content and practitioner environment.
- **Superlinear Academy:** the open, free learning and builder community.
- **Collaboration:** separate paths for organization work and podcast / creator invitations.
- **Deck index:** a curated, searchable view of enterprise AI programs, briefings, and selected public workshops at `/decks` (Chinese) and `/en/decks` (English); each deck remains owned by its original delivery project.
- **Guest archive:** the complete conversation directory; the homepage carries the smaller, selected network signal.

See [`docs/content-system.md`](docs/content-system.md) for ownership, fact sources, and maintenance rules.

Current local review materials:

- [`docs/personal-site-brand-plan-2026-08-01.md`](docs/personal-site-brand-plan-2026-08-01.md): homepage job, emotional sequence, authority pattern, and implementation decisions
- [`docs/social-bios-2026-08-01.md`](docs/social-bios-2026-08-01.md): platform-specific signatures and bios ready to paste after review

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 + Shadcn UI
- **Routing:** Wouter (client-side SPA + build-time prerendering for books, guests, and collaboration pages)
- **API:** Vercel Edge Function for the optional 《真本事》 AI advisor
- **Deployment:** static Vite output on Vercel; the Express bundle is retained for non-Vercel Node hosting
- **Verification:** GitHub Actions runs the type check and production build on pull requests and `main`

## Local Development

```bash
pnpm install
pnpm dev        # → http://localhost:3000
```

## Project Structure

```
client/src/pages/    ← Home, books, deck index, guest archive, collaboration pages, NotFound
client/public/       ← Static assets (avatars, book cover, profile photo)
shared/              ← Canonical page metadata, public deck index, and deployed guest snapshots
server/              ← Optional Express static host
api/                 ← Vercel Edge Function (AI chat endpoint)
scripts/             ← Guest sync and static-page prerender scripts
docs/                ← Content system, narrative, and guest maintenance guides
```

See `QUICK_START.md` for common update tasks and deployment details.
