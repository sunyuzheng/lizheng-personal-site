# lizheng.ai

The personal website and public profile of Yuzheng Sun (孙煜征 / 课代表立正).

The site is organized around one defining idea shared by Yuzheng and Superlinear Academy: **MAKE WHAT LASTS. / 做出你的代表作。** Yuzheng is the idea's author, practitioner, and public representative. Superlinear is his defining work in progress and the institution he is building so more people can pursue work of their own.

Judgment, craft, reality, and what deserves to be preserved explain how Yuzheng practices that belief. [AI Builders](https://ai-builders.com), the [Stay Superlinear membership](https://stay.superlinear.academy), enterprise programs, books, tools, and public conversations show different parts of the work; they are not separate personal themes or competing homepages. The canonical meaning and use hierarchy live in `course-marketing-system/00_strategy/superlinear-brand-platform.md`.

**Live site:** [www.lizheng.ai](https://www.lizheng.ai)

## Public Content Model

- **Homepage:** the defining idea, the choices and work that make Yuzheng a credible representative of it, one inspectable dated judgment, Superlinear as its institutional expression, conversations, books, and an invitation back to the visitor's own work.
- **AI Builders:** a long-term learning system, co-taught with Yage, that turns understanding across models, engineering, products, and organizations into capability learners can practice, correct, and transfer.
- **Stay Superlinear membership:** the paid year-round content and practitioner environment.
- **Superlinear Academy:** the open, free learning and builder community.
- **Collaboration:** separate paths for organization work and podcast / creator invitations.
- **Guest archive:** the complete conversation directory; the homepage carries the smaller, selected network signal.

See [`docs/content-system.md`](docs/content-system.md) for ownership, fact sources, and maintenance rules.

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
client/src/pages/    ← Home, books, guest archive, collaboration pages, NotFound
client/public/       ← Static assets (avatars, book cover, profile photo)
shared/              ← Canonical page metadata and deployed guest snapshots
server/              ← Optional Express static host
api/                 ← Vercel Edge Function (AI chat endpoint)
scripts/             ← Guest sync and static-page prerender scripts
docs/                ← Content system, narrative, and guest maintenance guides
```

See `QUICK_START.md` for common update tasks and deployment details.
