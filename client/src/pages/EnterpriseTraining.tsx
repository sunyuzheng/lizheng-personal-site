import CollabHeader from "@/components/collab/CollabHeader";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ExternalLink,
  FileSearch,
  Mail,
  PanelsTopLeft,
  Route,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { ENTERPRISE_TRAINING_PAGE_META } from "../../../shared/collab-meta";
import { languageAlternates } from "../../../shared/page-meta";
import { buildEnterpriseTrainingStructuredData } from "../../../shared/structured-data";

const copy = {
  en: {
    section: "Enterprise AI training",
    eyebrow: "ENTERPRISE AI TRAINING & CUSTOM PROGRAMS",
    title: "The work should be different after the training.",
    titleLines: null,
    intro:
      "When a team needs shared capability, AI Builders is the direct route. When the work itself needs to change, we start with the roles, workflows, materials, and evaluation—then design the program, cases, and tools the team actually needs.",
    proof: "13 cohorts · 3,000+ paid learners · 5.0/5 on Maven",
    primaryCta: "Compare the formats",
    secondaryCta: "Open the team brief (PDF)",
    anchorLabel: "FULLY CUSTOM ENTERPRISE PROGRAM",
    anchorPrice: "$100,000+",
    anchorDetail:
      "Start with the work. Leave the team with a program, cases, tools, and evaluation standards it can keep using.",
    anchorNote: "Research · Design · Live delivery · Review",
    anchorCta: "Discuss a custom program",
    reviewsEyebrow: "PUBLIC MAVEN REVIEWS",
    reviewsTitle: "What learners actually took from the course",
    reviewsIntro:
      "These are public Maven reviews. Titles and employers identify the reviewers, not employer endorsements.",
    reviews: [
      {
        quote:
          "There are many courses teaching you specific tricks but this course helps you build the right mindset and empower you to teach yourself more effectively.",
        name: "Shuyang",
        role: "Member of Technical Staff",
        company: "OpenAI",
        note: "Former Sr. AI Manager · Uber",
      },
      {
        quote:
          "There can be different new tools coming, but principles remain!",
        name: "EZ",
        role: "Engineer",
        company: "Anthropic",
      },
      {
        quote:
          "The content and instruction are both outstanding and very engaging.",
        name: "Chairy",
        role: "UX Manager",
        company: "Google",
      },
    ],
    reviewsCta: "Read public reviews on Maven",
    individualNote:
      "I do not sell paid consulting to individuals. Join Superlinear Academy for free and ask in the community; I answer individual questions there for free.",
    communityCta: "Ask in the free community",
    formatsEyebrow: "FIVE WAYS TO WORK TOGETHER",
    formatsTitle: "Start with the simplest useful step.",
    formatsIntro:
      "Start with what must change: shared capability, course content, or the work itself.",
    formats: [
      {
        number: "01",
        label: "ORGANIZATION SESSION",
        title: "Work through one real question",
        price: "From $2,000",
        detail:
          "Clarify the result, test the key assumptions, and decide whether the next step is an internal session, team enrollment, or a custom program.",
        cta: "Discuss a working session",
        href: "advisory",
        featured: false,
      },
      {
        number: "02",
        label: "TEAM ENROLLMENT",
        title: "Bring AI Builders to your team",
        price: "$1,999 per learner",
        detail:
          "Join a scheduled cohort. Teams of 2–9 receive 20% off; teams of 10 or more receive 25% off.",
        cta: "View AI Builders",
        href: "https://maven.com/superlinear/aibuilders",
        featured: false,
      },
      {
        number: "03",
        label: "PRIVATE COHORT",
        title: "Give one organization its own cohort",
        price: "30 learners · $44,977.50+",
        detail:
          "Use the standard AI Builders curriculum on dates agreed with your team.",
        cta: "Discuss a private cohort",
        href: "training",
        featured: false,
      },
      {
        number: "04",
        label: "COURSE CUSTOMIZATION",
        title: "Adapt what the course teaches",
        price: "$20,000+ · plus tuition",
        detail:
          "Add company-specific cases, exercises, or material when they change what the team needs to learn. Tuition is separate.",
        cta: "Discuss course customization",
        href: "training",
        featured: false,
      },
      {
        number: "05",
        label: "FULLY CUSTOM ENTERPRISE PROGRAM",
        title: "Start with the business problem",
        price: "From $100,000",
        detail:
          "Study the roles, workflows, materials, and evaluation; then design the program and delivery for one organization.",
        cta: "Discuss a custom program",
        href: "training",
        featured: true,
      },
    ],
    pricingNote:
      "Planning prices in USD, before applicable taxes. Seat prices reflect current US AI Builders 2027 team pricing; final scope, faculty, schedule, payment, cancellation terms, and taxes are set in the quote and order form.",
    pdfEyebrow: "TEAM PROCUREMENT BRIEF · PDF",
    pdfTitle: "Forward this two-page brief to your team.",
    pdfBody:
      "Course outcomes, faculty, public reviews, team pricing, private cohorts, customization, and procurement details are all in one place.",
    pdfMeta: "PDF · 2 pages · English · September 2026",
    pdfCta: "Open the team brief",
    workEyebrow: "FULLY CUSTOM PROGRAMS",
    workTitle: "Full customization starts with the work.",
    workIntro:
      "Start with the work itself. Then design the program and delivery around it.",
    confidentialityLabel: "SENSITIVE CONTEXT STAYS WITH THE WORK",
    confidentialityDetail:
      "Real company materials are used only for the agreed delivery. Client names, materials, and project details are not published without explicit permission.",
    workSteps: [
      {
        title: "See the real work",
        detail:
          "Work with the people doing it. Examine the workflow, materials, handoffs, and recurring points of failure.",
      },
      {
        title: "Decide how people and AI divide the work",
        detail:
          "Define what AI does, what judgment stays with people, who owns the result, and how it will be evaluated.",
      },
      {
        title: "Leave the method with the team",
        detail:
          "Turn the decisions into a program, cases, tools, templates, and materials the team can keep using.",
      },
    ],
    evidenceEyebrow: "COURSE DEPTH · ENTERPRISE REALITY",
    evidenceTitle:
      "The course is refined in public cohorts and tested in real organizations.",
    evidenceBody:
      "AI Builders has been taught across 13 cohorts and 3,000+ paid learners. Inside a team, the test becomes concrete: will people adopt it, can the result be evaluated, and does the method remain after the session ends?",
    evidenceCaption: "DoorDash Analytics team offsite · Seattle",
    publicWorkLabel: "Selected public team trainings and internal sessions",
    publicWorkNames: "Tencent · Meituan · Xiaohongshu · Pinterest · DoorDash",
    publicWorkNote:
      "These are public trainings and internal sessions. Full custom engagements are named only with client permission.",
    faculty:
      "AI Builders is co-taught by Yuzheng Sun and Yan Wang. Faculty and delivery roles for each enterprise engagement are named in the proposal and order form.",
    decksCta: "Browse selected enterprise decks",
    closeEyebrow: "START WITH ONE CONCRETE CHANGE",
    closeTitle: "Tell us what should be different after the training.",
    closeBody:
      "Include the team, the problem today, the result you want to change, and the rough timing. We will recommend the most useful starting point.",
    closeCta: "Email Yuzheng",
    collabCta: "See all collaboration options",
  },
  zh: {
    section: "企业AI培训",
    eyebrow: "企业AI培训与定制",
    title: "培训结束以后，工作应该真的变了。",
    titleLines: ["培训结束以后，", "工作应该真的变了。"],
    intro:
      "团队要补共性能力，就直接用AI Builders。要改变一套真实工作，我们会先看岗位、流程、材料和结果怎么验收，再决定该做什么课程、案例与工具。",
    proof: "13期教学 · 3,000+付费学员 · Maven 5.0/5",
    primaryCta: "查看合作方式",
    secondaryCta: "打开团队方案PDF",
    anchorLabel: "完整定制企业项目",
    anchorPrice: "$100,000起",
    anchorDetail:
      "从真实工作开始，把判断做成团队能继续使用的课程、案例、工具与验收方式。",
    anchorNote: "研究 · 设计 · 现场交付 · 复盘",
    anchorCta: "讨论完整定制",
    reviewsEyebrow: "Maven公开评价",
    reviewsTitle: "他们在课里真正带走了什么。",
    reviewsIntro:
      "以下均为Maven公开评价；任职信息用于说明评价者背景，不代表雇主背书。",
    reviews: [
      {
        quote:
          "There are many courses teaching you specific tricks but this course helps you build the right mindset and empower you to teach yourself more effectively.",
        name: "Shuyang",
        role: "Member of Technical Staff",
        company: "OpenAI",
        note: "Former Sr. AI Manager · Uber",
      },
      {
        quote:
          "There can be different new tools coming, but principles remain!",
        name: "EZ",
        role: "Engineer",
        company: "Anthropic",
      },
      {
        quote:
          "The content and instruction are both outstanding and very engaging.",
        name: "Chairy",
        role: "UX Manager",
        company: "Google",
      },
    ],
    reviewsCta: "在Maven查看公开评价",
    individualNote:
      "我不接面向个人的付费咨询。个人问题欢迎免费加入Superlinear Academy公开提问，我会在社区里免费回答。",
    communityCta: "去免费社区提问",
    formatsEyebrow: "五种合作方式",
    formatsTitle: "从够用的那一步开始。",
    formatsIntro:
      "先看眼下要改变什么：补齐共性能力、调整课程内容，还是重新设计一项真实工作。",
    formats: [
      {
        number: "01",
        label: "团队问题梳理会或内部交流",
        title: "先把一个真实问题讲清楚",
        price: "$2,000起",
        detail:
          "围绕一个组织问题，澄清目标、验证关键假设，再判断下一步是内部交流、团队购课还是定制。",
        cta: "讨论一次团队交流",
        href: "advisory",
        featured: false,
      },
      {
        number: "02",
        label: "团队购课",
        title: "让团队一起学AI Builders",
        price: "$1,999/人",
        detail: "加入公开班；2–9人八折，10人起七五折。",
        cta: "查看AI Builders",
        href: "https://maven.com/superlinear/aibuilders",
        featured: false,
      },
      {
        number: "03",
        label: "企业专属班",
        title: "为一家企业单独开班",
        price: "30人起 · $44,977.50起",
        detail: "沿用AI Builders标准课程，由双方共同确定日期。",
        cta: "咨询企业专属班",
        href: "training",
        featured: false,
      },
      {
        number: "04",
        label: "课程定制",
        title: "把企业自己的内容放进课程",
        price: "另加$20,000起",
        detail:
          "当企业案例、材料或工作方式改变了要学和要练的内容，再增加课程定制；学费另计。",
        cta: "咨询课程定制",
        href: "training",
        featured: false,
      },
      {
        number: "05",
        label: "完整定制企业项目",
        title: "从业务问题开始",
        price: "$100,000起",
        detail:
          "研究岗位、流程、材料与验收方式，再为一家组织设计完整项目和交付。",
        cta: "讨论完整定制",
        href: "training",
        featured: true,
      },
    ],
    pricingNote:
      "以上为美元未税参考价。席位价格基于当前AI Builders 2027美国区团队方案；最终范围、讲师、时间、付款、取消条款与税费，以正式报价和双方签署的订单确认书（order form）为准。",
    pdfEyebrow: "团队采购说明 · PDF",
    pdfTitle: "把这两页材料，直接转给同事。",
    pdfBody:
      "课程、讲师、公开评价、团队价格、专属班、定制方式与采购信息都在里面。",
    pdfMeta: "PDF · 2页 · 英文 · 2026年9月",
    pdfCta: "打开团队方案PDF",
    workEyebrow: "完整定制企业项目",
    workTitle: "完整定制，从真实工作开始。",
    workIntro: "先看真实工作，再决定课程和交付应该长什么样。",
    confidentialityLabel: "敏感上下文只用于交付",
    confidentialityDetail:
      "企业真实材料只用于约定交付；未经明确许可，不公开客户名称、材料或项目细节。",
    workSteps: [
      {
        title: "看真实工作",
        detail: "和真正做事的人一起看流程、材料、交接和最常见的卡点。",
      },
      {
        title: "决定人和AI怎么分工",
        detail: "AI做什么、人保留什么判断、谁对结果负责，最后怎样验收。",
      },
      {
        title: "把做法留在团队里",
        detail: "把结论做成课程、案例、工具、模板和团队能继续使用的材料。",
      },
    ],
    evidenceEyebrow: "课程深度 · 企业现实",
    evidenceTitle: "课程在公开班里反复打磨，也在企业现场接受现实检验。",
    evidenceBody:
      "AI Builders已经经历13期教学和3,000+名付费学员。进入企业现场，检验会变得更具体：团队是否真的采用，结果能否验收，做法能不能留下来。",
    evidenceCaption: "DoorDash Analytics团队线下培训 · 西雅图",
    publicWorkLabel: "部分可公开的企业培训与内部分享",
    publicWorkNames: "腾讯 · 美团 · 小红书 · Pinterest · DoorDash",
    publicWorkNote:
      "以上为可公开的培训与内部分享；完整定制项目仅在客户许可后具名。",
    faculty:
      "AI Builders由立正与鸭哥共同授课。企业项目由谁参与、分别负责什么，会写进提案与订单确认书。",
    decksCta: "查看精选企业课件",
    closeEyebrow: "从一个具体变化开始",
    closeTitle: "告诉我们：培训结束以后，什么应该真的变了。",
    closeBody:
      "写清团队、眼下的问题、希望改变的结果和大概时间。我们会直接建议最合适的合作方式。",
    closeCta: "发邮件给立正",
    collabCta: "查看全部合作方式",
  },
};

