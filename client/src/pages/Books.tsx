import {
  FLP_AMAZON_URL,
  FLP_READ_URL,
  GROWTH_BOOK_AMAZON_URL,
  GROWTH_BOOK_ZH_PATH,
} from "@shared/book-links";
import { GROWTH_BOOK_AUTHORS } from "@shared/book-authors";
import SiteFooter from "@/components/site/SiteFooter";
import FoundingBooksLink from "@/components/FoundingBooksLink";
import SiteHeader from "@/components/site/SiteHeader";
import { Phrases } from "@/components/home/parts";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { BOOKS_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildBooksStructuredData } from "@shared/structured-data";

const books = {
  en: [
    {
      id: "flp",
      label: "English book",
      title: "Feels Like Progress",
      subtitle: "What will last when AI can blow it all up?",
      description:
        "Fake work produces the evidence of work. Fake learning produces the evidence of learning. AI can now produce both in a minute or two: first it will inflate fake work, then destroy much of what that evidence was worth. A book of ideas about what will last.",
      meta: [
        "Superlinear Press · 2026",
        "Paperback and Kindle",
        "ISBN 9798982282002",
      ],
      primary: {
        label: "View on Amazon",
        href: FLP_AMAZON_URL,
        external: true,
      },
      secondary: {
        label: "Read the opening free",
        href: FLP_READ_URL,
        external: true,
      },
    },
    {
      id: "growth",
      label: "English book",
      title: "Growth Data Analytics Playbook",
      subtitle: "What makes a product grow?",
      description:
        "A practical guide to product-market fit, growth accounting, metrics, retention, and experimentation—written for people making real product decisions.",
      meta: [
        "Featured in the 2025 WSJ CIO Journal reading list",
        "Statsig · 2025",
        "ISBN 9781544549828",
      ],
      primary: {
        label: "View on Amazon",
        href: GROWTH_BOOK_AMAZON_URL,
        external: true,
      },
      secondary: {
        label: "Free Chinese edition",
        href: GROWTH_BOOK_ZH_PATH,
        external: false,
        page: true,
      },
    },
    {
      id: "zbs",
      label: "Chinese book",
      // The English title Feels Like Progress uses for it; the Chinese name sits beside it.
      title: "Real Stuff",
      subtitle: "How does capability become income?",
      description:
        "A Chinese book about taking back agency at work, building capability through practice, and learning how value becomes income.",
      meta: [
        "Posts & Telecom Press · 2026",
        "ISBN 9787115690500",
        "In Chinese",
      ],
      primary: {
        label: "Read the book page",
        href: "/zbs",
        external: false,
      },
      secondary: {
        label: "WeRead",
        href: "https://weread.qq.com/book-detail?type=1&senderVid=4500358&v=33c32d30813abb4d6g0122ff",
        external: true,
      },
    },
  ],
  zh: [
    {
      id: "flp",
      label: "英文书",
      title: "Feels Like Progress",
      subtitle: "假工作、假学习，AI来了以后什么还留得下来？",
      description:
        "一本讲理念的书。假工作产出的是做过事的证据，假学习产出的是学会了的证据；AI现在一两分钟就能把两样都做出来，先把假工作吹大，再让这些证据大幅贬值。书讲的是什么会留下来。",
      meta: ["Superlinear Press · 2026", "平装和Kindle电子书", "英文"],
      primary: {
        label: "在Amazon查看",
        href: FLP_AMAZON_URL,
        external: true,
      },
      secondary: {
        label: "免费读开头",
        href: FLP_READ_URL,
        external: true,
      },
    },
    {
      id: "growth",
      label: "英文书 · 有免费中文版",
      title: "Growth Data Analytics Playbook",
      subtitle: "产品为什么增长？",
      description:
        "一本写给数据科学家、产品经理和创始人的实战书，讨论产品市场匹配、增长核算、留存、指标与实验。中文版完整重写，保留全部图表和练习，可以免费在线读，也可以下载EPUB和PDF。",
      meta: [
        "入选《华尔街日报》CIO Journal 2025年书单",
        "Statsig · 2025",
        "ISBN 9781544549828",
      ],
      primary: {
        label: "免费读中文版",
        href: GROWTH_BOOK_ZH_PATH,
        external: false,
        page: true,
      },
      secondary: {
        label: "在Amazon查看英文版",
        href: GROWTH_BOOK_AMAZON_URL,
        external: true,
      },
    },
    {
      id: "zbs",
      label: "中文书",
      title: "真本事：从会工作到会赚钱",
      subtitle: "本事怎样变成收入？",
      description:
        "这本书讨论怎样拿回工作的主动权，在实践里练出本事，并逐步弄懂自己的价值如何变成收入。",
      meta: ["人民邮电出版社 · 2026", "ISBN 9787115690500", "中文"],
      primary: {
        label: "进入《真本事》页面",
        href: "/zbs",
        external: false,
      },
      secondary: {
        label: "微信读书",
        href: "https://weread.qq.com/book-detail?type=1&senderVid=4500358&v=33c32d30813abb4d6g0122ff",
        external: true,
      },
    },
  ],
};

