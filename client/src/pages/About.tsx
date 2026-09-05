import DefiningWork from "@/components/DefiningWork";
import EducationEndorsements from "@/components/EducationEndorsements";
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
    zh: "数据与AI副总监",
  },
  {
    organization: "Statsig",
    en: "Principal Data Scientist and sole evangelist",
    zh: "Principal Data Scientist、公司唯一布道师",
  },
  {
    organization: "Superlinear Academy",
    en: "Founder",
    zh: "创始人",
  },
];

const currentWork = {
  en: [
    {
      name: "Superlinear Academy",
      role: "Free community",
      detail:
        "See how people use AI, share your work, and bring your questions. 20,000+ members, 700+ project posts, and 8,000+ project comments.",
      href: "https://www.superlinear.academy/",
    },
    {
      name: "AI Builders",
      role: "Long-term AI learning system",
      detail:
        "Understand AI systematically, build hands-on, and keep up as it changes. Co-taught with Yage.",
      href: "https://ai-builders.com/",
    },
    {
      name: "Stay Superlinear membership",
      role: "Long-term membership",
      detail:
        "Keep learning through guest masterclasses, deep technical analysis with Yage, Q&A, and member discussions. Recordings and resources stay available to members.",
      href: "https://staysuperlinear.com/",
    },
    {
      name: "Enterprise AI programs",
      role: "Organizational practice",
      detail:
        "Most teams begin with AI Builders by the seat. Dedicated cohorts, course customization, and fully custom programs add company-specific cases, evaluation, and delivery only when needed.",
      href: "/collab/enterprise",
      cta: "Enterprise options",
    },
  ],
  zh: [
    {
      name: "Superlinear Academy",
      role: "免费社区",
      detail:
        "看别人怎么用AI，分享自己的项目，也带着问题来讨论。2万+成员，700+项目帖，8,000+条项目评论。",
      href: "https://www.superlinear.academy/",
    },
    {
      name: "AI Builders",
      role: "长期AI学习体系",
      detail:
        "想系统学懂AI、真正动手、并持续跟上变化，选AI Builders 2027。由我和鸭哥共同授课。",
      href: "https://ai-builders.com/",
    },
    {
      name: "Stay Superlinear会员",
      role: "长期会员社区",
      detail:
        "跟大师课嘉宾深聊，跟鸭哥看懂技术变化，也把自己的问题带进答疑和会员讨论。回放与资料可以随时回来查。",
      href: "https://staysuperlinear.com/",
    },
    {
      name: "企业AI项目",
      role: "组织实践",
      detail:
        "多数团队从按席位采购AI Builders开始；只有确实需要时，才增加专属班、企业案例、评估与完整定制。",
      href: "/collab/enterprise",
      cta: "查看合作方式",
    },
  ],
};

