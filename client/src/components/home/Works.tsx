import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link } from "wouter";
import FoundingBooksLink from "@/components/FoundingBooksLink";
import { HOME_COPY, LINKS, SECTION } from "./content";
import { Arrow, EXTERNAL, Lines, Phrases } from "./parts";

/**
 * The books chapter (its id stays "works" for older links). The show has its
 * own chapter (the conversations) and Superlinear Academy is the city, so this
 * chapter holds only the books, standing on one shelf. The newest, Feels Like
 * Progress, comes first and a size larger; it links to the book on Amazon (the
 * books page also links to its free opening on makewhatlasts.com).
 */
export default function Works({ lang }: { lang: Lang }) {
  const t = HOME_COPY[lang].works;

  const flp = (
    <a
      key="flp"
      className="book feature"
      href={LINKS.flpAmazon}
      {...EXTERNAL}
    >
      <span className="stand">
        <img
          className="cover"
          src="/home/books/feels-like-progress.webp"
          alt={t.flp.alt}
          width={460}
          height={736}
          loading="lazy"
          decoding="async"
        />
      </span>
      <div className="about">
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
    <Link key="zbs" className="book" href={withLanguage("/zbs", lang)}>
      <span className="stand">
        <img
          className="cover"
          src="/home/books/zhenbenshi.webp"
          alt={t.zbs.alt}
          width={460}
          height={652}
          loading="lazy"
          decoding="async"
        />
      </span>
      <div className="about">
        <div className="meta">{t.zbs.meta}</div>
        {lang === "en" ? (
          <h3>
            {t.zbs.title}{" "}
            <span lang="zh-CN" className="zh-name">
              真本事
            </span>
          </h3>
        ) : (
          <h3>
            <Phrases text={t.zbs.title} />
          </h3>
        )}
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
      className="book"
      // Chinese readers get the free Chinese edition on this site; English readers the book on Amazon.
      href={lang === "zh" ? LINKS.growthBookZh : LINKS.growthBook}
      {...(lang === "zh" ? {} : EXTERNAL)}
    >
      <span className="stand">
        <img
          className="cover"
          src="/home/books/gdap.webp"
          alt={t.growth.alt}
          width={460}
          height={711}
          loading="lazy"
          decoding="async"
        />
      </span>
      <div className="about">
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
        <div className="head">
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
        {/* One shelf: the three covers stand on one line, the newest a size larger, each with its
            words under it. The member line closes the chapter, as quiet as a colophon. */}
        <div className="shelf">{books}</div>
        <FoundingBooksLink
          lang={lang}
          className="mt-10 rounded-none border-x-0 border-b-0 border-t border-lz-line bg-transparent px-0 pb-0 pt-4"
        />
      </div>
    </section>
  );
}
