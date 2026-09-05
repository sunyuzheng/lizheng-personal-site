import LanguageToggle from "@/components/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ExternalLink,
  Github,
  Handshake,
  Linkedin,
  Mail,
  Menu,
  Rss,
  ShoppingBag,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { HOME_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildHomeStructuredData } from "@shared/structured-data";

const recentWriting = {
  en: [
    {
      label: "WORK & ORGANIZATIONS",
      title: "How to identify and eliminate fake work",
      detail: "Why organizations reward busyness—and what AI changes.",
      href: "https://www.superlinear.academy/c/ai-resources/fake-work",
      cta: "Read the essay",
    },
    {
      label: "AI-NATIVE TALENT",
      title: "What actually makes someone AI native?",
      detail: "Using AI is a start. Rethinking the work is the bigger change.",
      href: "https://www.superlinear.academy/c/ai-resources/ai-native",
      cta: "Read the essay",
    },
    {
      label: "NOUNS & VERBS",
      title: "Everyone learns the nouns. The verbs set people apart.",
      detail: "Knowing the tools does not tell you how to solve the problem.",
      href: "https://www.superlinear.academy/c/ai-resources/verb",
      cta: "Read the essay in Chinese",
    },
  ],
  zh: [
    {
      label: "工作与组织",
      title: "如何识别与消灭fake work",
      detail: "为什么组织会奖励忙碌，却不一定创造价值？",
      href: "https://www.superlinear.academy/c/ai-resources/fake-work",
      cta: "读文章",
    },
    {
      label: "AI NATIVE人才",
      title: "到底什么才算AI Native人才？",
      detail: "会用AI以后，一项工作应该怎样重新做？",
      href: "https://www.superlinear.academy/c/ai-resources/ai-native",
      cta: "读文章",
    },
    {
      label: "名词与动词",
      title: "为什么所有人都在学名词，但真正拉开差距的是动词",
      detail: "工具都认识了，为什么还是做不出来？",
      href: "https://www.superlinear.academy/c/ai-resources/verb",
      cta: "读文章",
    },
  ],
};

const featuredJudgment = {
  en: {
    cta: "Read the original argument and later review",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
    timeline: [
      {
        date: "APRIL 2021",
        label: "Why couldn’t the previous AI paradigm generalize?",
        links: [
          {
            label: "Why the Turing Test misses intelligence",
            href: "https://youtu.be/M2Yv3D8NDHY",
          },
          {
            label: "Which machine-learning systems actually work",
            href: "https://youtu.be/sNJ09NOqBXk",
          },
        ],
      },
      {
        date: "FEBRUARY 2023 · BEFORE GPT-4",
        label: "ChatGPT is more than a chatbot.",
        links: [
          {
            label: "Open the pre-GPT-4 public snapshot",
            href: "https://www.huxiu.com/article/812076.html",
          },
        ],
      },
    ],
  },
  zh: {
    cta: "阅读原文与后续复盘",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
    timeline: [
      {
        date: "2021年4月",
        label: ["上一代AI，", "为什么难以通用？"],
        links: [
          {
            label: "为什么图灵测试不能检测人工智能？",
            href: "https://youtu.be/M2Yv3D8NDHY",
          },
          {
            label: "什么样的机器学习真正有效？",
            href: "https://youtu.be/sNJ09NOqBXk",
          },
        ],
      },
      {
        date: "2023年2月 · GPT-4发布前",
        label: ["ChatGPT不只是", "聊天机器人。"],
        links: [
          {
            label: "查看GPT-4前公开版本",
            href: "https://www.huxiu.com/article/812076.html",
          },
        ],
      },
    ],
  },
};

const work = {
  en: [
    {
      label: "STRUCTURED LEARNING",
      title: "AI Builders 2027",
      detail:
        "Understand AI systematically, build hands-on, and keep up as it changes.",
      proof: "3,000+ paying learners · 5.0/5 on Maven",
      href: "https://ai-builders.com",
      cta: "Explore the courses",
    },
    {
      label: "YEAR-ROUND MEMBERSHIP",
      title: "Stay Superlinear",
      detail:
        "Keep learning with people working at the frontier, and bring new AI capabilities into your own work.",
      proof: "Guest masterclasses · deep analysis · monthly Q&A · Skills",
      href: "https://staysuperlinear.com",
      cta: "Explore the membership",
    },
  ],
  zh: [
    {
      label: "系统课程",
      title: "AI Builders 2027",
      detail: "想系统学懂AI、真正动手、并持续跟上变化，选AI Builders 2027。",
      proof: "3,000+付费学员 · Maven 5.0/5",
      href: "https://ai-builders.com",
      cta: "了解课程",
    },
    {
      label: "全年会员",
      title: "Stay Superlinear会员",
      detail: "和一线实践者持续深聊，把AI的新变化带回自己的工作。",
      proof: "闭门大师课 · 深度解析 · 每月答疑 · Skills",
      href: "https://staysuperlinear.com",
      cta: "了解会员",
    },
  ],
};

