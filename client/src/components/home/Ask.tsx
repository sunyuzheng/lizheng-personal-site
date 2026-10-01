import type { Lang } from "@/contexts/LanguageContext";
import AskLizheng from "./AskLizheng";
import { HOME_COPY, SECTION } from "./content";

/**
 * Ask Lizheng as its own chapter, after the writing it draws on. The
 * component's head doubles as the section head (see .ask in home.css).
 */
export default function Ask({ lang }: { lang: Lang }) {
  return (
    <section className="sec ask" id={SECTION.ask}>
      <div className="wrap">
        <div className="eyebrow rv">{HOME_COPY[lang].ask.eyebrow}</div>
        <AskLizheng lang={lang} />
      </div>
    </section>
  );
}
