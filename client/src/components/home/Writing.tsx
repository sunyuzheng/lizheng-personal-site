import { SocialIcon } from "@/components/site/social";
import type { Lang } from "@/contexts/LanguageContext";
import { HOME_COPY, SECTION } from "./content";
import { EXTERNAL, Lines, Phrases } from "./parts";

export default function Writing({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].writing;
  return (
    <section className="sec writing" id={SECTION.writing}>
      <div className="wrap">
        <div className="head rv">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2>
              <Lines lines={t.title} />
            </h2>
          </div>
          <p>{t.intro}</p>
        </div>
        <ul className="essays">
          {t.essays.map(essay => (
            <li key={essay.href} className="rv">
              <a className="essay" href={essay.href} {...EXTERNAL}>
                <div className="meta">{essay.date}</div>
                <h3>
                  <Phrases text={essay.title} />
                </h3>
                <p>{essay.line}</p>
                <span className="go">
                  {t.go} <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
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
