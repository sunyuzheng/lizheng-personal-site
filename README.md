# lizheng.ai

Personal website of Yuzheng Sun (孙煜征) — AI educator, founder of [Superlinear Academy](https://www.superlinear.academy), author of 《真本事》.

**Live site:** [lizheng.ai](https://lizheng.ai)

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 + Shadcn UI
- **Routing:** Wouter (client-side SPA + 125 prerendered guest pages)
- **Backend:** Express (production static serving) + Vercel Edge Function (AI chat)
- **Deployment:** Vercel

## Local Development

```bash
pnpm install
pnpm dev        # → http://localhost:3000
```

## Project Structure

```
client/src/pages/    ← Home, Guests, GuestDetail, ZhenbenShi (book), NotFound
client/public/       ← Static assets (avatars, book cover, profile photo)
shared/              ← Data shared between client and server
server/              ← Express server for production
api/                 ← Vercel Edge Function (AI chat endpoint)
scripts/             ← Guest data sync and prerender scripts
docs/                ← Guest data maintenance guide
```

See `QUICK_START.md` for common update tasks and deployment details.
