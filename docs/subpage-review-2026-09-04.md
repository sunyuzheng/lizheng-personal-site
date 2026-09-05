# September 4 subpage review

Status: local/staging revision, awaiting review of the final preview and diff before production publication. The separately approved insight-first homepage was published as `7608bcbe0ebeb7bd48ab0e29eba586483468bb16`.

## Decision

Visitors should understand what Yuzheng works on, find the material relevant to them, and judge the quality from the work and other people's experience. The homepage carries the shared conviction; subpages provide depth or a clear next action without repeating the whole personal thesis.

## Changes

- **Homepage:** two short AI Builders learner reviews sit beside the course context. OpenAI and Anthropic are legible attribution, not a promotional heading. The longer Wei Manfredi and Liu Jia education quotations move unchanged to About; the Vijaye Raji book quotation stays on the homepage. This increases specificity without adding a wall of testimonials.
- **About, both languages:** first-person introduction, clearer name hierarchy, shorter current-work descriptions, and retained career facts and full philosophy. The education quotations accompany the Academy context.
- **Books, both languages:** “Two books. Two questions.” distinguishes product growth from turning capability into income. The official titles, covers, publication evidence and purchase/read destinations remain.
- **Cooperation, both languages:** the opening asks what needs to change in the team's work. Procurement choices, price and delivery boundaries stay intact. Creator collaboration removes a repeated biography from the opening but retains the host kit and evidence.
- **Deck index, both languages:** an early link opens the searchable library, a redundant philosophy section is removed, and the real training scene remains. No private material or additional deck is indexed.
- **Guest directory and details:** search includes episode titles; the heading becomes a direct invitation to browse conversations. The 126 guest records and attribution remain intact.
- **Podcast, book detail, speaker invitation and 404:** shorter Podcast opening, corrected Chinese About route, consistent public membership destination, accessible icon names, a main landmark for the book page, and language-aware return-home navigation.
- **Enterprise training and independent presentation content:** review and test; no change to pricing, scope, lessons, cases, or product commitments.
- **AIE presentation rendering:** emit the existing static CSS as raw style text, so server rendering does not turn the CSS child selector into an HTML entity and trigger a first-load hydration error. Slide content and layout rules are unchanged.

## Review provenance

Shuyang's and EZ's reviews come from the existing approved AI Builders review materials and public Maven course page, not newly requested testimonials. Chinese excerpts use the approved translations. The two relocated educational quotations preserve the previously published wording, roles and attribution in both languages.

## Verification and publication

Check TypeScript, production prerendering, desktop/mobile layouts, image loading, anchors, language navigation, search, canonical/hreflang and existing presentation links. The preview and full Git diff are the publication payload. Do not publish a new wording or price under a previous approval.
