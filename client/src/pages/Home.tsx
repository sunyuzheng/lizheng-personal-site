import LanguageToggle from "@/components/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ExternalLink,
  Github,
  GraduationCap,
  Handshake,
  Linkedin,
  Mail,
  Menu,
  Rss,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { HOME_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildHomeStructuredData } from "@shared/structured-data";

const stats = [
  {
    value: "200+",
    en: "conversations with researchers, founders, and operators",
    zh: "与研究者、创始人和一线管理者的深度对话",
  },
  {
    value: "3,000+",
    en: "paying learners across AI, data, and growth",
    zh: "来自 AI、数据与增长领域的付费学员",
  },
  {
    value: "WSJ 2025",
    en: "featured in a CIO Journal reading list",
    zh: "入选 CIO Journal 书单",
  },
  {
    value: "400K+",
    en: "cross-platform audience",
    zh: "全网关注者",
  },
];

const career = [
  {
    org: "Cornell",
    en: "PhD, Economics",
    zh: "经济学博士",
  },
  {
    org: "Amazon",
    en: "Economist",
    zh: "经济学家",
  },
  {
    org: "Meta",
    en: "Data Scientist",
    zh: "数据科学家",
  },
  {
    org: "Tencent IEG",
    en: "Vice Director, Data & AI",
    zh: "数据与 AI 副总监",
  },
  {
    org: "Statsig",
    en: "Principal DS · Sole Evangelist",
    zh: "首席数据科学家 · 唯一布道师",
  },
  {
    org: "Superlinear",
    en: "Founder",
    zh: "创始人",
  },
];

const ideas = {
  en: [
    {
      number: "01",
      title: "A good world model matters more than knowing more facts.",
      detail:
        "The real test is whether you can explain why something happened—and change your model when reality refuses to cooperate.",
      label: "World models",
      href: "https://www.youtube.com/watch?v=r0nsW3nIFgk",
    },
    {
      number: "02",
      title:
        "Strong opinions, weakly held: state the view clearly, then welcome a better one.",
      detail:
        "I like being challenged into changing my mind. That works only when assumptions and evidence are on the table and the discussion can move the work forward.",
      label: "Strong opinions, weakly held",
      href: "https://youtu.be/D_-hU1O7IVw",
    },
    {
      number: "03",
      title: "In the AI era, the most durable move is from user to builder.",
      detail:
        "As tools get cheaper, the valuable work moves upward: choosing the problem, designing the system, and turning a one-off result into something reusable.",
      label: "Users to builders",
      href: "https://www.superlinear.academy/c/ai-resources/ai-mastery",
    },
  ],
  zh: [
    {
      number: "01",
      title: "世界模型比知识量更重要。",
      detail:
        "知识多不等于看得准。重要的是你能不能解释事情为什么发生；现实不符合预期时，能不能真的改掉自己的模型。",
      label: "世界模型",
      href: "https://www.youtube.com/watch?v=r0nsW3nIFgk",
    },
    {
      number: "02",
      title:
        "Strong opinions, weakly held：先把观点说清楚，也真心欢迎它被推翻。",
      detail:
        "我喜欢被挑战到改变自己的想法。前提是双方都把假设和证据摊开，让讨论真的能推动事情向前。",
      label: "Strong opinions, weakly held",
      href: "https://youtu.be/D_-hU1O7IVw",
    },
    {
      number: "03",
      title: "AI 时代，最值得做的升级是从 user 走到 builder。",
      detail:
        "工具会越来越便宜，真正值钱的是选对问题、设计系统，再把一次性的结果变成可以反复使用的东西。",
      label: "从 Users 到 Builders",
      href: "https://www.superlinear.academy/c/ai-resources/ai-mastery",
    },
  ],
};

const featuredPrediction = {
  en: {
    date: "2023.02",
    context: "BEFORE GPT-4",
    title:
      "Before GPT-4, I argued that ChatGPT was not a better chatbot, but a new natural-language interface to data and compute.",
    detail:
      "The essay anticipated collapsing inference costs; tool use and agents; personal memory and private search; copilots; and AI-native systems.",
    label: "Read Five Questions about ChatGPT",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
  },
  zh: {
    date: "2023.02",
    context: "GPT-4 发布前",
    title:
      "2023 年 2 月，在 GPT-4 发布前，我写下：ChatGPT 不只是更好的聊天机器人，而是用自然语言调用数据与算力的新界面。",
    detail:
      "文中提前推演了推理成本骤降、工具调用与 agent、个人记忆与 private search（后来被称为 RAG）、Copilot，以及 AI-native 系统。",
    label: "阅读万字原文",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
  },
};

