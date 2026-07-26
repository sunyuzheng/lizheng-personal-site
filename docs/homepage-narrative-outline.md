# Homepage Narrative

This is the current rationale for the homepage. It records decisions and facts, not a general writing framework.

## Job Of The Page

The homepage should make a serious visitor infer four things:

1. Yuzheng has an unusual combination of technical depth, operating experience, judgment, and reach.
2. His work has been tested in serious companies, rooms, products, and communities.
3. He is part of a high-quality network of researchers, founders, operators, investors, and builders.
4. His current work in education, community, and enterprise practice follows naturally from the career story without turning the page into a sales pitch.

The page should establish this through selected facts, scenes, peers, work, and results. It should not announce that Yuzheng is impressive or explain why every signal is impressive.

## Hero Question

English:

> AI makes building easier. My focus is studying what’s worth building.

Chinese:

> AI 让「做出来」越来越容易。我研究的是：什么值得做。

This is the current AI-facing expression of the longer personal thesis, not a service promise or a claim that implementation, reliability, adoption, or organizational change has become easy. It establishes a clear presentation hierarchy:

1. **AI makes building easier:** more ideas can reach a working form with less execution cost.
2. **Study what is worth building:** the personal focus is problem selection—who a result is for, what it should change, and why it matters.
3. **Let reality test the judgment:** users, products, experiments, organizations, and public disagreement reveal whether the choice holds up.
4. **Let useful parts compound:** what survives becomes capability, curriculum, workflows, products, books, tools, relationships, or other reusable systems.

The hero states only the first two layers. The next sections demonstrate the latter two through work and evidence rather than adding more competing slogans. AI Builders, Stay Superlinear, and enterprise work appear later as current expressions of the story; their full product arguments remain on their own sites.

## Narrative Spine

The career is not presented as six unrelated credentials.

- Economics provides the language of incentives and causal structure.
- Amazon and Meta connect models to product and business decisions.
- Leading a 30-person data and AI team at Tencent makes judgment an organizational problem.
- Statsig turns experimentation and belief-updating into infrastructure.
- AI Builders, co-taught with Yage, translates understanding from models, engineering, products, and organizations into capability another person can understand, practice, correct, and transfer. Stay Superlinear keeps work, feedback, relationships, and opportunities in motion over time; books and enterprise work carry the same throughline into public ideas and organizations.

The deeper throughline comes from the local axioms: build a better model of reality, keep conviction testable, move from users to builders, and turn what survives reality into systems that compound. The new hero is the front door into that sequence: easier building raises the value of choosing well; reality tests the choice; useful results become durable assets. These ideas support the story and its evidence hierarchy; they should not all become slogans.

## Evidence Order

1. The AI-era premise and personal question in the hero: building is becoming easier; the focus is what deserves to be built. The Acquired conversation supplies peer context without being presented as proof of the thesis.
2. Cornell / Amazon / Meta / Tencent / Statsig: where the judgment behind problem selection was formed and what each setting taught.
3. Three questions that make “worth building” concrete: what actually changed, who it is useful for, and what remains after it is built.
4. Dated public calls, led by the February 2023 essay on ChatGPT written before GPT-4: evidence that the premise about cheaper execution and the resulting judgments were stated in public.
5. AI Builders / Stay Superlinear / enterprise work: evidence that ideas become capabilities, continuing environments, and organizational practice.
6. 200+ conversations and selected guests: a source of first-hand input and network quality before follower quantity.
7. Two books and the launch photo with co-authors and Julie Zhuo: public intellectual output and peer context.
8. Community behavior and independent endorsements: repeated application and external validation.

`400K+` is current and may be stated, but it is intentionally subordinate to guest quality, audience composition, and substantive work.

## Authority By Inference

The homepage follows `show → frame → let the reader conclude`.

- A fact or scene comes first.
- The page explains only what that fact demonstrates and why it belongs there.
- The conclusion is left to the visitor.
- Every proof has one job and appears where its question naturally arises.
- Employer names establish training and operating context; they are not endorsements.
- Reach establishes distribution; it does not establish correctness.
- Dated calls establish inspectable judgment; they do not establish permanent foresight.

For this reason, the standalone statistics strip has been removed. Teaching proof now sits with AI Builders, audience proof with conversations, community proof with the community, and publication proof with the books.

## Durable Decisions

- English remains the default language by design.
- The hero is the current AI-facing entry point. The durable personal throughline remains judgment meeting reality and becoming systems that compound.
- The public community CTA still points to `https://www.superlinear.academy`; the free community remains a major proof point.
- In the Work section, AI Builders represents judgment and methods taught into reusable capability, Stay Superlinear represents a long-term environment around members' current work, and enterprise programs show the same methods being tested against real organizational goals and constraints.
- The hero's secondary CTA moves deeper into the personal story by scrolling to Work; it does not send first-time visitors directly to a product landing page.
- On desktop, keep all three participants in the Acquired scene visible by placing copy over the camera on the right. Mobile keeps the portrait crop and prioritizes copy legibility.
- The homepage curates. Complete guest, book, content, and collaboration material belongs on dedicated pages.
- Keep mobile length near 11 screens or less at a 390 x 844 viewport.
- Prefer factual captions and recognizable scenes over adjectives or self-described virtues.
- Do not feature a personal anecdote merely because it is vivid. Use it only when it proves the central identity more efficiently than the available public work does.

## Active Assets

- Hero desktop: `/hero/acquired-behind-scenes-desktop.webp`
- Hero mobile: `/hero/acquired-behind-scenes-mobile.webp`
- Enterprise work: `/english-network/doordash-ai-training.webp`
- Book launch: `/book/growth-data-launch.webp`

Current implementation: `client/src/pages/Home.tsx`.
