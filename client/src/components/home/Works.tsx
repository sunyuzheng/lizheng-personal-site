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
          <SectionLink to={SECTION.talks} className="card c-show rv">
            <figure className="photo">
              <img
                src={t.show.photo.src}
                alt={t.show.photo.alt}
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{t.show.photo.caption}</figcaption>
            </figure>
            <div className="body">
              <div className="meta">{t.show.meta}</div>
              <h3>
                <Phrases text={t.show.title} />
              </h3>
              <p>{t.show.body}</p>
              <span className="go">
                {t.show.go} <Arrow />
              </span>
            </div>
          </SectionLink>
          {books}
        </div>
      </div>
    </section>
  );
}
