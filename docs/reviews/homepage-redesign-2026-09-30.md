# Homepage redesign and shared site shell · September 30, 2026

Status: approved by Yuzheng for publication on September 30, 2026 (homepage, subpages and the monthly community-map workflow), after a second round of homepage edits.

## Decision

The homepage speaks to a broad audience: people learning to work with AI, prospective learners, enterprise decision makers, media and partners. For many of them, the craft of the page is itself evidence, so design quality is part of the content. Deep forest-green surfaces (hero, community map and join) frame an ivory editorial middle, and each chapter has one signature moment: the 立正 seal with the portrait, the stage photograph that leads selected work, a map of the community in which every dot is a real member, and the dated record of public calls. Joining the free Superlinear Academy community stays the primary action; conversations, writing and enterprise work follow.

Subpages keep their content and adopt the same shell, palette and serif titles, so the site reads as one person's work.

## Homepage (`/` and `/zh`)

Both languages share one order: hero → career path → numbers, organizations and peer endorsements → photographs from talks and trainings → selected work → the community map → conversations → public calls → writing and site search → three ways to join → invitation → footer.

The community map follows selected work directly: after the work Yuzheng stands behind, the next question is how many people actually take part.

- **Hero.** `学点真本事，做点真东西。` / `MAKE WHAT LASTS.`, a short first-person introduction, the free-community and conversation actions, and compact icon links: 小红书, YouTube, LinkedIn, Substack, the Superlinear Academy community (the six-layer mark) and GitHub in Chinese; the same without 小红书 in English. Bilibili is no longer promoted as a follow link. The footer shows the same set, plus email and the shop.
- **Career path.** Cornell → Amazon → Meta → Tencent IEG → Statsig → Superlinear Academy. The Tencent IEG title is `增长数据科学与AI总监` / `Director, Growth Data Science & AI`, with the 30-person team, across the site. Statsig keeps the atomic phrase `OpenAI收购团队早期成员` / `early team, later acquired by OpenAI`; nothing implies employment at OpenAI or a role in the acquisition, and no career move is described as a resignation.
- **Numbers.** 400K+ followers, 200+ public conversations, 20,000+ free-community members, 3,000+ paying learners. 200+ counts conversations, not distinct guests, and the Chinese copy says so. No view counts appear anywhere on the homepage; the search index's view field only orders results.
- **Peer endorsements.** Right after the organizations, four peers vouch for specific work: Liu Jia on teaching, Wei Manfredi on the community, Vijaye Raji on Growth Data Analytics Playbook, and Dai Yusen on AI practice. Having someone as a guest shows access; an endorsement shows that people with standing trust the judgment, which is what someone referring Yuzheng needs. The homepage shows the approved excerpts from `PeerEndorsements`, each labelled with what it is about, and links to the full quotations on About.
- **Photographs.** Only rooms where Yuzheng is the one on stage: the DoorDash Analytics training, moderating the Statsig debate on experimentation and causal inference, Significance Summit × Acquired, and the Pinterest data-science talk. Photos that feature a guest rather than Yuzheng left the strip; the Amazon session with Yage moved to the enterprise line. The strip drifts slowly and can be dragged, swiped or scrolled; each photo opens where the room can be seen (the enterprise page, the debate video, the Significance Summit page, the Pinterest replay).
- **Selected work.** The show, 课代表立正 · 200+ conversations, led by the photograph of Yuzheng on the Significance Summit stage with Ben Gilbert and David Rosenthal of Acquired, then the two books, 真本事 and Growth Data Analytics Playbook. Superlinear Academy is not repeated here: it is the community map directly below. The dated essays live with the public calls.
- **Community map.** One dot per real member, sorted by posts and comments so the most active members form a bright centre. Every dot shows the member's name and opens their public Circle profile; a search box and a random-member button float over the map's empty top corners, and the caption shares its row with the call to join. A GitHub workflow takes a Circle Admin API snapshot on the 1st of each month (about 246 requests) and publishes it to Vercel Blob; the page reads it at runtime, so no deploy is needed. See [community-city.md](../community-city.md). When the map first comes into view, its lights come on from the centre (the most active members) outwards; afterwards a slow wave, a wandering light and a few twinkles keep it alive without asking for attention. The light follows the mouse and flies to a member found by search. With reduced motion the map is still.
- **Public calls.** Six dated calls, oldest first on a thin rail, each with its original record and without review statuses. Two stay open on paper cards with their key line in large type: February 2023, _The five most important questions about ChatGPT_ (written before GPT-4), and September 2026, _Jev and the AI Narrative Trap_ (to judge whether a new technology is hype, find the real benchmark: its best actual alternative), with its video in Chinese and its essay (Superlinear Academy in Chinese, Substack in English).
- **Conversations.** The guest grid, the names strip and, in Chinese, six episodes to start with, now including the conversation with Gergely Orosz of The Pragmatic Engineer. Every name in the strip opens the guest page, or the conversation when there is no page.
- **Writing and search.** Four recent essays and a lazily loaded search over essays and videos (Chinese) or essays and AI-translated talk transcripts (English, labelled as such), then a link to 立正 · Open Context, the public corpus people and AI can both read.
- **Join.** Free community, AI Builders and Stay Superlinear (`https://stay.superlinear.academy/`), plus one enterprise line with the fully custom starting price ($100,000+) and a photograph of the Amazon session with Yage.
- **Anchors.** Existing links keep working: `#hero`, `#works` (with `#books`), `#conversations`, `#judgment`, `#thinking`, `#superlinear` (the community map) and `#collaboration` (the enterprise line); `#join` is new.

