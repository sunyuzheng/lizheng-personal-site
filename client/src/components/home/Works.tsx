import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import { HOME_COPY, LINKS, SECTION } from "./content";
import { Arrow, EXTERNAL, Lines, Phrases } from "./parts";

/**
 * The books chapter (its id stays "works" for older links). The show has its
 * own chapter (the conversations) and Superlinear Academy is the city, so this
 * chapter holds only the books. The newest, Feels Like Progress, takes the
 * first row; it links to its own page on makewhatlasts.com.
 */
export default function Works({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].works;

  const flp = (
    <a
      key="flp"
      className="card c-book feature rv"
      href={LINKS.flpRead}
      {...EXTERNAL}
    >
      <img
        className="cover"
        src="/home/books/feels-like-progress.webp"
        alt={t.flp.alt}
        width={460}
        height={736}
        loading="lazy"
        decoding="async"
      />
      <div>
        <div className="meta">{t.flp.meta}</div>
        <h3 lang="en">{t.flp.title}</h3>
        <p>{t.flp.body}</p>
        <span className="go lz-link">
          {t.flp.go} <Arrow />
        </span>
      </div>
    </a>
  );

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
        <span className="go lz-link">
          {t.zbs.go} <Arrow />
        </span>
      </div>
    </Link>
  );

  const growth = (
    <a
      key="growth"
      className="card c-book rv"
      // Chinese readers get the free Chinese edition on this site; English readers the book on Amazon.
      href={lang === "zh" ? LINKS.growthBookZh : LINKS.growthBook}
      {...(lang === "zh" ? {} : EXTERNAL)}
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
        <span className="go lz-link">
          {t.growth.go} <Arrow />
        </span>
      </div>
    </a>
  );

  // The newest book first. Then Chinese readers meet 真本事, English readers the English book.
  const books = lang === "zh" ? [flp, zbs, growth] : [flp, growth, zbs];

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
          <p>
            <Phrases text={t.intro} />
          </p>
        </div>
        <div className="bento">{books}</div>
      </div>
    </section>
  );
}
