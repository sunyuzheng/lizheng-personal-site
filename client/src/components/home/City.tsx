import type { Lang } from "@/contexts/LanguageContext";
import CityWindow from "./CityWindow";
import { HOME_COPY, LINKS, SECTION } from "./content";
import { Arrow, EXTERNAL, Lines, Phrases, RichText } from "./parts";

/**
 * Superlinear Academy, introduced for someone who has never heard of it: what
 * it is and who is there, then what the free community holds (each opening
 * the space itself), then the city: a window onto city.lizheng.ai, where every
 * member is a light and their comments and likes are the lines between them
 * (the dot map where that cannot be drawn).
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
            <RichText value={t.intro} phrases />
          </p>
        </div>
        <ul className="city-inside" aria-label={t.insideLabel}>
          {t.inside.map(place => (
            <li key={place.title} className="rv">
              <a href={place.href} {...EXTERNAL}>
                <b>
                  {place.title} <i aria-hidden="true">→</i>
                </b>
                <span>
                  <Phrases text={place.body} />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <CityWindow
          lang={lang}
          copy={t.field}
          view={t.window}
          action={
            <div className="city-actions">
              <a
                className="lz-link"
                href={lang === "en" ? LINKS.connectionsEn : LINKS.connections}
              >
                {t.window.enter} <Arrow />
              </a>
              <a
                className="btn btn-ivory city-join"
                href={LINKS.community}
                {...EXTERNAL}
              >
                {t.field.join}
              </a>
            </div>
          }
        />
      </div>
    </section>
  );
}