const predictions = {
  en: [
    {
      date: "2025.01",
      title:
        "Agentic AI is the most important shift in AI—and the opportunity window is only 10–18 months.",
      href: "https://youtu.be/FzbkAy0DcQk",
    },
    {
      date: "2025.03",
      title:
        "MCP has major structural flaws. The hype outruns what it can actually deliver.",
      href: "https://youtu.be/kwwjR6HHJPM",
    },
    {
      date: "2026.03",
      title: "OpenClaw will not last—even though it is still worth trying.",
      href: "https://youtu.be/h_yCYBRzbVw",
    },
  ],
  zh: [
    {
      date: "2025.01",
      title:
        "Agentic AI 是 AI 当前最重要的方向，真正的机会窗口只有 10–18 个月。",
      href: "https://youtu.be/FzbkAy0DcQk",
    },
    {
      date: "2025.03",
      title: "MCP 有重大的结构性缺陷，实际价值远没有市场吹捧得那么高。",
      href: "https://youtu.be/kwwjR6HHJPM",
    },
    {
      date: "2026.03",
      title: "OpenClaw 一定会凉，但现在仍值得亲自试一遍。",
      href: "https://youtu.be/h_yCYBRzbVw",
    },
  ],
};

const work = {
  en: [
    {
      icon: GraduationCap,
      label: "BUILDING CAPABILITY",
      title: "AI Builders",
      detail:
        "Start with a real problem, learn to make AI carry complex work reliably, and turn the result into projects, workflows, and systems worth keeping.",
      proof: "Courses · projects · hands-on practice",
      href: "https://ai-builders.com",
      cta: "Explore AI Builders",
    },
    {
      icon: Users,
      label: "LONG-TERM ENVIRONMENT",
      title: "Stay Superlinear",
      detail:
        "A paid membership for people already using AI and bringing real expertise. Members ask serious questions, sharpen their work, and find people worth building alongside.",
      proof: "Paid membership · co-led with Yage",
      href: "https://staysuperlinear.com",
      cta: "Explore Stay Superlinear",
    },
    {
      icon: Building2,
      label: "ORGANIZATIONS",
      title: "Enterprise AI transformation",
      detail:
        "Talks, workshops, and custom programs for teams including Tencent, DoorDash, Pinterest, 1Password, and Amazon. The work starts with what a team actually needs to change, not a tour of AI tools.",
      proof: "Talks · workshops · custom programs",
      href: "https://corp-training.ai-builders.com",
      cta: "Explore enterprise work",
    },
  ],
  zh: [
    {
      icon: GraduationCap,
      label: "建立能力",
      title: "AI Builders",
      detail:
        "从真实问题出发，训练自己用 AI 完成复杂工作，再把有效做法做成作品、工作流和系统。",
      proof: "课程 · 项目 · 动手实践",
      href: "https://ai-builders.com",
      cta: "了解 AI Builders",
    },
    {
      icon: Users,
      label: "长期环境",
      title: "Stay Superlinear",
      detail:
        "一个给已经在用 AI、也有自己专业积累的人准备的付费会员社区。认真聊问题、打磨作品，也一起做事。",
      proof: "付费会员社区 · 立正与鸭哥共同主理",
      href: "https://staysuperlinear.com",
      cta: "了解 Stay Superlinear",
    },
    {
      icon: Building2,
      label: "组织实践",
      title: "企业 AI 转型",
      detail:
        "曾为腾讯、DoorDash、Pinterest、1Password、Amazon 等团队做 AI 分享、工作坊和定制项目。重点不是再讲一遍工具，而是解决团队实际工作里的问题。",
      proof: "分享 · 工作坊 · 定制项目",
      href: "https://corp-training.ai-builders.com",
      cta: "了解企业合作",
    },
  ],
};

