import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { ABOUT_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildAboutStructuredData } from "@shared/structured-data";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  MapPin,
  Mic2,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

const career = [
  {
    organization: "Cornell University",
    en: "PhD in Economics",
    zh: "经济学博士",
  },
  { organization: "Amazon", en: "Economist", zh: "经济学家" },
  { organization: "Meta", en: "Data Scientist", zh: "数据科学家" },
  {
    organization: "Tencent IEG",
    en: "Vice Director, Data & AI",
    zh: "数据与 AI 副总监",
  },
  {
    organization: "Statsig",
    en: "Principal Data Scientist and sole evangelist",
    zh: "首席数据科学家与唯一布道师",
  },
  {
    organization: "Superlinear Academy & AI Builders",
    en: "Founder",
    zh: "创始人",
  },
];

const currentWork = {
  en: [
    {
      name: "Superlinear Academy",
      role: "Open learning community",
      detail:
        "A free community where people share AI resources, projects, questions, and what they are learning.",
      href: "https://www.superlinear.academy/",
    },
    {
      name: "AI Builders",
      role: "Project-based learning program",
      detail:
        "A structured way to learn by building real AI workflows, products, and systems.",
      href: "https://ai-builders.com/",
    },
    {
      name: "Stay Superlinear",
      role: "Long-term membership",
      detail:
        "A membership co-led with Yage for people who are already using AI in substantive work and want to keep improving together.",
      href: "https://staysuperlinear.com/",
    },
  ],
  zh: [
    {
      name: "Superlinear Academy",
      role: "免费开放社区",
      detail: "大家在这里分享 AI 资料、作品、问题和自己的学习进展。",
      href: "https://www.superlinear.academy/",
    },
    {
      name: "AI Builders",
      role: "AI 实战学习项目",
      detail: "从真实项目出发，学习搭建可靠的 AI 工作流、产品和系统。",
      href: "https://ai-builders.com/",
    },
    {
      name: "Stay Superlinear",
      role: "长期会员社区",
      detail: "面向已经把 AI 用进真实工作的人，由立正和鸭哥共同主理。",
      href: "https://staysuperlinear.com/",
    },
  ],
};

const publicFacts = [
  {
    value: "200+",
    en: "public conversations hosted; this is a conversation count, not a count of unique guests",
    zh: "主持的公开对话场次；这是对话数，不是独立嘉宾数",
  },
  {
    value: "400K+",
    en: "cross-platform audience",
    zh: "跨平台关注者",
  },
  {
    value: "3,000+",
    en: "paying learners across AI, data, and growth",
    zh: "AI、数据与增长领域的付费学员",
  },
];

