import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY, LINKS, SECTION } from "./content";
import { Arrow, EXTERNAL, Lines, Phrases, SectionLink } from "./parts";

/**
 * Selected work: the show and the two books. Superlinear Academy, the largest
 * work, follows as its own section (the community map), and dated essays sit
 * with the public calls, so nothing here repeats another section.
 */
export default function Works({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].works;

  const zbs = (
    <Link
      key="zbs"
      className="card c-book rv"
      href={withLanguage("/zbs", lang)}
    >
      <img
        className="cover"
        src="/home/books/zhenbenshi.webp"
        alt={t.zbs.alt}
        width={460}
        height={652}
        loading="lazy"
        decoding="async"
      />
      <div>
        <div className="meta">{t.zbs.meta}</div>
        <h3 lang={lang === "en" ? "zh-CN" : undefined}>
          <Phrases text={t.zbs.title} />
        </h3>
        <p>{t.zbs.body}</p>
        <span className="go">
          {t.zbs.go} <Arrow />
        </span>
      </div>
    </Link>
  );

  const growth = (
    <a
      key="growth"
      className="card c-book rv"
      href={LINKS.growthBook}
      {...EXTERNAL}
    >
      <img
        className="cover"
        src="/home/books/gdap.webp"
        alt={t.growth.alt}
        width={460}
        height={711}
        loading="lazy"
        decoding="async"
      />
      <div>
        <div className="meta">{t.growth.meta}</div>
        <h3>{t.growth.title}</h3>
        <p>{t.growth.body}</p>
        <span className="go">
          {t.growth.go} <Arrow />
        </span>
      </div>
    </a>
  );

  // Chinese readers meet 真本事 first; English readers meet the English book.
  const books = lang === "zh" ? [zbs, growth] : [growth, zbs];

  return (
    <section className="sec works" id={SECTION.works}>
      <span id={SECTION.books} className="anchor" aria-hidden="true" />
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
        <div className="bento">
          <div className="card c-show rv">
            <a
              className="photo"
              href={t.show.photo.href}
              aria-label={`${t.show.photo.label}${lang === "en" ? ": " : "："}${t.show.photo.caption}`}
              {...EXTERNAL}
            >
              <img
                src={t.show.photo.src}
                alt={t.show.photo.alt}
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
              />
              <span className="play" aria-hidden="true" />
              <span className="caption">{t.show.photo.caption}</span>
            </a>
            <div className="body">
              <div className="meta">{t.show.meta}</div>
              <h3>
                <SectionLink to={SECTION.talks}>
                  <Phrases text={t.show.title} />
                </SectionLink>
              </h3>
              <p>{t.show.body}</p>
              <SectionLink className="go" to={SECTION.talks}>
                {t.show.go} <Arrow />
              </SectionLink>
            </div>
          </div>
          {books}
        </div>
      </div>
    </section>
  );
}