const selectedGuests = {
  en: [
    {
      name: "Yangqing Jia",
      role: "PyTorch co-creator · Founder, Lepton AI",
      href: "/guests/yangqing-jia",
      image: "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
    },
    {
      name: "Tian Yuandong",
      role: "AI researcher · Former Meta AI / FAIR",
      href: "/guests/tian-yuandong",
      image: "https://img.youtube.com/vi/dymM40bVIhQ/maxresdefault.jpg",
    },
    {
      name: "Howie Xu",
      role: "Chief AI Officer, Gen · Stanford GSB guest lecturer",
      href: "/guests/howie-xu",
      image: "https://img.youtube.com/vi/R8X4ClBY5tg/maxresdefault.jpg",
    },
    {
      name: "Yang Ying · Tulong Dashihua",
      role: "Neuroscience PhD · Serial entrepreneur",
      href: "/guests/yang-ying",
      image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
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
      image: "https://img.youtube.com/vi/BnL5qaBzmR0/hqdefault.jpg",
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
      name: "贾扬清 Yangqing Jia",
      role: "PyTorch 共同创始人 · Lepton AI 创始人",
      href: "/guests/yangqing-jia",
      image: "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
    },
    {
      name: "田渊栋",
      role: "AI 研究者 · 前 Meta AI / FAIR",
      href: "/guests/tian-yuandong",
      image: "https://img.youtube.com/vi/dymM40bVIhQ/maxresdefault.jpg",
    },
    {
      name: "硅谷徐老师 Howie Xu",
      role: "GEN 首席 AI 官 · 斯坦福商学院客座讲师",
      href: "/guests/howie-xu",
      image: "https://img.youtube.com/vi/R8X4ClBY5tg/maxresdefault.jpg",
    },
    {
      name: "杨滢 · 屠龙大实话",
      role: "神经科学博士 · 连续创业者",
      href: "/guests/yang-ying",
      image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
    },
    {
      name: "毕书超 Shuchao Bi",
      role: "OpenAI Head of Post-Training · Multimodal",
      href: "/guests/shuchao-bi",
      image: "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
    },
    {
      name: "Reynold Xin",
      role: "Databricks 联合创始人",
      href: "/guests/reynold-xin",
      image: "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
    },
    {
      name: "Vijaye Raji",
      role: "Statsig 创始人 · OpenAI CTO of Applications",
      href: "/guests/vijaye-raji",
      image: "https://img.youtube.com/vi/iw2QYZeVlOQ/hqdefault.jpg",
    },
    {
      name: "Ryo Lu",
      role: "Cursor Head of Design",
      href: "/guests/ryo-lu",
      image: "https://img.youtube.com/vi/BnL5qaBzmR0/hqdefault.jpg",
    },
    {
      name: "Gergely Orosz",
      role: "The Pragmatic Engineer 创始人",
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
    {
      quote:
        "Yuzheng is a true AI-native pioneer. With his distinctive way of thinking, he helps more people achieve superlinear growth in the AI era.",
      name: "Dai Yusen",
      role: "Partner, ZhenFund",
      avatar: "/avatars/dai-yusen.jpg",
      initials: "DY",
    },
  ],
  zh: [
    {
      quote:
        "立正能把多年产品增长经验提炼成可执行的洞察，帮助数据科学家、产品经理和创始人更快看清关键问题。",
      name: "Vijaye Raji",
      role: "Statsig 创始人 · OpenAI CTO of Applications",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
    {
      quote:
        "立正做的 AI 教育社群很少见：内容筛选认真，实战密度高，也确实贴近工作里的问题。",
      name: "Wei Manfredi",
      role: "IHG Hotels & Resorts AI 与架构高级副总裁",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "立正分享的不只是工具，而是思维哲学——这才是 AI 时代最稀缺、最有价值的东西。他的课程让我这个科学家也深受启发。",
      name: "刘嘉",
      role: "清华大学讲席教授 ·《最强大脑》总科学顾问",
      avatar: "/avatars/liu-jia.jpg",
      initials: "刘嘉",
    },
    {
      quote:
        "立正是真正的 AI Native Pioneer——他用独特的思维框架，带领更多人在 AI 时代实现超线性成长。",
      name: "戴雨森",
      role: "真格基金合伙人",
      avatar: "/avatars/dai-yusen.jpg",
      initials: "雨森",
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
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.2em]",
        dark ? "text-amber-300" : "text-[#8B4A19]"
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
      throughline: "Throughline",
      ideas: "Ideas",
      work: "Work",
      conversations: "Conversations",
      books: "Books",
      collaborate: "Collaborate",
      community: "Free community",
    },
    zh: {
      throughline: "主线",
      ideas: "判断",
      work: "实践",
      conversations: "对话",
      books: "书",
      collaborate: "合作",
      community: "免费社区",
    },
  });

  const closeAndScroll = (id: string) => {
    setMobileMenuOpen(false);
    window.setTimeout(() => scrollToSection(id), 0);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/90 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between">
          <button onClick={() => scrollToSection("hero")} className="text-left">
            <div className="text-base font-semibold text-white">
              {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
            </div>
            <div className="text-xs text-zinc-500">
              {lang === "en" ? "课代表立正" : "孙煜征 · Yuzheng Sun"}
            </div>
          </button>

          <div className="hidden items-center gap-5 lg:flex">
            {[
              ["throughline", nav.throughline],
              ["ideas", nav.ideas],
              ["work", nav.work],
              ["conversations", nav.conversations],
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
              href={withLanguage("/book", lang)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.books}
            </Link>
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
              className="bg-amber-400 text-[#211300] hover:bg-amber-300"
            >
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Users className="mr-2 h-4 w-4" />
                {nav.community}
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageToggle size="sm" />
            <button
              onClick={() => setMobileMenuOpen(value => !value)}
              className="p-1 text-zinc-300"
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
          <div className="container border-t border-white/10 py-4 lg:hidden">
            <div className="grid gap-3 text-sm">
              {[
                ["throughline", nav.throughline],
                ["ideas", nav.ideas],
                ["work", nav.work],
                ["conversations", nav.conversations],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => closeAndScroll(id)}
                  className="text-left text-zinc-300"
                >
                  {label}
                </button>
              ))}
              <Link
                href={withLanguage("/book", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-300"
              >
                {nav.books}
              </Link>
              <Link
                href={withLanguage("/collab", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-300"
              >
                {nav.collaborate}
              </Link>
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300"
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
          className="relative isolate min-h-[700px] scroll-mt-[72px] overflow-hidden md:min-h-[calc(100svh-72px)]"
        >
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/hero/acquired-behind-scenes-mobile.webp"
            />
            <img
              src="/hero/acquired-behind-scenes-desktop.webp"
              alt={
                lang === "en"
                  ? "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired"
                  : "孙煜征与 Acquired 主播 Ben Gilbert、David Rosenthal 对谈"
              }
              className="absolute inset-0 h-full w-full object-cover object-center lg:origin-right lg:scale-[1.12]"
              width={2400}
              height={1600}
            />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,18,0.98)_0%,rgba(7,10,18,0.91)_38%,rgba(7,10,18,0.42)_67%,rgba(7,10,18,0.2)_100%)] md:bg-[linear-gradient(90deg,rgba(7,10,18,0.98)_0%,rgba(7,10,18,0.9)_38%,rgba(7,10,18,0.18)_75%,rgba(7,10,18,0.08)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,10,18,0.01)_0%,rgba(7,10,18,0.04)_48%,rgba(7,10,18,0.72)_66%,rgba(7,10,18,0.98)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,10,18,0.94)_0%,transparent_36%)] md:bg-[linear-gradient(0deg,rgba(7,10,18,0.72)_0%,transparent_30%)] lg:bg-[linear-gradient(0deg,rgba(7,10,18,0.82)_0%,transparent_28%)]" />

          <div className="container relative z-10 flex min-h-[700px] items-end pb-10 pt-20 md:min-h-[calc(100svh-72px)] md:items-center md:pb-20 md:pt-20">
            <div className="max-w-3xl lg:ml-auto lg:w-96 lg:max-w-96 xl:w-[30rem] xl:max-w-[30rem]">
              <h1 className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
                <span className="px-2 text-zinc-600">/</span>
                {lang === "en" ? "课代表立正" : "孙煜征"}
              </h1>
              <p className="mt-6 max-w-3xl text-[2.65rem] font-semibold leading-[1.08] text-white [text-wrap:balance] sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[4rem]">
                {lang === "en" ? (
                  "From economics to AI: can a judgment change the result?"
                ) : (
                  <>
                    <span className="block">从经济学到 AI：</span>
                    <span className="block">
                      一个判断，最后能不能改变结果？
                    </span>
                  </>
                )}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-200 md:text-lg md:leading-8">
                {lang === "en"
                  ? "I’m Yuzheng Sun, also known as 课代表立正. I have a PhD in Economics from Cornell and have worked as an economist, data scientist, and technology leader. Today I’m based in Seattle, where I teach AI, build communities, write books, and host long-form conversations."
                  : "我是孙煜征，也叫课代表立正，康奈尔大学经济学博士。做过经济学家、数据科学家和科技公司管理者；现在在西雅图做 AI 教育和社区、写书，也持续做访谈。"}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("throughline")}
                  className="bg-amber-400 text-[#211300] hover:bg-amber-300 lg:px-3 lg:text-xs xl:px-6 xl:text-sm"
                >
                  {lang === "en"
                    ? "How these chapters connect"
                    : "这些经历怎么连起来"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("work")}
                  className="border-white/25 bg-black/20 text-white hover:bg-white/10 lg:px-3 lg:text-xs xl:px-6 xl:text-sm"
                >
                  {lang === "en" ? "What I’m working on" : "我现在在做什么"}
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-4 border-t border-white/15 pt-5">
                <p className="max-w-lg text-xs leading-5 text-zinc-400">
                  {lang === "en"
                    ? "In conversation with Ben Gilbert and David Rosenthal of Acquired · Significance Summit"
                    : "与 Acquired 主播 Ben Gilbert、David Rosenthal 对谈 · Significance Summit"}
                </p>
                <div className="ml-auto hidden gap-3 sm:flex">
                  <a
                    href="https://www.youtube.com/@kedaibiao"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="text-zinc-400 transition hover:text-white"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/yuzhengsun/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-zinc-400 transition hover:text-white"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://yuzheng.substack.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Substack"
                    className="text-zinc-400 transition hover:text-white"
                  >
                    <Rss className="h-5 w-5" />
                  </a>
                  <a
                    href="https://github.com/sunyuzheng"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="text-zinc-400 transition hover:text-white"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#101521]">
          <div className="container grid grid-cols-2 md:grid-cols-4">
            {stats.map((item, index) => (
              <div
                key={item.value}
                className={cn(
                  "min-h-32 border-white/10 px-4 py-6 md:min-h-36 md:px-6 md:py-8",
                  index % 2 === 1 && "border-l",
                  index > 1 && "border-t md:border-t-0",
                  index > 0 && "md:border-l"
                )}
              >
                <div className="text-xl font-semibold text-white md:text-2xl">
                  {item.value}
                </div>
                <p className="mt-2 max-w-[14rem] text-xs leading-5 text-zinc-400 md:text-sm">
                  {lang === "en" ? item.en : item.zh}
                </p>
              </div>
            ))}
          </div>
          <div className="container border-t border-white/10 py-2 text-right text-[10px] tracking-wide text-zinc-600">
            {lang === "en"
              ? "Figures last checked July 2026"
              : "数据最后核对：2026 年 7 月"}
          </div>
        </section>

        <section
          id="throughline"
          className="scroll-mt-[72px] bg-[#F2F0EA] py-16 text-[#191712] md:py-24"
        >
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <SectionLabel>
                  {lang === "en" ? "THE THROUGHLINE" : "这条主线"}
                </SectionLabel>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.12] [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "I changed roles several times. The thing I cared about kept getting more concrete."
                    : "我换过几次角色，真正关心的事却越来越具体。"}
                </h2>
              </div>
              <div className="space-y-6 text-base leading-8 text-[#48443B] md:text-lg md:leading-9">
                <p>
                  {lang === "en"
                    ? "Economics trained me to ask about incentives and causality. At Amazon and Meta, a model mattered only if it changed a decision. Leading a 30-person data and AI team at Tencent taught me that one person understanding the problem is not enough—the judgment has to travel through an organization. At Statsig, experimentation became infrastructure for continuous correction."
                    : "读经济学时，我学的是激励和因果；在 Amazon、Meta 做数据，我开始关心模型能不能改变决策；在腾讯带 30 人团队，我才知道，个人想明白远远不够，判断还得能被一个组织执行；到了 Statsig，实验本身变成了帮助公司持续纠错的基础设施。"}
                </p>
                <p>
                  {lang === "en"
                    ? "Courses, communities, books, interviews, and enterprise work may look different, but I still approach them the same way: understand the problem, test the idea in real work, and pass on what survives."
                    : "现在我做课程、社区，写书、做访谈，也给企业做项目，还是在做这件事：把问题想清楚，到真实工作里验证，再把有效的方法交给更多人用。"}
                </p>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-2 border-t border-[#D4D0C7] lg:grid-cols-6">
              {career.map((item, index) => (
                <div
                  key={item.org}
                  className={cn(
                    "border-b border-[#D4D0C7] px-3 py-5 sm:px-5 lg:border-b-0 lg:px-4",
                    index % 2 === 1 && "border-l",
                    index > 0 && "lg:border-l"
                  )}
                >
                  <div className="text-sm font-semibold text-[#191712]">
                    {item.org}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-[#6E685D]">
                    {lang === "en" ? item.en : item.zh}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="ideas"
          className="scroll-mt-[72px] bg-[#0B0F1A] py-16 md:py-24"
        >
          <div className="container grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div>
              <SectionLabel dark>
                {lang === "en" ? "A FEW WORKING VIEWS" : "我的几个判断"}
              </SectionLabel>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.15] text-white md:text-5xl">
                {lang === "en"
                  ? "I would rather state a view clearly—and let reality overturn it."
                  : "我愿意先把判断说清楚，也欢迎现实把它推翻。"}
              </h2>

              <div className="mt-10 border-t border-white/10">
                {ideas[lang].map(item => (
                  <a
                    key={item.number}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid gap-3 border-b border-white/10 py-6 transition md:grid-cols-[3rem_1fr_auto] md:gap-5"
                  >
                    <span className="font-mono text-xs text-zinc-600">
                      {item.number}
                    </span>
                    <span>
                      <span className="block text-lg font-semibold leading-7 text-white group-hover:text-amber-200 md:text-xl">
                        {item.title}
                      </span>
                      <span className="mt-2 block max-w-2xl text-sm leading-7 text-zinc-400">
                        {item.detail}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 self-start text-xs text-zinc-500 transition group-hover:text-amber-300 md:justify-self-end">
                      {item.label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <aside className="border-t border-amber-300/35 bg-[#121824] px-5 py-7 md:px-7 md:py-9 lg:self-start">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                {lang === "en" ? "ON THE RECORD" : "公开判断"}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                {lang === "en" ? "A few dated calls" : "几次有时间戳的判断"}
              </h3>
              <a
                href={featuredPrediction[lang].href}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 block border-y border-amber-300/25 py-6"
              >
                <span className="font-mono text-xs text-amber-300">
                  {featuredPrediction[lang].date}
                  <span className="px-2 text-zinc-600">·</span>
                  {featuredPrediction[lang].context}
                </span>
                <span className="mt-3 block text-lg font-semibold leading-7 text-white group-hover:text-amber-100">
                  {featuredPrediction[lang].title}
                </span>
                <span className="mt-3 block text-sm leading-6 text-zinc-400">
                  {featuredPrediction[lang].detail}
                </span>
                <span className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                  {featuredPrediction[lang].label}
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </span>
              </a>
              <div>
                {predictions[lang].map(item => (
                  <a
                    key={item.date}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border-b border-white/10 py-5"
                  >
                    <span className="font-mono text-xs text-zinc-500">
                      {item.date}
                    </span>
                    <span className="mt-2 flex gap-3 text-sm font-medium leading-6 text-zinc-200 group-hover:text-white">
                      <span>{item.title}</span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 group-hover:text-amber-300" />
                    </span>
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section
          id="work"
          className="scroll-mt-[72px] bg-white py-16 text-[#171611] md:py-24"
        >
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel>
                  {lang === "en" ? "CURRENT WORK" : "现在在做"}
                </SectionLabel>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.12] md:text-5xl">
                  {lang === "en"
                    ? "I spend most of my time on three kinds of work."
                    : "我现在主要把时间花在三件事上。"}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-[#5C574D] md:text-lg">
                {lang === "en"
                  ? "Courses help people build capability. Community gives them people to keep working alongside. Enterprise projects take the same methods into the messiness of a real team."
                  : "课程练能力，社区让一群人长期一起做事，企业项目则把同样的方法拿到真实团队里去碰。"}
              </p>
            </div>

            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
              <div className="border-t border-[#DDD9D0]">
                {work[lang].map(item => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="grid gap-4 border-b border-[#DDD9D0] py-7 sm:grid-cols-[2.75rem_1fr]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center border border-[#D5D0C6] text-[#8B4A19]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B4A19]">
                          {item.label}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[#5C574D]">
                          {item.detail}
                        </p>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#777064]">
                          {item.proof}
                        </p>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#743B13] transition hover:text-[#A65318]"
                        >
                          {item.cta}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              <figure className="lg:sticky lg:top-24 lg:self-start">
                <div className="overflow-hidden bg-[#E8E4DC]">
                  <img
                    src="/english-network/doordash-ai-training.webp"
                    alt={
                      lang === "en"
                        ? "Yuzheng Sun leading an AI training session at a DoorDash team offsite in Seattle"
                        : "孙煜征在西雅图 DoorDash 团队 offsite 进行 AI 培训"
                    }
                    className="aspect-[4/3] w-full object-cover md:aspect-[16/10] lg:aspect-[4/3]"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                </div>
                <figcaption className="mt-3 flex justify-between gap-4 text-xs leading-5 text-[#777064]">
                  <span>
                    {lang === "en"
                      ? "DoorDash team offsite · AI training"
                      : "DoorDash 团队 offsite · AI 培训"}
                  </span>
                  <span>{lang === "en" ? "Seattle" : "西雅图"}</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111722] py-12 md:py-16">
          <div className="container grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
            <Avatar className="h-16 w-16 border border-white/15 md:h-20 md:w-20">
              <AvatarImage src="/avatars/vijaye-raji.jpg" alt="Vijaye Raji" />
              <AvatarFallback>VR</AvatarFallback>
            </Avatar>
            <blockquote>
              <p className="max-w-5xl text-xl font-medium leading-8 text-white md:text-2xl md:leading-10">
                “{endorsements[lang][0].quote}”
              </p>
              <footer className="mt-4 text-sm text-zinc-400">
                <span className="font-semibold text-zinc-200">
                  {endorsements[lang][0].name}
                </span>
                <span className="mx-2 text-zinc-600">·</span>
                {endorsements[lang][0].role}
              </footer>
            </blockquote>
          </div>
        </section>

        <section
          id="conversations"
          className="scroll-mt-[72px] bg-[#0B0F1A] py-16 md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "CONVERSATIONS" : "长期对话"}
                </SectionLabel>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.12] text-white md:text-5xl">
                  {lang === "en"
                    ? "I keep looking for people who have actually built the thing."
                    : "这些年，我一直在找真正把事情做出来的人聊。"}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-zinc-400">
                <p>
                  {lang === "en"
                    ? "Across 200+ public conversations, I am less interested in collecting conclusions than in understanding how a judgment formed, what evidence supports it, and where it might fail."
                    : "在 200+ 场公开对话里，我最想追问的不是结论，而是一个判断怎样形成，靠什么证据成立，又会在哪些地方失效。"}
                </p>
                <p className="text-sm leading-7 text-zinc-500">
                  {lang === "en"
                    ? "These conversations reach a 400K+ audience across YouTube, Bilibili, and Xiaohongshu, including engineers, data scientists, founders, investors, and operators across China and the U.S."
                    : "这些对话通过 YouTube、B站和小红书触达 400K+ 关注者，其中包括大量中美工程师、数据科学家、创始人、投资人与管理者。"}
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
                    <div className="min-h-28 bg-[#101521] p-3 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-semibold leading-5 text-white sm:text-lg">
                          {guest.name}
                        </h3>
                        {external ? (
                          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
                        ) : (
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
                        )}
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-zinc-400 sm:text-xs sm:leading-5">
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
                    className="group block bg-[#0B0F1A]"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={guest.name}
                    href={withLanguage(guest.href, lang)}
                    className="group block bg-[#0B0F1A]"
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
                className="border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              >
                <Link href={withLanguage("/guests", lang)}>
                  {lang === "en"
                    ? "Browse all guest conversations"
                    : "查看全部嘉宾访谈"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="books"
          className="scroll-mt-[72px] bg-[#F2F0EA] py-16 text-[#191712] md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel>
                  {lang === "en" ? "BOOKS" : "两本书"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.12] md:text-5xl">
                  {lang === "en"
                    ? "One book asks how products find direction and grow. The other asks how work becomes capability."
                    : "一本讲产品怎样找到方向、推动增长；一本讲人怎样把工作变成自己的本事。"}
                </h2>
              </div>
              <div>
                <p className="text-base leading-8 text-[#5C574D] md:text-lg">
                  {lang === "en"
                    ? "Growth Data Analytics Playbook covers product-market fit, metrics, and experimentation. 真本事 is about turning work into capability, leverage, and income of your own."
                    : "《Growth Data Analytics Playbook》讨论产品市场匹配、指标和实验；《真本事》讨论怎样把工作变成自己的能力、杠杆和收入。"}
                </p>
                <Button
                  asChild
                  className="mt-6 bg-[#191712] text-white hover:bg-[#302C25]"
                >
                  <Link href={withLanguage("/book", lang)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {lang === "en" ? "Explore both books" : "查看两本书"}
                  </Link>
                </Button>
              </div>
            </div>

            <figure className="mt-12">
              <div className="overflow-hidden bg-[#DDD8CE]">
                <img
                  src="/book/growth-data-launch.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun, co-authors Mengying Li and Joe Kumar, and Julie Zhuo at the Growth Data Analytics Playbook launch"
                      : "孙煜征与共同作者李梦颖、Joe Kumar 及 Julie Zhuo 在 Growth Data Analytics Playbook 发布活动现场"
                  }
                  className="aspect-[16/10] w-full object-cover object-center md:aspect-[16/8.5]"
                  loading="lazy"
                  width={2400}
                  height={1597}
                />
              </div>
              <figcaption className="mt-3 grid gap-1 text-xs leading-5 text-[#777064] sm:grid-cols-[1fr_auto] sm:gap-6">
                <span>
                  {lang === "en"
                    ? "At the launch of Growth Data Analytics Playbook, with co-authors Mengying Li and Joe Kumar, and Julie Zhuo."
                    : "《Growth Data Analytics Playbook》发布活动，与共同作者李梦颖、Joe Kumar 及 Julie Zhuo。"}
                </span>
                <span>
                  {lang === "en"
                    ? "Featured in a 2025 WSJ CIO Journal reading list"
                    : "入选《华尔街日报》CIO Journal 2025 年书单"}
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-[#101521] py-16 md:py-24">
          <div className="container">
            <SectionLabel dark>
              {lang === "en" ? "INDEPENDENT SIGNAL" : "来自同行的评价"}
            </SectionLabel>
            <div className="mt-8 grid border-t border-white/10 lg:grid-cols-3">
              {endorsements[lang].slice(1).map((item, index) => (
                <blockquote
                  key={item.name}
                  className={cn(
                    "border-b border-white/10 py-8 lg:px-8",
                    index > 0 && "lg:border-l"
                  )}
                >
                  <p className="text-lg leading-8 text-zinc-200">
                    “{item.quote}”
                  </p>
                  <footer className="mt-6 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback>{item.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="mt-0.5 text-xs leading-5 text-zinc-500">
                        {item.role}
                      </div>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0B0F1A] py-14 md:py-20">
          <div className="container grid gap-8 border-y border-white/10 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                {lang === "en" ? "FREE COMMUNITY" : "免费社区"}
              </p>
              <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight text-white md:text-4xl">
                {lang === "en"
                  ? "Many ideas only became useful after people in Superlinear Academy tried them, questioned them, and changed them."
                  : "很多想法，都是在 Superlinear Academy 里被问明白、做出来，再改过一轮。"}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                {lang === "en"
                  ? "It is the free community I continue to maintain: a place to see what people are building and bring a real question of your own."
                  : "这是我长期维护的免费社区。你可以看看大家正在做什么，也可以带来一个自己真正想解决的问题。"}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button
                asChild
                className="bg-amber-400 text-[#211300] hover:bg-amber-300"
              >
                <a
                  href="https://www.superlinear.academy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {lang === "en" ? "Join the community" : "加入社区"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              >
                <Link href={withLanguage("/collab", lang)}>
                  <Handshake className="mr-2 h-4 w-4" />
                  {lang === "en" ? "Collaborate" : "合作"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#080B12] py-10">
        <div className="container flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-base font-semibold text-white">
              Yuzheng Sun · 课代表立正
            </div>
            <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              {lang === "en"
                ? "PhD in Economics from Cornell, author, and founder of Superlinear Academy and AI Builders."
                : "康奈尔大学经济学博士、作者，Superlinear Academy 与 AI Builders 创始人。"}
            </p>
            <Link
              href={withLanguage("/about", lang)}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
            >
              {lang === "en" ? "Factual profile" : "关于课代表立正"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-5 text-zinc-500">
            <a
              href="https://www.youtube.com/@kedaibiao"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="transition hover:text-white"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/yuzhengsun/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://yuzheng.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Substack"
              className="transition hover:text-white"
            >
              <Rss className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/sunyuzheng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:yz@superlinear.academy"
              aria-label="Email"
              className="transition hover:text-white"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="container mt-8 border-t border-white/10 pt-6 text-xs text-zinc-600">
          © {new Date().getFullYear()} Yuzheng Sun. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