const COVERS = {
  flp: {
    src: "/home/books/feels-like-progress.webp",
    alt: "Feels Like Progress",
    width: 460,
    height: 736,
  },
  zbs: {
    src: "/home/books/zhenbenshi.webp",
    alt: "《真本事：从会工作到会赚钱》",
    width: 460,
    height: 652,
  },
  growth: {
    src: "/home/books/gdap.webp",
    alt: "Growth Data Analytics Playbook",
    width: 460,
    height: 711,
  },
} as const;

function SmartLink({
  href,
  external,
  page,
  children,
  className,
}: {
  href: string;
  external: boolean;
  // A static page outside the React app (the Chinese edition): load it instead of routing.
  page?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { lang } = useLanguage();

  if (page) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={withLanguage(href, lang)} className={className}>
      {children}
    </Link>
  );
}

export default function Books() {
  const { lang } = useLanguage();

  useEffect(() => {
    const meta = BOOKS_PAGE_META[lang];
    return applyPageSeo({
      ...meta,
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternates: languageAlternates(
        BOOKS_PAGE_META.en.canonical,
        BOOKS_PAGE_META.zh.canonical
      ),
      jsonLd: buildBooksStructuredData(lang, meta.canonical),
    });
  }, [lang]);

  return (
    <div
      className={lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="book" />

      <main>
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow">{lang === "en" ? "Books" : "书"}</div>
            <h1>
              {lang === "en" ? (
                "Three books. Three questions."
              ) : (
                <>
                  <span className="phrase">三本书，</span>
                  <span className="phrase">回答三个问题。</span>
                </>
              )}
            </h1>
          </div>
        </section>

        {/* The homepage's shelf, complete: the three covers on one line, the newest a size larger;
            under each, the question it answers, its facts, and where to get it. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="shelf full">
              {books[lang].map(book => {
                const cover = COVERS[book.id as keyof typeof COVERS];
                const primaryPage = "page" in book.primary && book.primary.page;
                return (
                  <article
                    key={book.id}
                    id={
                      book.id === "growth"
                        ? "growth-data-analytics-playbook"
                        : book.id
                    }
                    className={book.id === "flp" ? "book feature" : "book"}
                  >
                    <SmartLink
                      href={book.primary.href}
                      external={book.primary.external}
                      page={primaryPage}
                      className="stand"
                    >
                      <img
                        className="cover"
                        src={cover.src}
                        alt={cover.alt}
                        width={cover.width}
                        height={cover.height}
                        loading="eager"
                        decoding="async"
                      />
                    </SmartLink>

                    <div className="about">
                      <div className="meta">{book.label}</div>
                      <h2 lang={book.id === "zbs" ? undefined : "en"}>
                        <SmartLink
                          href={book.primary.href}
                          external={book.primary.external}
                          page={primaryPage}
                        >
                          {book.id === "zbs" && lang === "en" ? (
                            <>
                              {book.title}{" "}
                              <span lang="zh-CN" className="zh-name">
                                真本事
                              </span>
                            </>
                          ) : book.id === "zbs" ? (
                            <>
                              真本事：
                              <span className="phrase">从会工作到会赚钱</span>
                            </>
                          ) : (
                            book.title
                          )}
                        </SmartLink>
                      </h2>
                      {/* Chinese lines break after punctuation, not inside a word (Phrases). */}
                      <p className="question">
                        <Phrases text={book.subtitle} />
                      </p>
                      <p>{book.description}</p>
                      {book.id === "growth" && (
                        <p className="authors">
                          {lang === "en" ? "By " : "作者："}
                          {GROWTH_BOOK_AUTHORS.map((author, i) => (
                            <span key={author.id}>
                              {i > 0 && " · "}
                              <a
                                href={author.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {lang === "zh" && author.name === "Yuzheng Sun"
                                  ? "孙煜征（Yuzheng Sun）"
                                  : author.name}
                              </a>
                            </span>
                          ))}
                        </p>
                      )}

                      <ul className="facts">
                        {book.meta.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>

                      <div className="ways">
                        <SmartLink
                          href={book.primary.href}
                          external={book.primary.external}
                          page={primaryPage}
                          className="btn btn-green"
                        >
                          {book.primary.label}
                        </SmartLink>
                        {book.secondary ? (
                          <SmartLink
                            href={book.secondary.href}
                            external={book.secondary.external}
                            page={
                              "page" in book.secondary && book.secondary.page
                            }
                            className="lz-link"
                          >
                            {book.secondary.label} <i aria-hidden="true">→</i>
                          </SmartLink>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <FoundingBooksLink lang={lang} className="member-line" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
