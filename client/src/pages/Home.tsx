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
  ExternalLink,
  Github,
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

const waysOfKnowing = {
  en: [
    {
      eyebrow: "EXPLICIT UNDERSTANDING",
      title: "Build a world model.",
      detail:
        "Make as much of the causal model explicit as possible. Predict what should happen, then actively look for what would prove it wrong.",
    },
    {
      eyebrow: "TACIT, RESULT-ANSWERABLE KNOWING",
      title: "Develop craft.",
      detail:
        "Keep updating the same understanding where rules run out. Practice, apprenticeship, comparison, and consequence turn models into feel—and feel back into better models.",
    },
  ],
  zh: [
    {
      eyebrow: "显性的理解",
      title: "建立自己的世界模型。",
      detail:
        "尽可能把因果、激励与约束说清楚；做出预测，主动寻找能够推翻模型的证据。",
    },
    {
      eyebrow: "长在身上、又对结果负责的理解",
      title: "让知识长成手艺。",
      detail:
        "在规则装不下的复杂性中，继续更新同一份理解。真实问题、师承、比较与后果，让模型长成体感，也让体感反过来修正模型。",
    },
  ],
};

const convictionAndAuthorship = {
  en: {
    conviction: {
      eyebrow: "CONVICTION",
      title: "When understanding accepts the cost of action.",
      detail:
        "A borrowed idea can be repeated without changing a choice. Once understanding is internalized enough to carry a stake, it can support action before certainty arrives—and still change when better evidence appears.",
    },
    authorship: {
      eyebrow: "RESPONSIBLE AUTHORSHIP",
      title: "Stay responsible for what the work becomes.",
      detail:
        "Authorship begins with defining what should exist, whom it should serve, which standards matter, and what evidence should change it. It can belong to a person, a team, or an institution; responsibility cannot disappear inside the collaboration.",
    },
    test: {
      title: "Reality keeps testing. Time gradually reveals.",
      detail:
        "Neither is an infallible judge. But a maker cannot be the work's only witness. What people keep using, trusting, adapting, and remembering shows whether it is still alive.",
    },
  },
  zh: {
    conviction: {
      eyebrow: "确信",
      title: "当理解开始承担行动的代价。",
      detail:
        "借来的观点可以说得漂亮，却不改变选择。理解真正被内化以后，才可能在确定性到来之前支撑行动，也仍然愿意被更好的证据改变。",
    },
    authorship: {
      eyebrow: "负责任的作者性",
      title: "从定义问题开始，对作品负责。",
      detail:
        "什么值得存在、服务谁、坚持什么标准、因为什么而修改，都属于作者性。作品可以由个人、团队或机构完成；责任不能在协作中消失。",
    },
    test: {
      title: "现实持续检验，时间逐渐显露。",
      detail:
        "它们都不是无误的终审；但作者不能成为作品唯一的证人。人们仍在使用、信任、改进和记住什么，会逐渐显露作品是否还活着。",
    },
  },
};

const careerChapters = {
  en: [
    {
      marker: "CORNELL · ECONOMICS",
      title: "Make the invisible model explicit.",
      detail:
        "Economics trained me to ask about causes, choices, incentives, and constraints, then make a prediction specific enough to challenge—not mistake correlation or a loud story for understanding.",
    },
    {
      marker: "AMAZON · META",
      title: "Learn what the model cannot hold.",
      detail:
        "Inside large technology products, a correct model still met users, interfaces, incentives, timing, and imperfect information. Some consequential judgment could only be earned in the work.",
    },
    {
      marker: "TENCENT · STATSIG",
      title: "Let conviction travel without becoming dogma.",
      detail:
        "Leading a 30-person data and AI team taught me that one person seeing clearly was not enough. At Statsig, experiments kept consequential views answerable to evidence built into the workflow.",
    },
    {
      marker: "SUPERLINEAR · NOW",
      title: "Take authorship of a body of work.",
      detail:
        "Courses, community, books, tools, and public conversations are my attempt to remain responsible for one coherent body of work: what it is for, how it should evolve, and whether it remains useful without me in the room.",
    },
  ],
  zh: [
    {
      marker: "康奈尔 · 经济学",
      title: "把看不见的模型说清楚。",
      detail:
        "经济学训练我追问因果、选择、激励与约束，再做出足够具体、可以被挑战的预测；不把相关性、热闹或一个好听的故事当成理解。",
    },
    {
      marker: "AMAZON · META",
      title: "看见模型装不下的复杂性。",
      detail:
        "在大型科技产品里，正确的模型还要穿过用户、界面、激励、时机与不完整信息。有些关键判断，只能在真实工作里长出来。",
    },
    {
      marker: "腾讯 · STATSIG",
      title: "让确信穿过组织，又不变成教条。",
      detail:
        "在腾讯带30人数据与AI团队，让我看到一个人想明白远远不够；到了Statsig，实验让重要判断持续对产品工作流里的证据负责。",
    },
    {
      marker: "SUPERLINEAR · 现在",
      title: "对一整套作品承担作者责任。",
      detail:
        "课程、社区、书、工具与公开对话，是我长期负责的一整套作品：它为什么存在、怎样演进，以及离开我以后是否仍然有用。",
    },
  ],
};