const publicFacts = [
  {
    value: "200+",
    en: "public conversations with technology leaders and AI researchers",
    zh: "与科技领袖和AI研究者的公开对话",
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
        "I’m Yuzheng Sun, known as 立正 / 课代表立正. I have a PhD in Economics from Cornell and founded Superlinear Academy. I live in Seattle.",
      belief:
        "MAKE WHAT LASTS. I want to build things people keep choosing, long after the launch.",
      backgroundTitle: "Background",
      background:
        "I worked as an economist at Amazon, a data scientist at Meta, and Vice Director of Data & AI at Tencent IEG. I then joined early-stage Statsig, later acquired by OpenAI, before building Superlinear Academy full time.",
      currentTitle: "The academy I’m building",
      currentIntro:
        "Superlinear Academy is where my teaching, community, and enterprise work come together. You can begin with the free community.",
      publicTitle: "Books and conversations",
      publicIntro:
        "I co-authored Growth Data Analytics Playbook and wrote 真本事：从会工作到会赚钱. I host long-form conversations on my channel and join other shows as a guest.",
      sourcesTitle: "Sources and contact",
      reviewed:
        "Facts last reviewed September 2, 2026. Changing figures retain their check date.",
      books: "Books",
      hosted: "Interviews I host",
      appeared: "Guest appearances",
      invite: "Invite Yuzheng to a program",
    },
    zh: {
      back: "回到主页",
      eyebrow: "关于我",
      intro:
        "我是孙煜征，大家叫我立正。康奈尔经济学博士，超线性学院Superlinear Academy创始人，现居西雅图。",
      belief:
        "学点真本事，做点真东西。对我来说，就是离开职位和公司名，仍能做出别人需要的东西。",
      backgroundTitle: "经历",
      background:
        "我做过Amazon经济学家、Meta数据科学家和腾讯IEG数据与AI副总监，也是OpenAI收购团队Statsig的早期成员。现在全职建设Superlinear Academy。",
      currentTitle: "我正在办的这所学院",
      currentIntro:
        "课程、社区和企业项目，都在Superlinear Academy。想了解我们，可以先从免费社区开始。",
      publicTitle: "书与对话",
      publicIntro:
        "我合著了《Growth Data Analytics Playbook》，写了《真本事：从会工作到会赚钱》。也在自己的频道里做长访谈，去别人的节目做嘉宾。",
      sourcesTitle: "资料与联系",
      reviewed: "事实最后核对：2026年9月2日。会变化的数字保留各自的核对日期。",
      books: "两本书",
      hosted: "我采访过的人",
      appeared: "我做客的节目",
      invite: "邀请我上节目",
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
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-superlinear-on-dark">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
                {lang === "en" ? "Yuzheng Sun" : "立正"}
                <span className="mt-3 block text-lg font-normal leading-7 text-zinc-400 md:text-2xl">
                  {lang === "en"
                    ? "孙煜征 · 课代表立正"
                    : "孙煜征 · Yuzheng Sun · 课代表立正"}
                </span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-300 md:text-xl md:leading-9">
                {copy.intro}
              </p>
              <p className="mt-5 max-w-3xl border-l border-superlinear-on-dark/40 pl-5 text-base leading-8 text-zinc-400">
                {copy.belief}
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

        <section className="bg-superlinear-canvas py-16 text-superlinear-ink md:py-24">
          <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-superlinear-deep">
                {copy.backgroundTitle}
              </p>
              <p className="mt-5 text-lg leading-9 text-[#48443B]">
                {copy.background}
              </p>
              <a
                href="https://economics.cornell.edu/historical-placement-phd-students"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-link transition hover:text-superlinear-deep"
              >
                {lang === "en"
                  ? "Cornell Economics placement record"
                  : "康奈尔经济学博士去向记录"}
                <ExternalLink className="h-4 w-4" />
              </a>
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
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-superlinear-on-dark">
                {lang === "en" ? "Current work" : "现在在做"}
              </p>
              <h2 className="mt-5 text-3xl font-semibold text-white md:text-4xl">
                {copy.currentTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-zinc-400">
                {copy.currentIntro}
              </p>
            </div>
            <div className="mt-8 grid gap-px bg-white/10 md:grid-cols-2">
              {currentWork[lang].map(item => (
                <article key={item.name} className="bg-[#111722] p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-superlinear-on-dark">
                    {item.role}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {item.detail}
                  </p>
                  {item.href.startsWith("/") ? (
                    <Link
                      href={withLanguage(item.href, lang)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-on-dark"
                    >
                      {"cta" in item
                        ? item.cta
                        : lang === "en"
                          ? "Website"
                          : "官网"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-on-dark"
                    >
                      {"cta" in item
                        ? item.cta
                        : lang === "en"
                          ? "Website"
                          : "官网"}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12 md:pb-16">
          <div className="container">
            <EducationEndorsements />
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111722] py-16 md:py-20">
          <div className="container grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-superlinear-on-dark">
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
                  className="bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  <Link href={withLanguage("/book", lang)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {copy.books}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto max-w-full whitespace-normal border-white/20 bg-white/[0.03] py-2 text-center text-white hover:bg-white/[0.08]"
                >
                  <Link href={withLanguage("/guests", lang)}>
                    <Mic2 className="mr-2 h-4 w-4" />
                    {copy.hosted}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto max-w-full whitespace-normal border-white/20 bg-white/[0.03] py-2 text-center text-white hover:bg-white/[0.08]"
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
                  : "数据核对日期：2026年7月12日。"}
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container grid gap-8 border-y border-white/10 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-superlinear-on-dark">
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
                className="bg-superlinear text-white hover:bg-superlinear-deep"
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
        <DefiningWork />
      </main>
    </div>
  );
}
