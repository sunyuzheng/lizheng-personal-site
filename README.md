# lizheng.ai

The personal website and public profile of Yuzheng Sun (孙煜征 / 课代表立正).

The site is organized around one throughline: form a view, let reality test it, and turn what survives into capabilities, work, and systems that other people can use. [AI Builders](https://ai-builders.com), [Stay Superlinear](https://staysuperlinear.com), enterprise programs, books, and public conversations appear as evidence and applications of that work—not as competing homepages.

**Live site:** [www.lizheng.ai](https://www.lizheng.ai)

## Public Content Model

- **Homepage:** the personal throughline, dated judgments, current work, conversations, and books.
- **AI Builders:** the structured learning program for building with AI.
- **Stay Superlinear:** the ongoing paid membership and long-term environment.
- **Superlinear Academy:** the free community and public workshop.
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
