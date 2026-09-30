import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY, SECTION } from "./content";
import { EXTERNAL, Lines } from "./parts";

/** The three ways into Superlinear Academy, plus the enterprise line. */
export default function Join({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].join;

  return (
    <section className="sec city join grain" id={SECTION.join}>
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

        <div className="paths">
          {t.paths.map(path => (
            <div
              key={path.title}
              className={path.main ? "path main rv" : "path rv"}
            >
              <div className="t">{path.kind}</div>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
              <div className="s">
                {path.stats.map(([value, label]) => (
                  <span key={label}>
                    <b>{value}</b>
                    {label}
                  </span>
                ))}
              </div>
              <div className="act">
                {path.main ? (
                  <a className="btn btn-green" href={path.href} {...EXTERNAL}>
                    {path.cta}
                  </a>
                ) : (
                  <a className="lnk" href={path.href} {...EXTERNAL}>
                    {path.cta} <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="ent rv" id={SECTION.enterprise}>
          <figure className="ent-photo">
            <img
              src={t.enterprise.photo.src}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div>
            <p className="desc">
              <b>{t.enterprise.title}</b>
              <span>{t.enterprise.body}</span>
              <span className="price">
                {t.enterprise.price[0]}
                <b>{t.enterprise.price[1]}</b>
              </span>
            </p>
            <p className="note">{t.enterprise.photo.caption}</p>
          </div>
          <Link href={withLanguage("/collab/enterprise", lang)}>
            {t.enterprise.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
