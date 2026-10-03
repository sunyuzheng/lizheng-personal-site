import { GROWTH_BOOK_AMAZON_URL } from "@shared/book-links";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { BOOKS_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildBooksStructuredData } from "@shared/structured-data";

const books = {
  en: [
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
    },
    {
      id: "zbs",
      label: "Chinese book",
      title: "真本事：从会工作到会赚钱",
      subtitle: "How does capability become income?",
      description:
        "A Chinese book about taking back agency at work, building capability through practice, and learning how value becomes income.",
      meta: ["人民邮电出版社 · 2026", "ISBN 9787115690500", "中文"],
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
      id: "growth",
      label: "英文书",
      title: "Growth Data Analytics Playbook",
      subtitle: "产品为什么增长？",
      description:
        "一本写给数据科学家、产品经理和创始人的实战书，讨论产品市场匹配、增长核算、留存、指标与实验。",
      meta: [
        "入选《华尔街日报》CIO Journal 2025年书单",
        "Statsig · 2025",
        "ISBN 9781544549828",
      ],
      primary: {
        label: "在Amazon查看",
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

// Same treatment as the book cards in the homepage's selected work.
function BookVisual({ id }: { id: string }) {
  const cover = id === "zbs" ? COVERS.zbs : COVERS.growth;
  return (
    <img
      src={cover.src}
      alt={cover.alt}
      width={cover.width}
      height={cover.height}
      className="mx-auto w-[150px] rounded-[3px_6px_6px_3px] shadow-[0_1px_0_rgba(0,0,0,0.05),0_24px_32px_-18px_rgba(0,0,0,0.55),inset_3px_0_0_rgba(255,255,255,0.25)] transition-transform duration-500 [transform:perspective(900px)_rotateY(-10deg)] group-hover:[transform:perspective(900px)_rotateY(-2deg)] md:mx-0"
      loading="eager"
      decoding="async"
    />
  );
}

function SmartLink({
  href,
  external,
  children,
  className,
}: {
  href: string;
  external: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { lang } = useLanguage();

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
      className={cn(
        "lz-site min-h-screen overflow-x-clip bg-lz-ivory text-lz-ink",
        lang === "en" && "l-en"
      )}
    >
      <SiteHeader current="book" />

      <main>
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-medium tracking-[0.08em] text-lz-green">
              {lang === "en" ? "Books" : "书"}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.2] [text-wrap:balance] md:text-6xl">
              {lang === "en" ? (
                "Two books. Two questions."
              ) : (
                <>
                  <span className="inline-block">两本书，</span>
                  <span className="inline-block">回答两个问题。</span>
                </>
              )}
            </h1>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {books[lang].map(book => (
              <article
                key={book.id}
                className="group grid gap-8 rounded-[14px] bg-lz-paper p-6 shadow-[0_0_0_1px_var(--lz-line)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--lz-line-2),0_28px_50px_-30px_rgba(20,30,20,0.45)] md:grid-cols-[150px_minmax(0,1fr)] md:items-center md:p-8"
              >
                <BookVisual id={book.id} />

                <div className="flex min-w-0 flex-col justify-center">
                  <p className="text-[13.5px] tracking-[0.03em] text-lz-muted">
                    {book.label}
                  </p>
                  <h2 className="mt-2 text-2xl font-black leading-snug [text-wrap:balance] md:text-3xl">
                    {book.id === "zbs" ? (
                      <>
                        真本事：
                        <span className="inline-block">从会工作到会赚钱</span>
                      </>
                    ) : (
                      book.title
                    )}
                  </h2>
                  <p className="mt-3 text-base font-medium leading-7 text-lz-ink-2">
                    {book.subtitle}
                  </p>
                  <p className="mt-3 text-[15.5px] leading-7 text-lz-ink-2">
                    {book.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {book.meta.map(item => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="rounded border border-lz-line bg-lz-ivory px-2.5 py-1 text-[11px] font-normal text-lz-ink-2"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <SmartLink
                      href={book.primary.href}
                      external={book.primary.external}
                      className={cn(
                        buttonVariants(),
                        "min-h-11 rounded-[10px] bg-lz-green px-5 text-white hover:bg-superlinear-deep"
                      )}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      {book.primary.label}
                      {book.primary.external ? (
                        <ExternalLink className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowRight className="ml-2 h-4 w-4" />
                      )}
                    </SmartLink>
                    {book.secondary ? (
                      <SmartLink
                        href={book.secondary.href}
                        external={book.secondary.external}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "min-h-11 rounded-[10px] border-lz-ink/45 bg-transparent px-5 text-lz-ink hover:bg-lz-sand"
                        )}
                      >
                        {book.secondary.label}
                        {book.secondary.external ? (
                          <ExternalLink className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                      </SmartLink>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