const featuredJudgment = {
  en: {
    date: "FEBRUARY 2023 · BEFORE GPT-4",
    title:
      "I argued that ChatGPT was not simply a better chatbot, but a new natural-language interface to data and computation.",
    detail:
      "The essay examined collapsing inference costs, tool use and agents, persistent memory, private search, copilots, and AI-native systems. The date matters because the reasoning was public before the outcome was obvious—and remains available to inspect.",
    cta: "Read The Five Most Important Questions About ChatGPT",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
  },
  zh: {
    date: "2023年2月 · GPT-4发布前",
    title:
      "我当时的判断是：ChatGPT不只是更好的聊天机器人，而是用自然语言调用数据与算力的新界面。",
    detail:
      "文章讨论了推理成本骤降、工具调用与agent、长期记忆、private search、Copilot和AI-native系统。重要的不只是后来发生了什么，而是当时的推理至今仍公开可查。",
    cta: "阅读《关于ChatGPT最重要的五个问题》",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
  },
};

const work = {
  en: [
    {
      number: "01",
      label: "OPEN, PUBLIC VALUE",
      title: "The free community",
      detail:
        "A community of 20,000+ people seriously using AI, where deep public analysis, real projects, specific questions, first-hand experience, collaboration, and opportunities circulate.",
      proof:
        "20,000+ members · 600+ public project posts · nearly 7,000 project comments",
      href: "https://www.superlinear.academy",
      cta: "Join for free",
    },
    {
      number: "02",
      label: "STRUCTURED LEARNING",
      title: "AI Builders",
      detail:
        "A structured learning system I teach with Yage (Wang Yan), a Columbia electrical engineering PhD and AI researcher with nearly 40 papers, including work published at leading AI conferences such as CVPR, NeurIPS, and KDD. We connect technical depth, product judgment, and practice on real problems.",
      proof: "3,000+ paying learners · 5.0/5 on Maven",
      href: "https://ai-builders.com",
      cta: "Explore AI Builders",
    },
    {
      number: "03",
      label: "YEAR-ROUND MEMBERSHIP",
      title: "Stay Superlinear membership",
      detail:
        "A high-craft content and practitioner environment with deep analysis, guest masterclasses, monthly Q&A, core courses, Skills, recordings, and a searchable archive to return to when the next decision matters.",
      proof:
        "12+ masterclasses · monthly Q&A · 3 core courses · selected Skills",
      href: "https://stay.superlinear.academy",
      cta: "Explore the membership",
    },
    {
      number: "04",
      label: "ORGANIZATIONAL PRACTICE",
      title: "Enterprise AI programs",
      detail:
        "We work with teams to connect new AI capability to real workflows, evaluation, ownership, and organizational constraints—so a promising experiment has a chance to become reliable practice.",
      proof: "Tencent · Xiaohongshu · Meituan · DoorDash",
      href: "https://corp-training.ai-builders.com",
      cta: "Explore enterprise work",
    },
  ],
  zh: [
    {
      number: "01",
      label: "免费开放",
      title: "免费社区",
      detail:
        "两万多名认真用AI做事的人在这里相遇：主理人的深度解析、成员的真实项目、具体问题、一手经验、合作与机会，都在公共讨论里流动。",
      proof: "20,000+名成员 · 600+项目帖 · 近7,000条项目评论",
      href: "https://www.superlinear.academy",
      cta: "免费加入",
    },
    {
      number: "02",
      label: "系统训练",
      title: "AI Builders",
      detail:
        "我和鸭哥（王言）共同授课。鸭哥是哥伦比亚大学电子工程博士、AI研究者，发表近40篇论文，研究发表于CVPR、NeurIPS、KDD等AI顶会。我们把技术原理、工程可靠性、产品判断与真实练习放在同一套学习体系里。",
      proof: "3,000+付费学员 · Maven 5.0/5",
      href: "https://ai-builders.com",
      cta: "了解AI Builders",
    },
    {
      number: "03",
      label: "全年会员",
      title: "Stay Superlinear会员",
      detail:
        "一个高质量、可长期回来的内容与实践环境：深度解析、闭门大师课、每月答疑、三门核心课、精选Skills、活动回放与可检索的内容库。",
      proof: "12+场闭门大师课 · 每月深度答疑 · 三门核心课 · 精选Skills",
      href: "https://stay.superlinear.academy",
      cta: "了解会员",
    },
    {
      number: "04",
      label: "组织实践",
      title: "企业AI项目",
      detail:
        "我们把新的AI能力放进团队的真实工作流、评估、责任与组织约束里，让一次有希望的实验有机会变成可靠的工作方式。",
      proof: "腾讯 · 小红书 · 美团 · DoorDash",
      href: "https://corp-training.ai-builders.com",
      cta: "了解企业合作",
    },
  ],
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
        "立正能把多年产品增长经验提炼成可执行的洞察，帮助数据科学家、产品经理和创始人更快看清关键问题。",
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
      belief: "Belief",
      story: "Story",
      work: "Superlinear",
      conversations: "Conversations",
      books: "Books",
      collaborate: "Collaborate",
      community: "Free community",
    },
    zh: {
      belief: "主张",
      story: "经历",
      work: "Superlinear",
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
              ["belief", nav.belief],
              ["story", nav.story],
              ["superlinear", nav.work],
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
                ["belief", nav.belief],
                ["story", nav.story],
                ["superlinear", nav.work],
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
          className="scroll-mt-[72px] border-b border-white/10 bg-[#070A12]"
        >
          <div className="container grid min-h-[calc(100svh-72px)] gap-10 py-12 md:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14 lg:py-20">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                {lang === "en"
                  ? "YUZHENG SUN · 课代表立正"
                  : "课代表立正 · 孙煜征"}
              </p>
              <h1 className="mt-6 text-[3.1rem] font-semibold leading-[0.96] tracking-[-0.04em] text-white [text-wrap:balance] sm:text-6xl lg:text-[4.35rem] xl:text-[5.15rem]">
                {lang === "en" ? "MAKE WHAT LASTS." : "做出你的代表作。"}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-zinc-300 md:text-lg md:leading-9">
                {lang === "en"
                  ? "I believe the best work keeps creating value beyond the moment it is made—and clearly bears the judgment and craft of the person who made it. Such work may also enlarge what its maker can do next. Superlinear Academy is the defining work I am building around that belief."
                  : "我相信，最好的作品，不会随着制作与发布结束；它会继续创造价值，也清楚承载做出它的人的判断与手艺。这样的作品，也可能继续成就作者。Superlinear Academy是我正在做的代表作，也是我为更多人追求自己的代表作建立的长期机构。"}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("superlinear")}
                  className="bg-amber-400 text-[#211300] hover:bg-amber-300"
                >
                  {lang === "en"
                    ? "See what I am building"
                    : "看看我正在做什么"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  <a
                    href="https://www.superlinear.academy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en" ? "Join the free community" : "免费加入社区"}
                  </a>
                </Button>
              </div>
              <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-500">
                {lang === "en"
                  ? "Cornell Economics PhD · Former Amazon, Meta, Tencent & Statsig · Founder and author"
                  : "康奈尔经济学博士 · 曾任职Amazon、Meta、腾讯与Statsig（后被OpenAI收购）· 创始人、作者"}
              </p>
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
              <figcaption className="mt-3 flex items-start justify-between gap-4 text-xs leading-5 text-zinc-500">
                <span>
                  {lang === "en"
                    ? "In conversation with Ben Gilbert and David Rosenthal of Acquired"
                    : "与Acquired的Ben Gilbert、David Rosenthal对谈"}
                </span>
                <span className="shrink-0">Significance Summit</span>
              </figcaption>
              <div className="mt-5 flex gap-4 border-t border-white/10 pt-4">
                <a
                  href="https://www.youtube.com/@kedaibiao"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yuzhengsun/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://yuzheng.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Substack"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Rss className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/sunyuzheng"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </figure>
          </div>
        </section>

        <section
          id="belief"
          className="scroll-mt-[72px] bg-[#F2F0EA] py-16 text-[#191712] md:py-24"
        >
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <SectionLabel>
                  {lang === "en" ? "WHAT I BELIEVE" : "我相信"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "Most work disappears. The work I admire keeps working."
                    : "大多数工作，做完就消失了。我敬佩的作品，完成以后还在工作。"}
                </h2>
              </div>
              <div className="space-y-5 text-base leading-8 text-[#48443B] md:text-lg md:leading-9">
                <p>
                  {lang === "en"
                    ? "AI is making first versions cheaper across much of digital work. That is a gift: more people can turn an idea into something real. It also makes one distinction harder to ignore. Output is plentiful. Work that carries judgment, craft, authorship, and remains worth choosing is not."
                    : "AI正在让许多数字工作的第一版越来越便宜。这是一份礼物：更多人可以把想法做成真的。它也让一个区别变得越来越无法忽视——产出很多，完成或首次发布以后仍继续创造价值、又清楚承载作者判断与手艺的作品，仍然很少。"}
                </p>
                <p>
                  {lang === "en"
                    ? "A defining work does not always begin with conviction. Often you enter the fog, make something, and use the gap between expectation and result to learn what the problem actually is—and what you are willing to stand behind."
                    : "代表作也不总是从确信开始。人常常要先进入迷雾、动手、撞到失败，再从预期与结果的差距里，逐渐知道问题究竟是什么，自己又愿意为什么负责。"}
                </p>
              </div>
            </div>

            <div className="mt-14 border-y border-[#D4D0C7]">
              <div className="grid lg:grid-cols-[0.34fr_0.66fr]">
                <div className="py-7 lg:border-r lg:border-[#D4D0C7] lg:pr-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A673D]">
                    {lang === "en"
                      ? "TWO MODES, ONE UNDERSTANDING"
                      : "同一份理解，两种生长方式"}
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#6E685D]">
                    {lang === "en"
                      ? "Some understanding can be stated and tested; some is earned inside the complexity of doing. They overlap, translate, and correct each other."
                      : "有些理解可以被说清、预测和检验；有些只能在真实复杂性中长出来。两者彼此渗透、转译，也彼此修正。"}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2">
                  {waysOfKnowing[lang].map((item, index) => (
                    <article
                      key={item.eyebrow}
                      className={cn(
                        "border-[#D4D0C7] py-7 lg:px-8",
                        index > 0 && "border-t sm:border-l sm:border-t-0"
                      )}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A673D]">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold leading-8">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[#6E685D]">
                        {item.detail}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid border-t border-[#D4D0C7] lg:grid-cols-[0.42fr_0.58fr]">
                <article className="py-7 lg:border-r lg:border-[#D4D0C7] lg:pr-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A673D]">
                    {convictionAndAuthorship[lang].conviction.eyebrow}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold leading-8">
                    {convictionAndAuthorship[lang].conviction.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#6E685D]">
                    {convictionAndAuthorship[lang].conviction.detail}
                  </p>
                </article>
                <article className="border-t border-[#D4D0C7] py-7 lg:border-t-0 lg:pl-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A673D]">
                    {convictionAndAuthorship[lang].authorship.eyebrow}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold leading-8">
                    {convictionAndAuthorship[lang].authorship.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#6E685D]">
                    {convictionAndAuthorship[lang].authorship.detail}
                  </p>
                </article>
              </div>

              <div className="grid border-t border-[#D4D0C7] py-7 lg:grid-cols-[0.42fr_0.58fr] lg:gap-8">
                <h3 className="text-xl font-semibold leading-8">
                  {convictionAndAuthorship[lang].test.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#6E685D] lg:mt-0">
                  {convictionAndAuthorship[lang].test.detail}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="story"
          className="scroll-mt-[72px] bg-[#0B0F1A] py-16 md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "THE STORY" : "这条路"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "I did not begin with the slogan. I arrived at the standard by doing the work."
                    : "这不是一句先想出来的口号，是一路做出来的标准。"}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
                {lang === "en"
                  ? "The titles matter less than what each environment forced me to learn: how explicit models and tacit craft correct each other, how understanding becomes conviction, and how authorship keeps responsibility with the work."
                  : "比职位更重要的，是每一段经历逼我学会了什么：显性的模型与隐性的手艺怎样互相修正，理解怎样变成确信，作者性又怎样让责任始终留在作品里。"}
              </p>
            </div>

            <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-2">
              {careerChapters[lang].map(item => (
                <article key={item.marker} className="bg-[#101521] p-6 md:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                    {item.marker}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-8 text-white md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>

            <article
              id="judgment"
              className="mt-12 scroll-mt-[88px] border-y border-amber-300/25 py-8 md:grid md:grid-cols-[0.72fr_1.28fr] md:gap-14 md:py-10"
            >
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "JUDGMENT ON THE RECORD" : "公开留下的判断"}
                </SectionLabel>
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
                  {featuredJudgment[lang].date}
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <h3 className="max-w-3xl text-2xl font-semibold leading-9 text-white md:text-3xl md:leading-10">
                  {featuredJudgment[lang].title}
                </h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
                  {featuredJudgment[lang].detail}
                </p>
                <a
                  href={featuredJudgment[lang].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
                >
                  {featuredJudgment[lang].cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </section>

        <section
          id="superlinear"
          className="scroll-mt-[72px] bg-white py-16 text-[#171611] md:py-24"
        >
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel>SUPERLINEAR ACADEMY</SectionLabel>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "My defining work is still in progress."
                    : "我自己的代表作，也还在做。"}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-[#5C574D] md:text-lg">
                <p>
                  {lang === "en"
                    ? "Superlinear is the institution I am building around one belief: people should have a real chance to make work whose value outlives the moment of making and clearly bears their judgment and craft."
                    : "Superlinear是我围绕同一个信念建立的长期机构：让更多有专业积累的人，有机会把自己的判断和本事，做成在完成或首次发布以后仍继续创造价值、也清楚承载自己的作品。"}
                </p>
                <p>
                  {lang === "en"
                    ? "Public work, structured learning, a year-round membership, and enterprise practice form one institution. Each gives the same ambition a different place to grow: open exchange, systematic training, sustained exposure to strong work, and contact with organizational reality."
                    : "免费公共价值、系统训练、全年会员与企业实践，共同组成这所学院。它们让同一种追求在不同地方生长：开放交流、系统学习、持续接触好作品，以及进入组织现实。"}
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-[1.38fr_0.62fr]">
              <figure>
                <div className="overflow-hidden bg-[#E9E4DA]">
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
                <figcaption className="mt-3 text-xs leading-5 text-[#777064]">
                  {lang === "en"
                    ? "With Yage (Wang Yan), long-term teaching partner and technical authority for AI Builders."
                    : "与鸭哥（王言），AI Builders长期核心教学伙伴与技术权威。"}
                </figcaption>
              </figure>
              <figure>
                <div className="overflow-hidden bg-[#E9E4DA]">
                  <img
                    src="/english-network/doordash-ai-training.webp"
                    alt={
                      lang === "en"
                        ? "Yuzheng Sun leading an AI training session for DoorDash"
                        : "孙煜征为DoorDash团队做AI培训"
                    }
                    className="aspect-[16/9] w-full object-cover md:aspect-auto md:h-full"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-5 text-[#777064]">
                  {lang === "en"
                    ? "DoorDash team offsite · Seattle"
                    : "DoorDash团队线下AI培训 · 西雅图"}
                </figcaption>
              </figure>
            </div>

            <div className="mt-12 grid border-t border-[#DDD9D0] lg:grid-cols-2">
              {work[lang].map((item, index) => (
                <article
                  key={item.title}
                  className={cn(
                    "grid grid-cols-[2.6rem_1fr] gap-4 border-b border-[#DDD9D0] py-7 lg:px-8",
                    index % 2 === 1 && "lg:border-l"
                  )}
                >
                  <div className="font-mono text-xs text-[#9A673D]">
                    {item.number}
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
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#777064]">
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
              ))}
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
                  {lang === "en" ? "200+ CONVERSATIONS" : "200+场公开对话"}
                </SectionLabel>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "I keep learning from people who have actually built the thing."
                    : "我一直向真正把事情做出来的人学习。"}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-zinc-400">
                <p>
                  {lang === "en"
                    ? "These conversations are a source of first-hand input. I care less about collecting a guest's conclusions than understanding how they formed a standard, where the work failed, and why it eventually held together."
                    : "这些对话，是我持续获得一手信息的方式。比起收集嘉宾的结论，我更想知道：他的标准怎样形成，作品在哪里失败，又为什么最后能够成立。"}
                </p>
                <p className="text-sm leading-7 text-zinc-500">
                  {lang === "en"
                    ? "The work reaches a 400K+ audience across YouTube, Bilibili, and Xiaohongshu, including engineers, researchers, founders, investors, and operators across China and the U.S."
                    : "这些内容通过YouTube、B站和小红书触达400K+关注者，其中包括大量中美工程师、研究者、创始人、投资人与管理者。"}
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
                    ? "Browse all conversations"
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
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "Some understanding should be able to keep working without its author in the room."
                    : "有些理解，应该能够离开作者继续工作。"}
                </h2>
              </div>
              <div>
                <p className="text-base leading-8 text-[#5C574D] md:text-lg">
                  {lang === "en"
                    ? "Growth Data Analytics Playbook covers product-market fit, metrics, and experimentation. 真本事 asks how work becomes capability, leverage, and income of your own. Different subjects, same attempt: preserve judgment in a form another person can use."
                    : "《Growth Data Analytics Playbook》讨论产品市场匹配、指标和实验；《真本事》讨论怎样把工作变成自己的能力、杠杆和收入。主题不同，做的是同一件事：把判断留下来，变成别人也可以使用的作品。"}
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
                      : "孙煜征、共同作者李梦颖和Joe Kumar，以及Julie Zhuo在《Growth Data Analytics Playbook》发布活动现场"
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
                    : "《Growth Data Analytics Playbook》发布活动，与共同作者李梦颖和Joe Kumar，以及Julie Zhuo。"}
                </span>
                <span>
                  {lang === "en"
                    ? "Featured in a 2025 WSJ CIO Journal reading list"
                    : "入选《华尔街日报》CIO Journal 2025年书单"}
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-[#101521] py-14 md:py-20">
          <div className="container">
            <SectionLabel dark>
              {lang === "en"
                ? "FROM PEOPLE WHO KNOW THE WORK"
                : "来自了解这件事的人"}
            </SectionLabel>
            <div className="mt-8 grid border-t border-white/10 lg:grid-cols-2">
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

        <section className="bg-[#0B0F1A] py-16 md:py-24">
          <div className="container border-y border-white/10 py-12 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                  {lang === "en" ? "YOUR WORK" : "轮到你的作品"}
                </p>
                <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-[1.08] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "Your defining work will not arrive finished."
                    : "你的代表作，不会一开始就是代表作。"}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                  {lang === "en"
                    ? "You do not need a complete answer before you begin. Come see what people here are making, or bring an unfinished question and put it in contact with knowledge, peers, and reality."
                    : "你不必先拥有完整答案。可以先来看看这里的人正在做什么，也可以把还没做完的问题和作品带进来，让它早点遇到知识、同行和现实。"}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  asChild
                  className="bg-amber-400 text-[#211300] hover:bg-amber-300"
                >
                  <a
                    href="https://www.superlinear.academy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en"
                      ? "Join Superlinear Academy for free"
                      : "免费加入Superlinear Academy"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  <a
                    href="https://ai-builders.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en" ? "Explore AI Builders" : "了解AI Builders"}
                  </a>
                </Button>
                <Link
                  href={withLanguage("/collab", lang)}
                  className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-zinc-500 transition hover:text-white"
                >
                  <Handshake className="h-4 w-4" />
                  {lang === "en" ? "Collaborate with me" : "与我合作"}
                </Link>
              </div>
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
                ? "Cornell Economics PhD, author, and founder of Superlinear Academy and AI Builders. Make what lasts."
                : "康奈尔大学经济学博士、作者，Superlinear Academy与AI Builders创始人。做出你的代表作。"}
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