const enterpriseWork = {
  en: {
    label: "ENTERPRISE AI TRAINING & CUSTOM PROGRAMS",
    title: "The work should be different after the training.",
    detail:
      "For most teams, AI Builders is enough. When the work itself needs to change, we start with the roles, workflows, materials, and evaluation—then design what the team actually needs.",
    formats: "Team seats · Private cohorts · Course customization",
    priceLabel: "FULLY CUSTOM",
    price: "$100,000+",
    cta: "See enterprise formats",
    caption: "DoorDash Analytics team offsite · Seattle",
  },
  zh: {
    label: "企业AI培训与定制",
    title: "培训结束以后，工作应该真的变了。",
    detail:
      "对多数团队来说，直接采购AI Builders就够了。现成课程解决不了真实工作里的问题时，我们再和团队一起，从岗位、流程与验收开始设计。",
    formats: "团队购课 · 专属班 · 课程定制",
    priceLabel: "完整定制",
    price: "$100,000起",
    cta: "查看企业合作方式",
    caption: "DoorDash Analytics团队线下AI培训 · 西雅图",
  },
};

const selectedGuests = {
  en: [
    {
      name: "Yangqing Jia",
      role: "Co-lead, PyTorch 1.0 · Founder, Lepton AI",
      href: "/guests/yangqing-jia",
      image: "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
    },
    {
      name: "Shuchao Bi",
      role: "Head of Post-Training · Multimodal, OpenAI",
      href: "/guests/shuchao-bi",
      image: "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
    },
    {
      name: "Reynold Xin",
      role: "Co-founder, Databricks",
      href: "/guests/reynold-xin",
      image: "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
    },
    {
      name: "Vijaye Raji",
      role: "Founder, Statsig · CTO of Applications, OpenAI",
      href: "/guests/vijaye-raji",
      image: "https://img.youtube.com/vi/iw2QYZeVlOQ/hqdefault.jpg",
    },
    {
      name: "Ryo Lu",
      role: "Head of Design, Cursor",
      href: "/guests/ryo-lu",
      image: "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
    },
    {
      name: "Gergely Orosz",
      role: "Founder, The Pragmatic Engineer",
      href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
      image: "/english-network/gergely-orosz.webp",
    },
  ],
  zh: [
    {
      name: "贾扬清（Yangqing Jia）",
      role: "PyTorch 1.0共同负责人 · Lepton AI创始人",
      href: "/guests/yangqing-jia",
      image: "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
    },
    {
      name: "毕书超（Shuchao Bi）",
      role: "OpenAI Head of Post-Training · Multimodal",
      href: "/guests/shuchao-bi",
      image: "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
    },
    {
      name: "Reynold Xin",
      role: "Databricks联合创始人",
      href: "/guests/reynold-xin",
      image: "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
    },
    {
      name: "Vijaye Raji",
      role: "Statsig创始人 · OpenAI CTO of Applications",
      href: "/guests/vijaye-raji",
      image: "https://img.youtube.com/vi/iw2QYZeVlOQ/hqdefault.jpg",
    },
    {
      name: "Ryo Lu",
      role: "Cursor Head of Design",
      href: "/guests/ryo-lu",
      image: "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
    },
    {
      name: "Gergely Orosz",
      role: "The Pragmatic Engineer创始人",
      href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
      image: "/english-network/gergely-orosz.webp",
    },
  ],
};

