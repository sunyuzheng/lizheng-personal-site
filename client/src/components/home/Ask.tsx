import { SocialIcon } from "@/components/site/social";
import type { Lang } from "@/contexts/LanguageContext";
import AskLizheng from "./AskLizheng";
import { HOME_COPY, SECTION } from "./content";
import { EXTERNAL } from "./parts";

/**
 * Ask Lizheng as its own chapter, after the writing it draws on. The
 * component's head doubles as the section head (see .ask in home.css). The
 * open corpus it answers from closes the chapter, for anyone who wants to
 * build their own.
 */
export default function Ask({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].ask;
  return (
    <section className="sec ask" id={SECTION.ask}>
      <div className="wrap">
        <div className="eyebrow rv">{t.eyebrow}</div>
        <AskLizheng lang={lang} />
        <a className="open-context rv" href={t.openContext.href} {...EXTERNAL}>
          <SocialIcon id="github" className="gh" />
          <div>
            <b>{t.openContext.title}</b>
            <p>{t.openContext.body}</p>
          </div>
          <span className="go">
            {t.openContext.cta} <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </section>
  );
}
