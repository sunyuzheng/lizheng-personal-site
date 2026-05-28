import LanguageToggle from "@/components/LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";

const books = {
  en: [
    {
      id: "growth",
      label: "English book",
      title: "Growth Data Analytics Playbook",
      subtitle: "Data, growth, experimentation, and product judgment.",
      description:
        "A practical playbook for using analytics to understand growth, product-market fit, and the operating loops behind better product decisions.",
      meta: ["WSJ CIO recommended", "English", "Data analytics"],
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
      subtitle: "Career agency, capability building, and compounding work.",
      description:
        "A Chinese book about turning work, learning, side projects, and AI-era judgment into a durable personal asset.",
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
      subtitle: "数据、增长、实验和产品判断。",
      description:
        "这本书把增长、产品市场匹配、实验和数据分析放进同一套工作框架，讲的是如何用 analytics 改进真实产品决策。",
      meta: ["WSJ CIO 推荐", "英文", "数据分析"],
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
      subtitle: "职业主动性、能力建设和可复利的工作。",
      description:
        "这本书讲如何把工作能力、认知方式、副业实验和 AI 时代的行动系统，变成长期可复利的个人资产。",
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
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function Books() {
  const { lang } = useLanguage();

  useEffect(() => {
    return applyPageSeo({
      title: lang === "en" ? "Books · Yuzheng Sun" : "两本书 · 课代表立正",
      description:
        lang === "en"
          ? "Books by Yuzheng Sun: Growth Data Analytics Playbook and 真本事：从会工作到会赚钱."
          : "孙煜征的两本书：英文 Growth Data Analytics Playbook 与中文《真本事：从会工作到会赚钱》。",
      canonical: "https://www.lizheng.ai/book",
    });
  }, [lang]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,191,36,0.08)_0%,rgba(11,15,26,0)_24rem),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:100%_100%,72px_72px,72px_72px]" />

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <Link
            href="/"
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
          <div className="flex items-center gap-3">
            <LanguageToggle size="sm" />
            <Button
              asChild
              size="sm"
              className="bg-amber-400 text-[#211300] hover:bg-amber-300"
            >
              <Link href="/guests">
                {lang === "en" ? "Guests" : "嘉宾"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
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
                ? "Two books, one long-running question: how judgment becomes leverage."
                : "两本书，一个问题：判断如何变成杠杆。"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              {lang === "en"
                ? "One book is written for the data and growth world. The other is written for Chinese professionals trying to turn work into a compounding asset."
                : "一本写给数据和增长世界，一本写给中文职场人。它们共享同一个问题，只是落在不同语境里。"}
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
              href="/"
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