const endorsements = {
  en: [
    {
      quote:
        "Yuzheng distills years of product growth wisdom into actionable insight—helping data scientists surface decisive signals, PMs turn numbers into strategy, and founders find a repeatable path to compounding PMF.",
      name: "Vijaye Raji",
      role: "Founder, Statsig · CTO of Applications, OpenAI",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
    {
      quote:
        "Yuzheng has built an AI education community that is carefully curated, practical, and unusually useful for people doing real work.",
      name: "Wei Manfredi",
      role: "Senior Vice President, AI & Architecture · IHG Hotels & Resorts",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "Yuzheng shares more than tools. He teaches a philosophy of thinking—the rarest and most valuable thing in the AI era. Even as a scientist, I found his course deeply illuminating.",
      name: "Liu Jia",
      role: "Chair Professor, Tsinghua University · Cognitive neuroscientist",
      avatar: "/avatars/liu-jia.jpg",
      initials: "LJ",
    },
  ],
  zh: [
    {
      quote:
        "立正把多年产品增长经验提炼成可执行的洞察：帮助数据科学家找到决定性信号、产品经理把数字变成策略，也帮助创始人找到能够持续复利的PMF路径。",
      name: "Vijaye Raji",
      role: "Statsig创始人 · OpenAI CTO of Applications",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
    {
      quote:
        "立正做的AI教育社群很少见：内容筛选认真，实战密度高，也确实贴近工作里的问题。",
      name: "Wei Manfredi",
      role: "IHG Hotels & Resorts AI与架构高级副总裁",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "立正分享的不只是工具，而是思维哲学——这才是AI时代最稀缺、最有价值的东西。他的课程让我这个科学家也深受启发。",
      name: "刘嘉",
      role: "清华大学讲席教授 ·《最强大脑》总科学顾问",
      avatar: "/avatars/liu-jia.jpg",
      initials: "刘嘉",
    },
  ],
};

function SectionLabel({
  children,
  dark = false,
}: {
  children: string;
  dark?: boolean;
}) {
  const { lang } = useLanguage();

  return (
    <p
      className={cn(
        "font-mono text-xs leading-5",
        lang === "en" ? "uppercase tracking-[0.2em]" : "tracking-[0.1em]",
        dark ? "text-superlinear-on-dark" : "text-superlinear-deep"
      )}
    >
      {children}
    </p>
  );
}

function scrollToSection(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const meta = HOME_PAGE_META[lang];
    return applyPageSeo({
      ...meta,
      type: "profile",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternates: languageAlternates(
        HOME_PAGE_META.en.canonical,
        HOME_PAGE_META.zh.canonical
      ),
      jsonLd: buildHomeStructuredData(lang, meta.canonical),
    });
  }, [lang]);

  const nav = pick(lang, {
    en: {
      thinking: "Writing",
      story: "Story",
      work: "Superlinear",
      conversations: "Conversations",
      decks: "Decks",
      books: "Books",
      shop: "Shop",
      collaborate: "Collaborate",
      community: "Free community",
    },
    zh: {
      thinking: "文章",
      story: "经历",
      work: "Superlinear",
      conversations: "对话",
      decks: "Decks",
      books: "书",
      shop: "周边店",
      collaborate: "合作",
      community: "免费社区",
    },
  });

  const closeAndScroll = (id: string) => {
    setMobileMenuOpen(false);
    window.setTimeout(() => scrollToSection(id), 0);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-lizheng-dark text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-lizheng-dark/90 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="min-h-11 text-left"
          >
            <div className="text-base font-semibold text-white">
              {lang === "en" ? "Yuzheng Sun" : "立正"}
            </div>
            <div className="text-xs text-lizheng-muted">
              {lang === "en" ? "立正 · 课代表立正" : "孙煜征 · 课代表立正"}
            </div>
          </button>

          <div className="hidden items-center gap-4 xl:flex">
            {[
              ["superlinear", nav.work],
              ["conversations", nav.conversations],
              ["story", nav.story],
              ["thinking", nav.thinking],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {label}
              </button>
            ))}
            <Link
              href={withLanguage("/decks", lang)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.decks}
            </Link>
            <Link
              href={withLanguage("/book", lang)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.books}
            </Link>
            <a
              href="https://shop.lizheng.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.shop}
            </a>
            <Link
              href={withLanguage("/collab", lang)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.collaborate}
            </Link>
            <LanguageToggle size="sm" />
            <Button
              asChild
              size="sm"
              className="h-7 gap-1.5 bg-superlinear px-2.5 text-xs text-white hover:bg-superlinear-deep has-[>svg]:px-2.5"
            >
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Users className="h-3.5 w-3.5" />
                {nav.community}
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <LanguageToggle
              size="sm"
              className="[&>a]:flex [&>a]:min-h-11 [&>a]:min-w-11 [&>a]:items-center [&>a]:justify-center xl:[&>a]:min-h-0 xl:[&>a]:min-w-0"
            />
            <button
              onClick={() => setMobileMenuOpen(value => !value)}
              className="flex size-11 items-center justify-center text-zinc-300"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="container border-t border-white/10 py-4 xl:hidden">
            <div className="grid text-sm">
              {[
                ["superlinear", nav.work],
                ["conversations", nav.conversations],
                ["story", nav.story],
                ["thinking", nav.thinking],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => closeAndScroll(id)}
                  className="flex min-h-11 items-center text-left text-zinc-300"
                >
                  {label}
                </button>
              ))}
              <Link
                href={withLanguage("/decks", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center text-zinc-300"
              >
                {nav.decks}
              </Link>
              <Link
                href={withLanguage("/book", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center text-zinc-300"
              >
                {nav.books}
              </Link>
              <a
                href="https://shop.lizheng.ai/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center text-zinc-300"
              >
                {nav.shop}
              </a>
              <Link
                href={withLanguage("/collab", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center text-zinc-300"
              >
                {nav.collaborate}
              </Link>
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center text-superlinear-on-dark"
              >
                {nav.community} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section
          id="hero"
          className="scroll-mt-[72px] border-b border-white/10 bg-lizheng-deep"
        >
          <div className="container grid gap-10 py-12 md:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
            <div className="max-w-2xl">
              <p
                className={cn(
                  "font-mono text-xs leading-5 text-superlinear-on-dark",
                  lang === "en"
                    ? "uppercase tracking-[0.2em]"
                    : "tracking-[0.1em]"
                )}
              >
                {lang === "en" ? "YUZHENG SUN · 立正" : "立正 · 孙煜征"}
              </p>
              <h1
                className={cn(
                  "mt-6 font-semibold text-white [text-wrap:balance]",
                  lang === "en"
                    ? "text-[3.1rem] leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-[4.35rem] xl:text-[5.15rem]"
                    : "text-[2.85rem] leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem] lg:text-[3.4rem] xl:text-[3.75rem]"
                )}
              >
                {lang === "en" ? (
                  "MAKE WHAT LASTS."
                ) : (
                  <>
                    <span className="block whitespace-nowrap">
                      学点真本事，
                    </span>
                    <span className="block whitespace-nowrap">
                      做点真东西。
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
                {lang === "en"
                  ? "I founded Superlinear Academy, where 20,000+ people learn AI and put it to work. I also host in-depth conversations with AI researchers and technology founders."
                  : "我创办了超线性学院，和2万+同行一起学懂AI、把AI用起来。也在「课代表立正」，和AI研究者、科技创始人深聊。"}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="min-h-11 gap-1.5 bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  <a
                    href="https://www.superlinear.academy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en"
                      ? "Join the free community"
                      : "免费加入超线性学院"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("conversations")}
                  className="min-h-11 border-white/25 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  {lang === "en" ? "Watch the conversations" : "看我的访谈"}
                </Button>
              </div>
              <div className="mt-7 space-y-1 border-t border-white/15 pt-5 text-sm leading-6 text-zinc-300">
                <p>
                  {lang === "en"
                    ? "Cornell Economics PhD · Former Tencent Data & AI leader"
                    : "康奈尔经济学博士｜前腾讯总监"}
                </p>
                <p>
                  {lang === "en"
                    ? "Amazon · Meta · Early Statsig team, later acquired by OpenAI"
                    : "Amazon、Meta经历｜OpenAI收购团队早期成员"}
                </p>
              </div>
            </div>

            <figure>
              <div className="overflow-hidden border border-white/10 bg-black">
                <img
                  src="/hero/acquired-behind-scenes-desktop.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired"
                      : "孙煜征与Acquired的Ben Gilbert、David Rosenthal对谈"
                  }
                  className="h-auto w-full"
                  width={2400}
                  height={1600}
                  loading="eager"
                />
              </div>
              <figcaption className="mt-3 flex items-start justify-between gap-4 text-xs leading-5 text-lizheng-muted">
                <span>
                  {lang === "en"
                    ? "In conversation with Ben Gilbert and David Rosenthal of Acquired"
                    : "与Acquired的Ben Gilbert、David Rosenthal对谈"}
                </span>
                <span className="shrink-0">Significance Summit</span>
              </figcaption>
              <div className="mt-5 flex gap-1 border-t border-white/10 pt-2">
                <a
                  href="https://www.youtube.com/@kedaibiao"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex size-11 items-center justify-center text-lizheng-muted transition hover:text-white"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yuzhengsun/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex size-11 items-center justify-center text-lizheng-muted transition hover:text-white"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://yuzheng.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Substack"
                  className="flex size-11 items-center justify-center text-lizheng-muted transition hover:text-white"
                >
                  <Rss className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/sunyuzheng"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex size-11 items-center justify-center text-lizheng-muted transition hover:text-white"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </figure>
          </div>
        </section>

        <section
          id="superlinear"
          className="scroll-mt-[72px] bg-superlinear-canvas py-16 text-superlinear-ink md:py-24"
        >
          <div className="container">
            <div className="grid gap-9 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
              <div>
                <SectionLabel>SUPERLINEAR ACADEMY</SectionLabel>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.2] [text-wrap:balance] md:text-5xl">
                  {lang === "en" ? (
                    "Who you learn with matters."
                  ) : (
                    <>
                      <span className="inline-block">学AI，也要</span>
                      <span className="inline-block">选对身边的人。</span>
                    </>
                  )}
                </h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-[#5C574D] md:text-lg">
                  {lang === "en"
                    ? "See how experienced practitioners work, and bring your own questions. Join for free to explore enterprise AI training, member projects, and technical discussions."
                    : "看高手怎么做，拿自己的问题来讨论。企业AI培训、项目分享和技术讨论，注册就能看。"}
                </p>
                <p className="mt-5 text-sm leading-7 text-[#5C574D]">
                  {lang === "en"
                    ? "20,000+ members · 700+ project posts · 8,000+ project comments"
                    : "20,000+名成员 · 700+项目帖 · 8,000+条项目评论"}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-6 min-h-11 bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  <a
                    href="https://www.superlinear.academy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en"
                      ? "Join Superlinear Academy for free"
                      : "免费加入，把AI真正用起来"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <figure>
                <div className="overflow-hidden border border-[#DDD9D0] bg-[#E9E4DA]">
                  <img
                    src="/superlinear/yuzheng-yage-conversation.webp"
                    alt={
                      lang === "en"
                        ? "Yuzheng Sun and Yage discussing AI Builders"
                        : "立正与鸭哥讨论AI Builders"
                    }
                    className="aspect-[16/9] w-full object-cover"
                    loading="lazy"
                    width={1672}
                    height={941}
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-6 text-[#5C574D]">
                  {lang === "en"
                    ? "With Yage (Wang Yan), my teaching partner. Columbia PhD; nearly 40 AI research papers, including CVPR, NeurIPS and KDD."
                    : "与教学伙伴鸭哥（王言）。哥伦比亚大学博士，发表近40篇AI论文，研究见于CVPR、NeurIPS、KDD。"}
                </figcaption>
              </figure>
            </div>

            <div className="mt-10 grid border-y border-[#DDD9D0] md:grid-cols-2">
              {work[lang].map((item, index) => (
                <article
                  key={item.title}
                  className={cn(
                    "py-7 md:py-8",
                    index === 0
                      ? "md:pr-9"
                      : "border-t border-[#DDD9D0] md:border-l md:border-t-0 md:pl-9"
                  )}
                >
                  <p className="text-xs font-medium text-superlinear-deep">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-[#5C574D]">
                    {item.detail}
                  </p>
                  <p className="mt-3 text-xs leading-6 text-[#5C574D]">
                    {item.proof}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-superlinear-link hover:text-superlinear-deep"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>

            <article className="mt-12 overflow-hidden border border-[#CFC9BE] bg-superlinear-surface xl:grid xl:grid-cols-[0.88fr_1.12fr]">
              <figure className="flex flex-col border-b border-[#CFC9BE] bg-white xl:border-b-0 xl:border-r">
                <div className="overflow-hidden">
                  <img
                    src="/english-network/doordash-ai-training.webp"
                    alt={
                      lang === "en"
                        ? "Yuzheng Sun leading an AI training session for DoorDash"
                        : "孙煜征为DoorDash团队做AI培训"
                    }
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                </div>
                <figcaption className="border-t border-[#CFC9BE] bg-white px-5 py-3 text-xs leading-5 text-[#777064]">
                  {enterpriseWork[lang].caption}
                </figcaption>
              </figure>

              <div className="flex flex-col justify-between p-7 md:p-10 lg:p-12">
                <div>
                  <p
                    className={cn(
                      "font-mono text-[11px] leading-5 text-superlinear-deep",
                      lang === "en"
                        ? "uppercase tracking-[0.18em]"
                        : "tracking-[0.1em]"
                    )}
                  >
                    {enterpriseWork[lang].label}
                  </p>
                  <h3
                    className={cn(
                      "mt-5 max-w-3xl font-semibold leading-[1.12] [text-wrap:balance]",
                      lang === "zh"
                        ? "text-[1.55rem] min-[360px]:text-3xl md:text-4xl"
                        : "text-3xl md:text-4xl"
                    )}
                  >
                    {lang === "zh" ? (
                      <>
                        <span className="block">培训结束以后，</span>
                        <span className="block whitespace-nowrap">
                          工作应该真的变了。
                        </span>
                      </>
                    ) : (
                      enterpriseWork[lang].title
                    )}
                  </h3>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-[#5C574D]">
                    {enterpriseWork[lang].detail}
                  </p>
                </div>

                <div className="mt-8 border-t border-[#CFC9BE] pt-6 sm:grid sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10">
                  <div>
                    <p className="font-mono text-[11px] leading-5 tracking-[0.06em] text-[#5C574D]">
                      {enterpriseWork[lang].formats}
                    </p>
                    <Link
                      href={withLanguage("/collab/enterprise", lang)}
                      className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-superlinear-link transition hover:text-superlinear-deep sm:mt-5 sm:min-h-0"
                    >
                      {enterpriseWork[lang].cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-7 sm:mt-0 sm:text-right">
                    <p
                      className={cn(
                        "font-mono text-[10px] leading-5 text-superlinear-deep",
                        lang === "en"
                          ? "uppercase tracking-[0.16em]"
                          : "tracking-[0.08em]"
                      )}
                    >
                      {enterpriseWork[lang].priceLabel}
                    </p>
                    <p className="mt-1 whitespace-nowrap text-3xl font-semibold tracking-[-0.035em] text-[#173C2A] md:text-4xl">
                      {enterpriseWork[lang].price}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="mt-14">
              <div className="grid border-y border-[#CFC9BE] lg:grid-cols-2">
                {endorsements[lang].slice(1).map((item, index) => (
                  <blockquote
                    key={item.name}
                    className={cn(
                      "py-8 lg:px-8",
                      index > 0 &&
                        "border-t border-[#CFC9BE] lg:border-l lg:border-t-0"
                    )}
                  >
                    <p className="text-lg leading-8 text-[#302C25]">
                      “{item.quote}”
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-[#CFC9BE]">
                        <AvatarImage src={item.avatar} alt={item.name} />
                        <AvatarFallback>{item.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold text-superlinear-ink">
                          {item.name}
                        </div>
                        <div className="mt-0.5 text-xs leading-5 text-[#5C574D]">
                          {item.role}
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="conversations"
          className="scroll-mt-[72px] bg-lizheng-dark py-16 md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "200+ CONVERSATIONS" : "200+场公开对话"}
                </SectionLabel>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "What did they get right?"
                    : "他们做对了什么？"}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-zinc-400">
                <p>
                  {lang === "en"
                    ? "Conversations about technology—and the decisions that made the difference."
                    : "聊技术，也聊做决定的那一刻。"}
                </p>
                <p className="text-sm leading-7 text-lizheng-muted">
                  {lang === "en"
                    ? "400K+ followers across YouTube, Bilibili, and Xiaohongshu."
                    : "YouTube、B站、小红书，40万+关注者。"}
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-3">
              {selectedGuests[lang].map(guest => {
                const external = guest.href.startsWith("http");
                const content = (
                  <>
                    <img
                      src={guest.image}
                      alt=""
                      className="aspect-[16/9] w-full object-cover opacity-85 transition duration-300 group-hover:opacity-100"
                      loading="lazy"
                      width={480}
                      height={270}
                    />
                    <div className="min-h-28 bg-lizheng-raised p-3 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-semibold leading-5 text-white sm:text-lg">
                          {guest.name}
                        </h3>
                        {external ? (
                          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                        ) : (
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-zinc-300 sm:text-sm sm:leading-6">
                        {guest.role}
                      </p>
                    </div>
                  </>
                );

                return external ? (
                  <a
                    key={guest.name}
                    href={guest.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-lizheng-dark"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={guest.name}
                    href={withLanguage(guest.href, lang)}
                    className="group block bg-lizheng-dark"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                asChild
                variant="outline"
                className="min-h-11 border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              >
                <Link href={withLanguage("/guests", lang)}>
                  {lang === "en"
                    ? "Browse all conversations"
                    : "查看全部嘉宾访谈"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="story"
          className="scroll-mt-[72px] bg-lizheng-dark py-16 md:py-24"
        >
          <div className="container">
            <span id="belief" className="scroll-mt-[88px]" />
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "THE STORY" : "这条路"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.2] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en" ? (
                    "A career should leave more than a résumé."
                  ) : (
                    <>
                      工作一辈子，别只留下
                      <span className="whitespace-nowrap">一份简历。</span>
                    </>
                  )}
                </h2>
              </div>
              <div>
                <p className="text-base leading-8 text-zinc-300 md:text-lg">
                  {lang === "en"
                    ? "After leading a 30-person data and AI team at Tencent, I returned to the U.S. to work hands-on at an early-stage Statsig. Later, I left to build Superlinear Academy full time."
                    : "在腾讯带过30人的数据与AI团队后，我回到美国，加入早期的Statsig，重新做一线工作。后来，我辞职创办了超线性学院。"}
                </p>
                <p className="mt-4 text-base leading-8 text-zinc-300 md:text-lg">
                  {lang === "en"
                    ? "The question I kept coming back to: without the title or the company name, what could I make that people would actually want?"
                    : "我越来越在意：离开职位和公司名，自己还能做出什么，是别人真正需要的？"}
                </p>
                <p className="mt-6 border-t border-white/15 pt-5 text-sm leading-7 text-lizheng-muted">
                  Cornell → Amazon → Meta → Tencent → Statsig → Superlinear
                </p>
                <Link
                  href={withLanguage("/about", lang)}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-superlinear-on-dark hover:text-white"
                >
                  {lang === "en"
                    ? "My background and beliefs"
                    : "我的经历与主张"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <article
              id="judgment"
              className="mt-10 scroll-mt-[88px] border-y border-white/15 py-7"
            >
              <SectionLabel dark>
                {lang === "en" ? "ON AI" : "关于AI"}
              </SectionLabel>
              <div className="mt-5 grid gap-6 md:grid-cols-2 md:gap-12">
                {featuredJudgment[lang].timeline.map(item => (
                  <div
                    key={item.date}
                    className="border-l border-superlinear-on-dark/40 pl-5"
                  >
                    <p className="font-mono text-xs leading-5 text-superlinear-on-dark">
                      {item.date}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-8 text-white">
                      {Array.isArray(item.label)
                        ? item.label.map(phrase => (
                            <span key={phrase} className="inline-block">
                              {phrase}
                            </span>
                          ))
                        : item.label}
                    </h3>
                    <div className="mt-2">
                      {item.links.map(link => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-11 items-center gap-2 text-sm leading-6 text-zinc-400 hover:text-white"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <a
                  href={featuredJudgment[lang].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-superlinear-on-dark hover:text-white"
                >
                  {featuredJudgment[lang].cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>

            <aside
              aria-label={
                lang === "en"
                  ? "Vijaye Raji on Yuzheng Sun's product judgment"
                  : "Vijaye Raji对立正产品判断的评价"
              }
              className="mt-12 grid gap-6 border border-white/10 bg-lizheng-raised p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-10 md:p-8"
            >
              <Avatar className="h-14 w-14 border border-white/15 md:h-16 md:w-16">
                <AvatarImage src="/avatars/vijaye-raji.jpg" alt="Vijaye Raji" />
                <AvatarFallback>VR</AvatarFallback>
              </Avatar>
              <blockquote>
                <p className="max-w-5xl text-lg font-medium leading-8 text-white md:text-xl md:leading-9">
                  “{endorsements[lang][0].quote}”
                </p>
                <footer className="mt-4 text-sm leading-6 text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    {endorsements[lang][0].name}
                  </span>
                  <span className="mx-2 text-lizheng-muted">·</span>
                  {endorsements[lang][0].role}
                </footer>
              </blockquote>
            </aside>
          </div>
        </section>

        <section
          id="thinking"
          className="scroll-mt-[72px] bg-[#173C2A] py-16 md:py-20"
        >
          <div className="container">
            <SectionLabel dark>KNOWLEDGE BANK</SectionLabel>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-white md:text-5xl">
              {lang === "en" ? "What I’m thinking about." : "最近在想什么。"}
            </h2>

            <div className="mt-10 grid border-t border-white/20 lg:grid-cols-3">
              {recentWriting[lang].map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group block border-b border-white/20 py-7 transition hover:bg-white/[0.05] lg:px-7 lg:py-8",
                    index > 0 && "lg:border-l"
                  )}
                >
                  <p
                    className={cn(
                      "font-mono text-[11px] leading-5 text-superlinear-on-dark",
                      lang === "en"
                        ? "uppercase tracking-[0.16em]"
                        : "tracking-[0.08em]"
                    )}
                  >
                    {item.label}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-8 text-white md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    {item.detail}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-on-dark transition group-hover:text-white">
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section
          id="books"
          className="scroll-mt-[72px] bg-superlinear-canvas py-14 text-superlinear-ink md:py-20"
        >
          <div className="container">
            <SectionLabel>
              {lang === "en" ? "BOOKS & OPEN CONTEXT" : "书与公开资料"}
            </SectionLabel>
            <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
              <div className="divide-y divide-[#DDD9D0]">
                {[
                  {
                    title: "Growth Data Analytics Playbook",
                    cover: "/book/growth-data-analytics-playbook.jpg",
                    href: "/book",
                    detail:
                      lang === "en"
                        ? "A practical guide to product-market fit, growth, and experimentation."
                        : "写给数据科学家、产品经理和创始人的增长实战书。",
                  },
                  {
                    title: "真本事：从会工作到会赚钱",
                    cover: "/book/cover-front.png",
                    href: "/zbs",
                    detail:
                      lang === "en"
                        ? "A Chinese book on building capability, agency, and income."
                        : "拿回工作的主动权，把自己的本事变成收入。",
                  },
                ].map(book => (
                  <Link
                    key={book.title}
                    href={withLanguage(book.href, lang)}
                    className="group grid grid-cols-[5.5rem_1fr] items-center gap-5 py-6 first:pt-0 last:pb-0 sm:grid-cols-[6.5rem_1fr]"
                  >
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="h-auto w-full shadow-md"
                      loading="lazy"
                    />
                    <div>
                      <h2 className="text-xl font-semibold leading-7 group-hover:text-superlinear-link sm:text-2xl sm:leading-8">
                        {book.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[#5C574D]">
                        {book.detail}
                      </p>
                      <span className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-superlinear-link">
                        {lang === "en" ? "Explore the book" : "了解这本书"}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <figure>
                <div className="overflow-hidden bg-[#DDD8CE]">
                  <img
                    src="/book/growth-data-launch.webp"
                    alt={
                      lang === "en"
                        ? "Yuzheng Sun, co-authors Mengying Li and Joe Kumar, and Julie Zhuo at the Growth Data Analytics Playbook launch"
                        : "孙煜征、共同作者李梦颖和Joe Kumar，以及Julie Zhuo在《Growth Data Analytics Playbook》发布活动现场"
                    }
                    className="h-auto w-full"
                    loading="lazy"
                    width={2400}
                    height={1597}
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-6 text-[#5C574D]">
                  <p>
                    {lang === "en"
                      ? "At the book launch, with co-authors Mengying Li and Joe Kumar, and Julie Zhuo."
                      : "新书发布现场，与共同作者李梦颖和Joe Kumar，以及Julie Zhuo。"}
                  </p>
                  <p className="mt-1 font-medium">
                    {lang === "en"
                      ? "Featured in a 2025 WSJ CIO Journal reading list"
                      : "入选《华尔街日报》CIO Journal 2025年书单"}
                  </p>
                </figcaption>
              </figure>
            </div>
            <a
              href="https://github.com/sunyuzheng/lizheng-open-context"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 flex items-center justify-between gap-5 border-y border-[#DDD9D0] py-6 transition hover:text-superlinear-link"
            >
              <div className="flex items-center gap-4">
                <Github className="h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold leading-7">
                    {lang === "en"
                      ? "Bring my writing and video transcripts into your AI."
                      : "把我的文章与视频资料，带进你的AI。"}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#5C574D]">
                    lizheng-open-context
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </a>
          </div>
        </section>

        <section className="bg-lizheng-dark py-16 md:py-24">
          <div className="container border-y border-white/10 py-12 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <p
                  className={cn(
                    "font-mono text-xs leading-5 text-superlinear-on-dark",
                    lang === "en"
                      ? "uppercase tracking-[0.2em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {lang === "en" ? "COME JOIN US" : "来，一起"}
                </p>
                <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-[1.08] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "MAKE WHAT LASTS."
                    : "一起学点真本事，做点真东西。"}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                  {lang === "en"
                    ? "Start with the free community. Bring a question you want to solve."
                    : "先来免费社区看看。带上你现在最想解决的那个问题。"}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  asChild
                  className="min-h-11 bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  <a
                    href="https://www.superlinear.academy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en"
                      ? "Join Superlinear Academy for free"
                      : "免费加入超线性学院"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>

                <Link
                  href={withLanguage("/collab", lang)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-lizheng-muted transition hover:text-white"
                >
                  <Handshake className="h-4 w-4" />
                  {lang === "en" ? "Collaborate with me" : "与我合作"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-lizheng-deep py-10">
        <div className="container flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-base font-semibold text-white">
              Yuzheng Sun · 立正
            </div>
            <p className="mt-2 max-w-lg text-sm leading-6 text-lizheng-muted">
              {lang === "en"
                ? "PhD in Economics from Cornell, author, and founder of Superlinear Academy. Make what lasts."
                : "康奈尔大学经济学博士、作者，Superlinear Academy创始人。学点真本事，做点真东西。"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href={withLanguage("/about", lang)}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-superlinear-on-dark transition hover:text-white md:min-h-0"
              >
                {lang === "en" ? "About Yuzheng" : "关于课代表立正"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://shop.lizheng.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-superlinear-on-dark md:min-h-0"
              >
                <ShoppingBag className="h-4 w-4" />
                {nav.shop}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1 text-lizheng-muted">
            <a
              href="https://www.youtube.com/@kedaibiao"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex size-11 items-center justify-center transition hover:text-white"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/yuzhengsun/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex size-11 items-center justify-center transition hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://yuzheng.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Substack"
              className="flex size-11 items-center justify-center transition hover:text-white"
            >
              <Rss className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/sunyuzheng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex size-11 items-center justify-center transition hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:yz@superlinear.academy"
              aria-label="Email"
              className="flex size-11 items-center justify-center transition hover:text-white"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="container mt-8 border-t border-white/10 pt-6 text-xs text-lizheng-muted">
          © {new Date().getFullYear()} Yuzheng Sun. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
