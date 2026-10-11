import type { Lang } from "@/contexts/LanguageContext";
import CityWindow from "./CityWindow";
import { HOME_COPY, LINKS, SECTION } from "./content";
import { EXTERNAL, Lines, RichText } from "./parts";

/**
 * Superlinear Academy as a city: a window onto city.lizheng.ai, where
 * every member is a light and their comments and likes are the lines between
 * them (the dot map where that cannot be drawn).
 */
export default function City({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].city;

  return (
    <section className="sec city grain" id={SECTION.academy}>
      <div className="wrap">
        <div className="head rv">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2>
              <Lines lines={t.title} />
            </h2>
          </div>
          <p>
            <RichText value={t.intro} />
          </p>
        </div>
        <CityWindow
          lang={lang}
          copy={t.field}
          view={t.window}
          action={
            <div className="city-actions">
              <a
                className="city-explore"
                href={lang === "en" ? LINKS.connectionsEn : LINKS.connections}
              >
                {t.window.enter} <span aria-hidden="true">↗</span>
              </a>
              <a
                className="btn btn-ivory city-join"
                href={LINKS.community}
                {...EXTERNAL}
              >
                {t.field.join} <span aria-hidden="true">→</span>
              </a>
            </div>
          }
        />
      </div>
    </section>
  );
}