Chinese copy follows the site's compact mixed writing (no spaces between Chinese and adjacent English or digits).

## Shared shell and subpages

About, Books, Collaborate, Enterprise training, Creators, the guest directory and guest pages, and the deck index now share one header (homepage sections; a More menu with About, Books, Talks & slides and Collaborate; language switch; free-community action; a mobile menu with 44px targets that closes on Escape) and one footer. Near-black and navy surfaces became the forest greens, light surfaces became ivory and paper, titles use Noto Serif SC and Source Serif 4, and prominent figures use Source Serif 4. About reuses the homepage career band. Enterprise and Creators keep a small breadcrumb back to Collaborate.

Prices, ISBNs, courses, cases, deck entries and guest records are unchanged; guest pages keep their view counts. `/zbs` keeps its own design and only its author note carries the new title. `/podcast`, `/speaker`, the AIE and 0905 decks, the design experiments and the 404 page keep their design.

## Performance

Serif fonts are self-hosted: Noto Serif SC (700 and 900, split by unicode-range so a page downloads only the slices it uses) and Source Serif 4 (variable). The font stylesheet loads without blocking first paint, and nothing loads from Google Fonts. The homepage preloads its portrait; `/collab` and `/collab/creators` keep the preload for the photograph they show. The search index loads only when the search panel approaches the viewport; the default query's results are prerendered, so the panel does not grow when the index arrives. The community map reserves the height of its caption while member data loads.

## Verification

- `pnpm check` and `pnpm build` pass, including prerendering of every static and guest page.
- The prerendered `/` and `/zh` contain the body text, `data-ssr`, canonical, hreflang and JSON-LD; the browser reports no hydration errors.
- At 1440, 1024, 390 and 320 px in both languages there is no horizontal scrolling, and Chinese titles on the changed pages do not end with a single-character line.
- Section links, the More menu, the mobile menu, Escape, language switching and the deep links `/#judgment`, `/zh#conversations`, `/zh#superlinear`, `/#join`, `/#collaboration` and `/about#endorsements` land correctly on desktop and mobile.
- With member data arriving late, nothing below the community map moves (1440, 390 and 320 px, both languages). Names on hover and tap, member search (mouse and keyboard), opening profiles, the random-member button, the fallback state and malformed data were checked against demo data.
- With reduced motion there is no parallax, count-up, marquee or reveal; the community map is always a still image.
- The main text of each changed subpage was compared with production; the only differences are the title, the About career band, breadcrumbs and removed back-to-home buttons.

## Open decisions

- Community map: add the `CIRCLE_ADMIN_API` and `BLOB_READ_WRITE_TOKEN` Actions secrets, then run the first snapshot. See [community-city.md](../community-city.md).
- Keep headline numbers (followers, community members, paying learners) up to date automatically.
- Full-text search over articles and transcripts.
- A new social sharing image based on the new hero.
