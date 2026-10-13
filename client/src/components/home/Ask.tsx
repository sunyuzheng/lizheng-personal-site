import { SocialIcon } from "@/components/site/social";
import type { Lang } from "@/contexts/LanguageContext";
import AskLizheng from "./AskLizheng";
import { HOME_COPY, SECTION } from "./content";
import { Arrow, EXTERNAL } from "./parts";

/**
 * Ask Lizheng as its own chapter, right after the academy: the one thing on
 * the page a visitor can use at once, before the conversations and writing it
 * answers from. The component's head (eyebrow, title, two sentences) doubles as
 * the section head (see .ask in home.css). The open corpus it answers from is
 * one line for anyone who wants to build their own: on wide screens it fills
 * the space under the question box, beside the taller list; otherwise it
 * closes the chapter.
 */
export default function Ask({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].ask;
  return (
    <section className="sec ask" id={SECTION.ask}>
      <div className="wrap">
        <AskLizheng lang={lang}>
          <a className="open-context" href={t.openContext.href} {...EXTERNAL}>
            <SocialIcon id="github" className="gh" />
            <div>
              <b>{t.openContext.title}</b>
              <p>{t.openContext.body}</p>
            </div>
            <span className="go lz-link">
              {t.openContext.cta} <Arrow />
            </span>
          </a>
        </AskLizheng>
      </div>
    </section>
  );
}
