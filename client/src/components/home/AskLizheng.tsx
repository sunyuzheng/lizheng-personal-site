import type { Lang } from "@/contexts/LanguageContext";
import { HOME_COPY, LINKS } from "./content";
import { EXTERNAL, Phrases } from "./parts";
import SiteSearch from "./SiteSearch";

export default function AskLizheng({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].writing.ask;
  return (
    <>
      <div className="lz-ask rv grain">
        <div className="lz-ask-intro">
          <h3>{t.title}</h3>
          <p className="lz-ask-body">{t.body}</p>
          <a className="btn btn-ivory" href={LINKS.askLizheng} {...EXTERNAL}>
            {t.cta} <span aria-hidden="true">↗</span>
          </a>
          <p className="lz-ask-note">{t.note}</p>
        </div>
        <div className="lz-ask-examples">
          <p>{t.examplesLabel}</p>
          <ul>
            {t.examples.map(question => (
              <li key={question}>
                <Phrases text={question} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <details className="lz-ask-archive rv">
        <summary>{t.searchLabel}</summary>
        <SiteSearch lang={lang} />
      </details>
    </>
  );
}
