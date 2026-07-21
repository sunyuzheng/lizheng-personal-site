import LanguageToggle from "@/components/LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { BOOKS_PAGE_META } from "@shared/page-meta";

const books = {
  en: [
    {
      id: "growth",
      label: "English book",
      title: "Growth Data Analytics Playbook",
      subtitle:
        "From product-market fit and growth accounting to retention, metrics, and experimentation.",
      description:
        "A practical guide to product-market fit, growth accounting, metrics, retention, and experimentation—written for people making real product decisions.",
      meta: [
        "Featured in the 2025 WSJ CIO Journal reading list",
        "English",
        "Data analytics",
      ],
      primary: {
        label: "View on Amazon",
        href: "https://www.amazon.com/Growth-Data-Analytics-Playbook-Product-Market/dp/1544549822",
        external: true,
      },
    },
    {
      id: "zbs",
      label: "Chinese book",
      title: "真本事：从会工作到会赚钱",
      subtitle: "Turning work into capability, leverage, and income.",
      description:
        "A Chinese book about taking back agency at work, building capability through practice, and learning how value becomes income.",
      meta: ["人民邮电出版社", "中文", "职业与个人成长"],
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
      subtitle: "从产品市场匹配、增长核算到留存、指标与实验。",
      description:
        "一本写给数据科学家、产品经理和创始人的实战书，讨论产品市场匹配、增长核算、留存、指标与实验。",
      meta: ["入选《华尔街日报》CIO Journal 2025 年书单", "英文", "数据分析"],
      primary: {
        label: "Amazon 查看",
        href: "https://www.amazon.com/Growth-Data-Analytics-Playbook-Product-Market/dp/1544549822",
        external: true,
      },
    },
    {
      id: "zbs",
      label: "中文书",
      title: "真本事：从会工作到会赚钱",
      subtitle: "把工作变成自己的能力、杠杆和收入。",
      description:
        "这本书讨论怎样拿回工作的主动权，在实践里练出本事，并逐步弄懂自己的价值如何变成收入。",
      meta: ["人民邮电出版社", "中文", "职业与个人成长"],
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

function BookVisual({ id }: { id: string }) {
  if (id === "zbs") {
    return (
      <div className="relative mx-auto aspect-[0.705] w-full max-w-[8.75rem] overflow-hidden rounded-md border border-white/15 bg-white/[0.04] shadow-2xl shadow-black/40">
        <img
          src="/book/cover-front.png"
          alt="《真本事：从会工作到会赚钱》"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-[0.647] w-full max-w-[8.75rem] overflow-hidden rounded-md border border-white/15 bg-white/[0.04] shadow-2xl shadow-black/40">
      <img
        src="/book/growth-data-analytics-playbook.jpg"
        alt="Growth Data Analytics Playbook"
        className="h-full w-full object-cover"
        loading="eager"
      />
    </div>
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
    return applyPageSeo({
      ...BOOKS_PAGE_META[lang],
      locale: lang === "zh" ? "zh_CN" : "en_US",
    });
  }, [lang]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,191,36,0.08)_0%,rgba(11,15,26,0)_24rem),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:100%_100%,72px_72px,72px_72px]" />

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <Link
            href={withLanguage("/", lang)}
            className="flex items-center gap-2 text-zinc-400 transition hover:text-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <div>
              <div className="text-sm font-semibold text-amber-300">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
              </div>
              <div className="text-xs text-zinc-500">
                {lang === "en" ? "Books" : "两本书"}
              </div>
            </div>
          </Link>
          <LanguageToggle size="sm" />
        </div>
      </nav>

      <main className="relative z-10">
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
              {lang === "en" ? "Books" : "Books / 书"}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
              {lang === "en"
                ? "One book asks how products find direction and grow. The other asks how work becomes capability."
                : "一本讲产品怎样找到方向、推动增长；一本讲人怎样把工作变成自己的本事。"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              {lang === "en"
                ? "Growth Data Analytics Playbook is about product-market fit, metrics, and experimentation. 真本事 is about turning work into capability, leverage, and income of your own."
                : "《Growth Data Analytics Playbook》讨论产品市场匹配、指标和实验；《真本事》讨论怎样把工作变成自己的能力、杠杆和收入。"}
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {books[lang].map(book => (
              <article
                key={book.id}
                className="grid gap-8 rounded-2xl border border-white/10 bg-white/[0.045] p-5 md:grid-cols-[9.5rem_minmax(0,1fr)] md:p-7"
              >
                <BookVisual id={book.id} />

                <div className="flex min-w-0 flex-col justify-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                    {book.label}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold leading-tight text-white md:text-3xl">
                    {book.title}
                  </h2>
                  <p className="mt-3 text-base font-medium leading-7 text-zinc-300">
                    {book.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {book.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {book.meta.map(item => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-normal text-zinc-300"
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
                        "bg-amber-400 text-[#211300] hover:bg-amber-300"
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
                          "border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
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

          <div className="mt-8 flex justify-center">
            <Link
              href={withLanguage("/", lang)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {lang === "en" ? "Back to homepage" : "回到主页"}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