export default function About() {
  const { lang } = useLanguage();
  const meta = ABOUT_PAGE_META[lang];

  useEffect(() => {
    return applyPageSeo({
      ...meta,
      type: "profile",
      locale: lang === "en" ? "en_US" : "zh_CN",
      alternates: languageAlternates(
        ABOUT_PAGE_META.en.canonical,
        ABOUT_PAGE_META.zh.canonical
      ),
      jsonLd: buildAboutStructuredData(lang, meta.canonical),
    });
  }, [lang, meta]);

  const copy = pick(lang, {
    en: {
      back: "Back to homepage",
      eyebrow: "About Yuzheng Sun",
      intro:
        "Yuzheng Sun (孙煜征), also known publicly as 课代表立正, has a PhD in Economics from Cornell and is the founder of Superlinear Academy and AI Builders. He is based in Seattle.",
      backgroundTitle: "Background",
      background:
        "He has worked as an economist, data scientist, and technology leader at Amazon, Meta, Tencent IEG, and Statsig. His work now spans AI education, communities, books, enterprise programs, and long-form public conversations.",
      currentTitle: "What he is building now",
      currentIntro:
        "Three related but separate efforts around learning, building, and doing substantive work with AI.",
      publicTitle: "Books and conversations",
      publicIntro:
        "He is the co-author of Growth Data Analytics Playbook and the author of 真本事：从会工作到会赚钱. He also hosts the 课代表立正 channel and appears as a guest on other podcasts and video programs.",
      statsigNote:
        "Statsig was acquired by OpenAI in 2025, after Yuzheng had left the company.",
      statsigSource: "OpenAI acquisition announcement",
      sourcesTitle: "Sources and contact",
      reviewed:
        "Facts last reviewed July 21, 2026. Changing figures retain their check date.",
      books: "Books",
      hosted: "People Yuzheng has interviewed",
      appeared: "Programs where Yuzheng appeared as a guest",
      invite: "Invite Yuzheng to a program",
    },
    zh: {
      back: "回到主页",
      eyebrow: "关于课代表立正",
      intro:
        "课代表立正是孙煜征公开做内容时使用的名字。他有康奈尔大学经济学博士学位，创办了 Superlinear Academy 和 AI Builders，现居西雅图。",
      backgroundTitle: "经历",
      background:
        "他在 Amazon 做过经济学家，在 Meta 做过数据科学家，后来任腾讯 IEG 数据与 AI 副总监，也曾任 Statsig 首席数据科学家与唯一布道师。现在主要做 AI 教育、社区和企业项目，同时写书、做访谈。",
      currentTitle: "现在主要在做什么",
      currentIntro: "三件事都围绕 AI 学习与实践展开，各自解决不同的问题。",
      publicTitle: "书与对话",
      publicIntro:
        "他合著了 Growth Data Analytics Playbook，也是《真本事：从会工作到会赚钱》的作者。他在自己的频道里主持长访谈，也会去其他播客和视频节目做嘉宾。",
      statsigNote: "Statsig 于 2025 年被 OpenAI 收购；孙煜征在收购前已经离开。",
      statsigSource: "OpenAI 收购公告",
      sourcesTitle: "资料与联系",
      reviewed:
        "事实最后核对：2026 年 7 月 21 日。会变化的数字保留各自的核对日期。",
      books: "两本书",
      hosted: "孙煜征采访过的嘉宾",
      appeared: "孙煜征去别人节目做嘉宾的记录",
      invite: "邀请孙煜征参与节目",
    },
  });

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/90 backdrop-blur-xl">
        <div className="container flex h-[68px] items-center justify-between">
          <Link
            href={withLanguage("/", lang)}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <LanguageToggle size="sm" />
        </div>
      </nav>

      <main>
        <section className="border-b border-white/10 py-16 md:py-24">
          <div className="container grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
                <span className="block text-zinc-400">
                  {lang === "en"
                    ? "孙煜征 · 课代表立正"
                    : "孙煜征 · Yuzheng Sun"}
                </span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-300 md:text-xl md:leading-9">
                {copy.intro}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/10">
              {[
                [lang === "en" ? "Based in" : "现居", "Seattle / 西雅图"],
                [
                  lang === "en" ? "Education" : "学历",
                  lang === "en"
                    ? "Cornell PhD in Economics"
                    : "康奈尔经济学博士",
                ],
                [lang === "en" ? "Public name" : "公开名称", "课代表立正"],
                [
                  lang === "en" ? "Current role" : "现在",
                  lang === "en" ? "Founder · Author" : "创始人 · 作者",
                ],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#111722] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F2F0EA] py-16 text-[#191712] md:py-24">
          <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8B4A19]">
                {copy.backgroundTitle}
              </p>
              <p className="mt-5 text-lg leading-9 text-[#48443B]">
                {copy.background}
              </p>
              <a
                href="https://economics.cornell.edu/historical-placement-phd-students"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#743B13]"
              >
                {lang === "en"
                  ? "Cornell Economics placement record"
                  : "Cornell Economics 博士去向记录"}
                <ExternalLink className="h-4 w-4" />
              </a>
              <p className="mt-7 border-t border-[#D4D0C7] pt-5 text-sm leading-7 text-[#6E685D]">
                {copy.statsigNote}{" "}
                <a
                  href="https://openai.com/index/vijaye-raji-to-become-cto-of-applications-with-acquisition-of-statsig/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#743B13]"
                >
                  {copy.statsigSource}
                </a>
              </p>
            </div>
            <div className="grid border-t border-[#D4D0C7] sm:grid-cols-2 lg:grid-cols-3">
              {career.map(item => (
                <div
                  key={item.organization}
                  className="border-b border-[#D4D0C7] p-5 sm:border-l"
                >
                  <p className="font-semibold">{item.organization}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6E685D]">
                    {lang === "en" ? item.en : item.zh}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                {lang === "en" ? "Current work" : "现在在做"}
              </p>
              <h2 className="mt-5 text-3xl font-semibold text-white md:text-4xl">
                {copy.currentTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-zinc-400">
                {copy.currentIntro}
              </p>
            </div>
            <div className="mt-8 grid gap-px bg-white/10 lg:grid-cols-3">
              {currentWork[lang].map(item => (
                <article key={item.name} className="bg-[#111722] p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
                    {item.role}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {item.detail}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-300"
                  >
                    {lang === "en" ? "Website" : "官网"}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111722] py-16 md:py-20">
          <div className="container grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                {lang === "en" ? "Books and conversations" : "书与对话"}
              </p>
              <h2 className="mt-5 text-3xl font-semibold text-white md:text-4xl">
                {copy.publicTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-zinc-400">
                {copy.publicIntro}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-amber-400 text-[#211300] hover:bg-amber-300"
                >
                  <Link href={withLanguage("/book", lang)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {copy.books}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  <Link href={withLanguage("/guests", lang)}>
                    <Mic2 className="mr-2 h-4 w-4" />
                    {copy.hosted}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  <Link
                    href={`${withLanguage("/collab/creators", lang)}#conversations`}
                  >
                    {copy.appeared}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
              {publicFacts.map(item => (
                <div key={item.value} className="bg-[#0B0F1A] p-6">
                  <p className="text-3xl font-semibold text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {lang === "en" ? item.en : item.zh}
                  </p>
                </div>
              ))}
              <p className="bg-[#0B0F1A] p-4 text-xs leading-5 text-zinc-600 sm:col-span-3 lg:col-span-1">
                {lang === "en"
                  ? "Figures checked July 12, 2026."
                  : "数据核对日期：2026 年 7 月 12 日。"}
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container grid gap-8 border-y border-white/10 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-amber-300">
                <MapPin className="h-4 w-4" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
                  Seattle / 西雅图
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white md:text-4xl">
                {copy.sourcesTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                {copy.reviewed}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                asChild
                className="bg-amber-400 text-[#211300] hover:bg-amber-300"
              >
                <Link href={withLanguage("/collab/creators", lang)}>
                  {copy.invite}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <a
                href="https://github.com/sunyuzheng/yuzheng-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
              >
                {lang === "en" ? "Public source kit" : "公开事实资料库"}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
