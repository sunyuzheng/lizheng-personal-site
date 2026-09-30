import type { Lang } from "@/contexts/LanguageContext";
import CityField from "./CityField";
import { HOME_COPY, LINKS, SECTION } from "./content";
import { EXTERNAL, Lines, RichText } from "./parts";

/** Superlinear Academy as a city: one dot for every member. */
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
        <CityField lang={lang} copy={t.field} />
        <div className="city-join rv">
          <a className="btn btn-ivory" href={LINKS.community} {...EXTERNAL}>
            {t.field.join} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
