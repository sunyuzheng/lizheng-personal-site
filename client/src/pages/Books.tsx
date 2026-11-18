import {
  FLP_AMAZON_URL,
  FLP_READ_URL,
  GROWTH_BOOK_AMAZON_URL,
  GROWTH_BOOK_ZH_PATH,
  WHITE_LYU_AMAZON_URL,
} from "@shared/book-links";
import { GROWTH_BOOK_AUTHORS } from "@shared/book-authors";
import SiteFooter from "@/components/site/SiteFooter";
import FoundingBooksLink from "@/components/FoundingBooksLink";
import SiteHeader from "@/components/site/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { BOOKS_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildBooksStructuredData } from "@shared/structured-data";

const books = {
  en: [
    {
      id: "flp",
      title: "Feels Like Progress",
      description:
        "At Facebook I wrote a 36-page analysis. A junior engineer read it all and came by the next day to ask what to do next. I had no answer. That report took real effort. What happens to the value of a report like it when AI can produce one in minutes?",
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
      title: "Growth Data Analytics Playbook",
      description:
        "A master sommelier can find a wine for a stranger over dinner. When a friend of one of the authors tried selling wine online, he lost the conversation that made him good at it. We open the book with his problem. As a product grows, how do you keep getting to know the people using it?",
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
      // The English title Feels Like Progress uses for it; the Chinese name sits beside it.
      title: "Real Stuff",
      description:
        "On a work trip in the US, I stopped at a McDonald’s hiring sign and found myself weighing that job against my own. The hourly wage was right there on the sign. What was it worth to go home after a shift and leave work behind? That scene opens my Chinese book about work, freedom, and earning a living.",
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
      title: "Feels Like Progress",
      description:
        "我在Facebook写过一份36页的分析。一位年轻工程师从头读到尾，第二天来问我，看完这些，他接下来该做什么？我答不上来。那份报告花了我很多工夫。等AI也能在几分钟里写出一份像样的报告，我们怎么知道自己做的事有用？",
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
      title: "Growth Data Analytics Playbook",
      description:
        "我们从一位侍酒大师讲起。在餐厅，他跟客人聊上几句，就知道该推荐哪瓶酒。等他上网开店，隔着屏幕，那几句闲聊也消失了。产品做大时，创始人同样会失去对用户的感觉。我们写这本书，讲怎么用留存、增长核算和实验把这种感觉找回来。",
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
      title: "真本事：从会工作到会赚钱",
      description:
        "在美国出差时，我看到麦当劳门口招人的牌子，竟然认真比较起那份工作和我自己的工作。牌子上写着时薪。下班以后能放下手机、不用盯着企业微信，这件事又值多少钱？我把这段经历写进了序言，接着谈一个人怎样练出本事，靠它挣钱，也给自己多一种选择。",
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

const specimens = {
  flp: {
    src: "/home/books/flp-prologue.webp",
    zh: {
      alt: "英文书序言The Prize首页",
      caption: "Feels Like Progress · 序言 The Prize",
    },
    en: {
      alt: "The opening page of the prologue, The Prize",
      caption: "Feels Like Progress · Opening page of The Prize",
    },
  },
  growth: {
    src: "/book/growth-data-analytics-playbook/images/ch01-sommelier.webp",
    zh: {
      alt: "手持酒杯，背后是一排酒瓶的书中插画",
      caption: "中文版第一章 · 侍酒师的故事",
    },
    en: {
      alt: "A book illustration of a hand holding a wine glass",
      caption: "Chapter one · Illustration from the Chinese edition",
    },
  },
  zbs: {
    src: "/home/books/mcdonalds-sign-2022-10-26.webp",
    zh: {
      alt: "麦当劳门外的招聘牌",
      caption: "2022年10月 · 西雅图附近，作者摄",
    },
    en: {
      alt: "A McDonald’s hiring sign",
      caption: "Near Seattle, October 2022 · Author’s photograph",
    },
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

function BookViewer({
  initial,
  onClose,
}: {
  initial: number;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const [index, setIndex] = useState(initial);
  const dialog = useRef<HTMLDialogElement>(null);
  const book = books[lang][index];
  const id = book.id as keyof typeof COVERS;
  const specimen = specimens[id];
  const read =
    id === "flp" || (id === "growth" && !zh) ? book.secondary : book.primary;

  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => {
      if (node?.open) node.close();
    };
  }, []);

  return (
    <dialog
      className="book-viewer"
      ref={dialog}
      aria-labelledby="viewer-title"
      onClose={event => {
        if (!event.currentTarget.open) onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <div className="viewer-body">
        <div className="viewer-bar">
          <span>
            {book.id === "growth"
              ? GROWTH_BOOK_AUTHORS.map(author =>
                  zh && author.name === "Yuzheng Sun" ? "孙煜征" : author.name
                ).join(" · ")
              : zh
                ? "孙煜征 著"
                : "Yuzheng Sun"}
          </span>
          <button
            type="button"
            className="viewer-close"
            onClick={() => dialog.current?.close()}
            autoFocus
            aria-label={
              zh ? "合上书，返回书架" : "Close book and return to shelf"
            }
          >
            ×
          </button>
        </div>
        <div className={`viewer-leaves viewer-${id}`} key={id}>
          <figure className="viewer-plate">
            <img
              className="viewer-art"
              src={specimen.src}
              alt={specimen[lang].alt}
            />
            <span className="viewer-board" aria-hidden="true">
              <img src={COVERS[id].src} alt="" />
            </span>
            <figcaption>{specimen[lang].caption}</figcaption>
          </figure>
          <div className="viewer-story">
            <h2 id="viewer-title" lang={id === "zbs" && zh ? "zh-CN" : "en"}>
              {book.title}
            </h2>
            <p>{book.description}</p>
            <SmartLink {...read} className="viewer-read">
              {read.label}
            </SmartLink>
          </div>
        </div>
        <div className="viewer-nav">
          <span aria-live="polite">
            {zh ? "我的著作与合著" : "Authored & co-authored"} · {index + 1} /{" "}
            {books[lang].length}
          </span>
          <button
            type="button"
            onClick={() => setIndex((index + 1) % books[lang].length)}
          >
            {zh ? "翻下一本" : "Next book"} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function Books() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const [inside, setInside] = useState(false);
  const [openBook, setOpenBook] = useState<number | null>(null);

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
      className={
        lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"
      }
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="book" />

      <main className="book-room">
        <section className="book-desk">
          <div className="wrap desk-inner">
            <div className="desk-intro">
              <h1>{zh ? "书与出版" : "Books & publishing"}</h1>
              <p>
                {zh
                  ? "第一本英文书，我和两位同行写产品增长。后来，我们自己出版了《Feels Like Progress》，也为吕白做了《从零开始做内容》的英文版。"
                  : "My first book in English was a growth handbook I wrote with two colleagues. We went on to publish Feels Like Progress ourselves, then brought White Lyu’s book on making content to readers in English."}
              </p>
              <a className="desk-press-link" href="#superlinear-press">
                {zh
                  ? "看Superlinear Press的出版故事"
                  : "The story of Superlinear Press"}
              </a>
            </div>
            <div className="desk-display">
              <nav
                className="desk-shelf"
                aria-label={zh ? "选择一本著作" : "Choose a book"}
              >
                {books[lang].map((book, index) => {
                  const cover = COVERS[book.id as keyof typeof COVERS];
                  return (
                    <a
                      className={`desk-volume volume-${book.id}`}
                      key={book.id}
                      aria-haspopup="dialog"
                      onPointerMove={event => {
                        if (
                          event.pointerType !== "mouse" ||
                          window.matchMedia("(prefers-reduced-motion: reduce)")
                            .matches
                        )
                          return;
                        const cover = event.currentTarget;
                        const bounds = cover.getBoundingClientRect();
                        const across = Math.max(
                          0,
                          Math.min(
                            1,
                            (event.clientX - bounds.left) / bounds.width
                          )
                        );
                        cover.style.setProperty(
                          "--light-position",
                          `${across * 100}%`
                        );
                        cover.style.setProperty(
                          "--cover-turn",
                          `${across * 10 - 5}deg`
                        );
                      }}
                      aria-label={
                        zh ? `翻开《${book.title}》` : `Open ${book.title}`
                      }
                      onClick={event => {
                        if (
                          event.ctrlKey ||
                          event.metaKey ||
                          event.shiftKey ||
                          event.altKey ||
                          typeof HTMLDialogElement === "undefined" ||
                          !HTMLDialogElement.prototype.showModal
                        )
                          return;
                        event.preventDefault();
                        setOpenBook(index);
                      }}
                      href={
                        book.id === "growth"
                          ? "#growth-data-analytics-playbook"
                          : `#${book.id}`
                      }
                    >
                      <span className="book-block">
                        <img
                          src={cover.src}
                          alt={cover.alt}
                          width={cover.width}
                          height={cover.height}
                        />
                      </span>
                    </a>
                  );
                })}
              </nav>
              <p className="shelf-hint">
                {zh ? "点一本书，翻开看看" : "Choose a cover to open the book"}
              </p>
            </div>
          </div>
        </section>

        <div className="wrap reading-list">
          {books[lang].map(book => {
            const specimen = specimens[book.id as keyof typeof specimens];
            const isGrowth = book.id === "growth";
            const [first, second] =
              book.id === "flp"
                ? [book.secondary, book.primary]
                : [book.primary, book.secondary];
            return (
              <article
                key={book.id}
                id={isGrowth ? "growth-data-analytics-playbook" : book.id}
                className={`reading-spread spread-${book.id}`}
              >
                <figure className="reading-figure">
                  <div className="specimen">
                    <img
                      src={specimen.src}
                      alt={specimen[lang].alt}
                      loading="lazy"
                    />
                  </div>
                  <figcaption>{specimen[lang].caption}</figcaption>
                </figure>
                <div className="reading-copy">
                  <div className="book-credit">
                    {isGrowth
                      ? GROWTH_BOOK_AUTHORS.map((a, i) => (
                          <span key={a.id}>
                            {i > 0 && " · "}
                            <a
                              href={a.linkedin}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {zh && a.name === "Yuzheng Sun"
                                ? "孙煜征"
                                : a.name}
                            </a>
                          </span>
                        ))
                      : zh
                        ? "孙煜征 著"
                        : "Yuzheng Sun"}
                  </div>
                  <h2 lang={book.id === "zbs" && zh ? "zh-CN" : "en"}>
                    {book.title}
                    {book.id === "zbs" && !zh && (
                      <small lang="zh-CN"> 真本事</small>
                    )}
                  </h2>
                  <p>{book.description}</p>
                  <div className="book-actions">
                    <SmartLink {...first} className="reading-primary">
                      {first.label}
                    </SmartLink>
                    <SmartLink {...second}>{second.label}</SmartLink>
                  </div>
                  <div className="book-imprint">
                    {book.meta.join(" · ")}
                    {isGrowth && (
                      <>
                        <br />
                        {zh
                          ? "中文版全文免费在线读。创始会员可下载EPUB和PDF。"
                          : "Read the full Chinese edition free online. Founding Members can download the EPUB and PDF."}
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          <FoundingBooksLink lang={lang} className="book-members" />
        </div>

        <section id="superlinear-press" className="press-story">
          <div className="wrap">
            <div className="press-heading">
              <h2 lang="en">Superlinear Press</h2>
              <p>
                {zh
                  ? "从自己出书，到出版别人的书"
                  : "From publishing our own work to publishing another author"}
              </p>
            </div>
            <div className="press-spread">
              <figure className="press-photos">
                <div className="press-print">
                  <img
                    key={inside ? "inside" : "cover"}
                    src={
                      inside
                        ? "/home/books/white-lyu-open.webp"
                        : "/home/books/white-lyu-books.webp"
                    }
                    width="1200"
                    height="675"
                    loading="lazy"
                    alt={
                      inside
                        ? zh
                          ? "翻开的英文版第九章，Write a Line That Stays"
                          : "The open ninth chapter, Write a Line That Stays"
                        : zh
                          ? "木桌上的三册《从零开始做内容》英文版"
                          : "Three printed copies of White Lyu’s English edition on a wooden table"
                    }
                  />
                </div>
                <figcaption>
                  <div
                    className="press-photo-controls"
                    role="group"
                    aria-label={
                      zh ? "查看英文版实物" : "Explore the printed edition"
                    }
                  >
                    <button
                      type="button"
                      aria-pressed={!inside}
                      onClick={() => setInside(false)}
                    >
                      {zh ? "实物封面" : "Printed cover"}
                    </button>
                    <button
                      type="button"
                      aria-pressed={inside}
                      onClick={() => setInside(true)}
                    >
                      {zh ? "翻到第九章" : "Open chapter nine"}
                    </button>
                  </div>
                  <span aria-live="polite">
                    {inside
                      ? "Write a Line That Stays"
                      : zh
                        ? "2026年英文版"
                        : "2026 English edition"}
                  </span>
                </figcaption>
              </figure>
              <div className="reading-copy">
                <div className="book-credit">
                  {zh
                    ? "吕白（White Lyu）著 · Superlinear Press出版"
                    : "By White Lyu · Published by Superlinear Press"}
                </div>
                <h3 id="white-lyu" lang="en">
                  Content Creation from Zero to One
                </h3>
                <p>
                  {zh
                    ? "合写增长手册时，我跟着Scribe Media走了一遍改稿、做封面、申请书号的流程。自己出版《Feels Like Progress》后，我们留下了一份《出书经验》。轮到吕白的英文版，Codex照着这份笔记做排版、填上架资料。这是我们的出版社第一次为另一位作者出书。"
                    : "Working with Scribe Media on the growth handbook, I got to see a book through editing, cover design, and ISBN registration. After publishing Feels Like Progress ourselves, we kept notes on the whole process. Codex used them to lay out White Lyu’s English edition and prepare its listing. It was the first book our press published for another author."}
                </p>
                <p>
                  {zh
                    ? "吕白带着一群新人做小红书，让他们找出500篇爆款，分组拆选题、标题和开头。英文稿有一版删减过头，把这类案例的来龙去脉也删短了。我们把细节补回来，又把整本英文稿译回中文，方便吕白核对自己的意思。"
                    : "One English draft cut outdated platform rules and trimmed the stories along with them. The details mattered, including how Lyu’s new team studied 500 popular RedNote posts. We restored the cases and translated the English manuscript back into Chinese so he could check the meaning."}
                </p>
                <div className="book-actions">
                  <a
                    className="reading-primary"
                    href={WHITE_LYU_AMAZON_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {zh ? "在Amazon看英文版" : "View the English edition"}
                  </a>
                  <a
                    href="https://www.superlinear.academy/c/recording/lvbai-one-sword-marketing-compounding"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {zh ? "看我和吕白的对谈" : "Watch our conversation (中文)"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {openBook !== null && (
          <BookViewer initial={openBook} onClose={() => setOpenBook(null)} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