const workIcons = [FileSearch, Route, PanelsTopLeft];

function buildMailto(
  lang: "en" | "zh",
  kind: "training" | "advisory" = "training"
) {
  const subject =
    lang === "en"
      ? kind === "advisory"
        ? "Organization session with Yuzheng Sun"
        : "Enterprise AI training with Yuzheng Sun"
      : kind === "advisory"
        ? "团队问题梳理会或内部交流"
        : "企业AI培训合作";
  const body =
    lang === "en"
      ? "Organization and my role:\n\nTeam size and roles:\n\nWhat should be different after the training:\n\nWhat we have already tried:\n\nTiming, decision owner, and budget range:\n"
      : "公司与我的职责：\n\n团队人数与岗位：\n\n希望培训后发生什么变化：\n\n已经尝试过什么：\n\n时间、决策人和预算范围：\n";
  return `mailto:yz@superlinear.academy?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function EnterpriseTraining() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const meta = ENTERPRISE_TRAINING_PAGE_META[lang];
  const mailto = buildMailto(lang);
  const advisoryMailto = buildMailto(lang, "advisory");

  useEffect(
    () =>
      applyPageSeo({
        ...meta,
        locale: lang === "zh" ? "zh_CN" : "en_US",
        alternates: languageAlternates(
          ENTERPRISE_TRAINING_PAGE_META.en.canonical,
          ENTERPRISE_TRAINING_PAGE_META.zh.canonical
        ),
        jsonLd: buildEnterpriseTrainingStructuredData(lang),
        imageAlt:
          lang === "en"
            ? "Yuzheng Sun leading enterprise AI training at DoorDash in Seattle"
            : "孙煜征在西雅图为DoorDash团队进行企业AI培训",
      }),
    [lang, meta]
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-[#09110C] text-zinc-100">
      <CollabHeader
        backHref="/collab"
        section={{ en: "Enterprise AI training", zh: "企业AI培训" }}
      />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[#09110C]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(35,131,67,0.16),transparent_34rem)]" />
          <div className="container relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-16">
            <div>
              <p
                className={cn(
                  "font-mono text-xs leading-5 text-superlinear-on-dark",
                  lang === "en"
                    ? "uppercase tracking-[0.2em]"
                    : "tracking-[0.1em]"
                )}
              >
                {t.eyebrow}
              </p>
              <h1 className="mt-6 max-w-4xl text-[2rem] font-semibold leading-[1.04] tracking-[-0.025em] text-white [text-wrap:balance] min-[360px]:text-[2.35rem] sm:text-5xl md:text-6xl">
                {t.titleLines
                  ? t.titleLines.map(line => (
                      <span key={line} className="block whitespace-nowrap">
                        {line}
                      </span>
                    ))
                  : t.title}
              </h1>
              <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg md:leading-9">
                {t.intro}
              </p>
              <p className="mt-6 border-l-2 border-superlinear pl-4 text-sm leading-7 text-zinc-400">
                {t.proof}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#formats"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-superlinear text-white hover:bg-superlinear-deep"
                  )}
                >
                  {t.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="/enterprise/AI-Builders-2027-for-Teams.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                  )}
                >
                  {t.secondaryCta}
                </a>
              </div>
            </div>

            <aside className="border border-superlinear-on-dark/30 bg-[#123521] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.25)] md:p-9">
              <p
                className={cn(
                  "font-mono text-[11px] leading-5 text-superlinear-on-dark",
                  lang === "en"
                    ? "uppercase tracking-[0.18em]"
                    : "tracking-[0.1em]"
                )}
              >
                {t.anchorLabel}
              </p>
              <p className="mt-5 whitespace-nowrap text-[2.3rem] font-semibold leading-none tracking-[-0.04em] text-white min-[360px]:text-[3.25rem] sm:text-6xl">
                {t.anchorPrice}
              </p>
              <p className="mt-6 text-base leading-8 text-white/80">
                {t.anchorDetail}
              </p>
              <p className="mt-7 border-t border-white/15 pt-5 text-sm leading-7 text-white/55">
                {t.anchorNote}
              </p>
              <a
                href={mailto}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-on-dark transition hover:text-white"
              >
                {t.anchorCta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </section>

        <section className="border-b border-[#D6D1C7] bg-superlinear-canvas py-14 text-superlinear-ink md:py-20">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.58fr_1.42fr] lg:items-end lg:gap-16">
              <div>
                <p
                  className={cn(
                    "font-mono text-[11px] leading-5 text-superlinear-deep",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {t.reviewsEyebrow}
                </p>
                <p className="mt-4 text-[4.25rem] font-semibold leading-none tracking-[-0.055em] text-[#173C2A] sm:text-7xl">
                  5.0<span className="text-3xl text-[#777064]"> / 5</span>
                </p>
              </div>
              <div>
                <h2 className="max-w-3xl text-3xl font-semibold leading-[1.12] [text-wrap:balance] md:text-4xl">
                  {t.reviewsTitle}
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5C574D] md:text-base">
                  {t.reviewsIntro}
                </p>
                <a
                  href="https://maven.com/superlinear/aibuilders#reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-link transition hover:text-superlinear-deep"
                >
                  {t.reviewsCta}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="mt-10 grid border-t border-[#CFC9BE] lg:grid-cols-3">
              {t.reviews.map((review, index) => (
                <figure
                  key={review.name}
                  className={cn(
                    "flex flex-col border-b border-[#CFC9BE] py-7 lg:px-7 lg:py-8",
                    index > 0 && "lg:border-l"
                  )}
                >
                  <blockquote className="text-base font-medium leading-7 text-[#26231D]">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="mt-6 border-t border-[#CFC9BE] pt-5 text-xs leading-5 text-[#5C574D]">
                    <span className="block text-xl font-semibold tracking-[-0.02em] text-[#173C2A]">
                      {review.company}
                    </span>
                    <span className="mt-1 block font-medium text-[#4E493F]">
                      {review.name} · {review.role}
                    </span>
                    {"note" in review && review.note ? (
                      <span className="mt-1 block">{review.note}</span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section
          id="formats"
          className="scroll-mt-[76px] bg-superlinear-canvas py-16 text-superlinear-ink md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-20">
              <div>
                <p
                  className={cn(
                    "font-mono text-xs leading-5 text-superlinear-deep",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {t.formatsEyebrow}
                </p>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {t.formatsTitle}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-[#5C574D] md:text-lg">
                {t.formatsIntro}
              </p>
            </div>

            <div className="mt-12 border-t border-[#CFC9BE]">
              {t.formats.map(format => {
                const href =
                  format.href === "training"
                    ? mailto
                    : format.href === "advisory"
                      ? advisoryMailto
                      : format.href;
                const isExternal = href.startsWith("http");
                return (
                  <article
                    key={format.number}
                    className={cn(
                      "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-[#CFC9BE] px-5 py-7 xl:grid-cols-[2.5rem_minmax(0,0.9fr)_minmax(14rem,0.7fr)_minmax(0,1.15fr)_14.5rem] xl:items-start xl:gap-6 xl:px-6",
                      format.featured &&
                        "border-l-4 border-l-superlinear bg-superlinear-pale"
                    )}
                  >
                    <span
                      className={cn(
                        "row-span-4 font-mono text-xs xl:row-span-1",
                        format.featured
                          ? "text-superlinear-deep/55"
                          : "text-[#797268]"
                      )}
                    >
                      {format.number}
                    </span>
                    <div>
                      <p
                        className={cn(
                          "font-mono text-[10px] leading-5",
                          lang === "en"
                            ? "uppercase tracking-[0.15em]"
                            : "tracking-[0.08em]",
                          "text-superlinear-deep"
                        )}
                      >
                        {format.label}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold leading-7 md:text-xl">
                        {format.title}
                      </h3>
                    </div>
                    <p
                      className={cn(
                        "text-xl font-semibold leading-7 tracking-[-0.02em] xl:whitespace-nowrap xl:text-right",
                        format.featured
                          ? "text-superlinear-ink"
                          : "text-[#173C2A]"
                      )}
                    >
                      {format.price}
                    </p>
                    <p
                      className={cn(
                        "text-sm leading-7",
                        format.featured
                          ? "text-superlinear-body"
                          : "text-[#5C574D]"
                      )}
                    >
                      {format.detail}
                    </p>
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={cn(
                        "inline-flex max-w-full items-center gap-2 self-start text-sm font-semibold xl:justify-self-end xl:whitespace-nowrap",
                        format.featured
                          ? "text-superlinear-link hover:text-superlinear-deep"
                          : "text-superlinear-deep hover:text-superlinear"
                      )}
                    >
                      {format.cta}
                      {isExternal ? (
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      ) : (
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      )}
                    </a>
                  </article>
                );
              })}
            </div>

            <p className="mt-6 max-w-5xl text-xs leading-6 text-[#5C574D]">
              {t.pricingNote}
            </p>

            <div className="mt-6 flex flex-col gap-3 border-l-2 border-superlinear pl-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <p className="max-w-4xl text-sm leading-7 text-[#5C574D]">
                {t.individualNote}
              </p>
              <a
                href="https://www.superlinear.academy/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-superlinear-link transition hover:text-superlinear-deep"
              >
                {t.communityCta}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-12 grid overflow-hidden border border-[#CFC9BE] bg-white lg:grid-cols-[0.74fr_1.26fr]">
              <figure className="border-b border-[#CFC9BE] bg-superlinear-pale p-5 lg:border-b-0 lg:border-r lg:p-7">
                <img
                  src="/enterprise/ai-builders-2027-for-teams-preview.webp"
                  alt={
                    lang === "en"
                      ? "Preview of the AI Builders 2027 for Teams procurement brief"
                      : "AI Builders 2027团队采购说明PDF预览"
                  }
                  className="mx-auto w-full max-w-md border border-black/10 bg-white shadow-[0_18px_55px_rgba(23,60,42,0.16)]"
                  width={1224}
                  height={1584}
                  loading="lazy"
                />
              </figure>
              <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
                <p
                  className={cn(
                    "font-mono text-[11px] leading-5 text-superlinear-deep",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {t.pdfEyebrow}
                </p>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] [text-wrap:balance] md:text-4xl">
                  {t.pdfTitle}
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5C574D] md:text-base">
                  {t.pdfBody}
                </p>
                <p className="mt-5 font-mono text-[11px] tracking-[0.08em] text-[#5C574D]">
                  {t.pdfMeta}
                </p>
                <a
                  href="/enterprise/AI-Builders-2027-for-Teams.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-7 w-fit bg-superlinear text-white hover:bg-superlinear-deep"
                  )}
                >
                  {t.pdfCta}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#173C2A] py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
              <div>
                <p
                  className={cn(
                    "font-mono text-xs leading-5 text-superlinear-on-dark",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {t.workEyebrow}
                </p>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "zh" ? (
                    <>
                      完整定制，
                      <span className="block whitespace-nowrap">
                        从真实工作开始。
                      </span>
                    </>
                  ) : (
                    t.workTitle
                  )}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                {t.workIntro}
              </p>
            </div>

            <div className="mt-12 grid border-t border-white/20 md:grid-cols-3">
              {t.workSteps.map((step, index) => {
                const Icon = workIcons[index];
                return (
                  <article
                    key={step.title}
                    className={cn(
                      "border-b border-white/20 py-7 md:px-6 md:py-9",
                      index > 0 && "md:border-l"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="h-5 w-5 text-superlinear-on-dark" />
                      <span className="font-mono text-xs text-white/35">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/60">
                      {step.detail}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 grid gap-3 border border-white/20 bg-black/10 p-5 md:grid-cols-[0.34fr_1fr] md:items-start md:gap-10 md:p-7">
              <p
                className={cn(
                  "font-mono text-[10px] leading-5 text-superlinear-on-dark",
                  lang === "en"
                    ? "uppercase tracking-[0.15em]"
                    : "tracking-[0.08em]"
                )}
              >
                {t.confidentialityLabel}
              </p>
              <p className="text-sm leading-7 text-white/65">
                {t.confidentialityDetail}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 text-superlinear-ink md:py-24">
          <div className="container grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
            <figure>
              <div className="overflow-hidden bg-[#E9E4DA]">
                <img
                  src="/english-network/doordash-ai-training.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun leading an AI training session for DoorDash in Seattle"
                      : "孙煜征在西雅图为DoorDash团队进行AI培训"
                  }
                  className="aspect-[16/10] w-full object-cover"
                  width={1280}
                  height={720}
                  loading="lazy"
                />
              </div>
              <figcaption className="mt-3 text-xs leading-5 text-[#5C574D]">
                {t.evidenceCaption}
              </figcaption>
            </figure>

            <div>
              <p
                className={cn(
                  "font-mono text-xs leading-5 text-superlinear-deep",
                  lang === "en"
                    ? "uppercase tracking-[0.18em]"
                    : "tracking-[0.1em]"
                )}
              >
                {t.evidenceEyebrow}
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-[1.12] [text-wrap:balance] md:text-4xl">
                {t.evidenceTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[#5C574D]">
                {t.evidenceBody}
              </p>

              <div className="mt-8 border-l-2 border-superlinear pl-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5C574D]">
                  {t.publicWorkLabel}
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-[#173C2A]">
                  {t.publicWorkNames}
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-[#5C574D]">
                  {t.publicWorkNote}
                </p>
              </div>
              <p className="mt-6 text-sm leading-7 text-[#5C574D]">
                {t.faculty}
              </p>
              <Link
                href={withLanguage("/decks", lang)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-link transition hover:text-superlinear-deep"
              >
                {t.decksCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-superlinear-canvas py-14 text-superlinear-ink md:py-20">
          <div className="container grid gap-8 border-y border-[#CFC9BE] py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
            <div>
              <p
                className={cn(
                  "font-mono text-xs leading-5 text-superlinear-deep",
                  lang === "en"
                    ? "uppercase tracking-[0.18em]"
                    : "tracking-[0.1em]"
                )}
              >
                {t.closeEyebrow}
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.15] [text-wrap:balance] md:text-4xl">
                {t.closeTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5C574D] md:text-base">
                {t.closeBody}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={mailto}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-superlinear text-white hover:bg-superlinear-deep"
                )}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t.closeCta}
              </a>
              <Link
                href={withLanguage("/collab", lang)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#5C574D] transition hover:text-superlinear-deep"
              >
                {t.collabCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
