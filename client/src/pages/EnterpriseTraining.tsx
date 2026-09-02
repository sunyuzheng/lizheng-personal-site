import CollabHeader from "@/components/collab/CollabHeader";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ExternalLink,
  FileSearch,
  Mail,
  MessagesSquare,
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
    eyebrow: "ENTERPRISE AI TRAINING · FROM ONE SESSION TO FULL CUSTOM",
    title:
      "Start with the course that already works. Customize only what your team needs.",
    titleLines: null,
    intro:
      "AI Builders already covers what most teams need in common. Buy seats or run a private cohort when that is enough. Customize the course only when your own cases, objectives, or workflows change what should be taught; commission a full program only when the work itself must be rethought.",
    proof: "2½ years of iteration · 13 cohorts · 3,000+ paid learners",
    primaryCta: "Compare the formats",
    secondaryCta: "Open the team brief (PDF)",
    anchorLabel: "FULLY CUSTOM ENTERPRISE PROGRAM",
    anchorPrice: "$100,000+",
    anchorDetail:
      "Diagnosis, stakeholder interviews, new curriculum, company-specific exercises, delivery, and reusable team assets.",
    anchorNote:
      "This scope begins when the organization’s work—not only the course materials—has to be understood and redesigned.",
    anchorCta: "Discuss a custom program",
    reviewsEyebrow: "PUBLIC MAVEN REVIEWS",
    reviewsTitle: "What experienced builders found valuable",
    reviewsIntro:
      "Public Maven reviews from experienced builders at OpenAI, Anthropic, and Google. Affiliations identify the reviewers; they do not imply employer endorsement.",
    reviews: [
      {
        quote:
          "There are many courses teaching you specific tricks but this course helps you build the right mindset and empower you to teach yourself more effectively.",
        name: "Shuyang",
        role: "Member of Technical Staff, OpenAI",
        note: "Former Sr. AI Manager, Uber",
      },
      {
        quote:
          "There can be different new tools coming, but principles remain!",
        name: "EZ",
        role: "Engineer, Anthropic",
      },
      {
        quote:
          "The content and instruction are both outstanding and very engaging.",
        name: "Chairy",
        role: "UX Manager, Google",
      },
    ],
    reviewsCta: "Read public reviews on Maven",
    advisoryEyebrow: "WHEN THE RIGHT STARTING POINT IS UNCLEAR",
    advisoryTitle:
      "Use one working session to define the problem before commissioning more.",
    advisoryPrice: "From $2,000",
    advisoryDetail:
      "Work through one real organizational question, clarify the intended result, test the key assumptions, and decide whether the next step should be an internal session, team enrollment, or a custom program. It does not include new curriculum, research, or follow-on delivery; keynotes and larger events are scoped separately.",
    advisoryCta: "Book a problem-framing session",
    individualNote:
      "I do not sell paid consulting to individuals. Join Superlinear Academy for free and ask in the community; I answer individual questions there for free.",
    communityCta: "Ask in the free community",
    formatsEyebrow: "START WITH THE SIMPLEST OPTION THAT WORKS",
    formatsTitle: "Buy only what your team actually needs.",
    formatsIntro:
      "Start with what the engagement must add: seats, a dedicated cohort, company-specific course material, or an entirely new program.",
    offers: [
      {
        number: "01",
        label: "TEAM ENROLLMENT",
        title: "Buy AI Builders by the seat",
        priceLines: ["$1,999 per learner before team discounts"],
        fit: "Use this when the mature course already covers the capability your team needs.",
        bullets: [
          "Join a scheduled Maven cohort",
          "2–9 learners: 20% off; 10+ learners: 25% off",
          "Complete course, live instruction, project feedback, lifetime course access, and one year of Stay Superlinear",
        ],
        cta: "View AI Builders",
        href: "https://maven.com/superlinear/aibuilders",
      },
      {
        number: "02",
        label: "DEDICATED COHORT / OPTIONAL CUSTOMIZATION",
        title: "Change the delivery, the content, or both.",
        priceLines: [
          "Private cohort: 30 learners from $44,977.50",
          "Optional course customization: from an additional $20,000",
        ],
        fit: "A dedicated cohort changes who learns together and when. Customization changes what is taught. They can be purchased separately or together.",
        bullets: [
          "A dedicated cohort uses standard AI Builders on dates agreed with your team",
          "Customization can be added to a group enrollment or a dedicated cohort",
          "Customization is priced in addition to tuition",
        ],
        cta: "Discuss a cohort or customization",
        href: "email",
      },
      {
        number: "03",
        label: "FULLY CUSTOM ENTERPRISE PROGRAM",
        title: "Start with the business problem, not an existing syllabus.",
        priceLines: ["From $100,000"],
        fit: "Use this when the real problem is not tool awareness, but how roles, workflows, evaluation, ownership, or team capability must change.",
        bullets: [
          "Research the work, stakeholders, constraints, and existing artifacts",
          "Design new curriculum, cases, exercises, evaluation, and team assets",
          "Deliver to the team, see what breaks in practice, and revise within the agreed scope",
        ],
        cta: "Discuss a custom program",
        href: "email",
      },
    ],
    pricingNote:
      "Planning prices in USD, before applicable taxes. Seat prices reflect current US AI Builders 2027 team pricing; final scope, faculty, schedule, payment, cancellation terms, and taxes are set in the quote and order form.",
    pdfEyebrow: "TEAM PROCUREMENT BRIEF · PDF",
    pdfTitle: "A two-page brief made to be forwarded internally.",
    pdfBody:
      "Course outcomes, faculty, public learner reviews, team pricing, private cohorts, customization, terms, and contact—already laid out for an internal conversation.",
    pdfMeta: "PDF · 2 pages · English · September 2026",
    pdfCta: "Open the team brief",
    workEyebrow: "WHAT CHANGES WITH CUSTOMIZATION",
    workTitle: "Full customization adds more than new course material.",
    workIntro:
      "It starts with the work itself: roles, workflows, decisions, and constraints—then redesigns the human–AI division of labor, evaluation, ownership, and learning assets. Course customization starts at $20,000; full custom programs start at $100,000 when that work must be done end to end for one organization.",
    confidentialityLabel: "SENSITIVE CONTEXT STAYS WITH THE WORK",
    confidentialityDetail:
      "Full custom work often requires real roles, workflows, and internal materials. We use that context only within the agreed scope; client names, materials, and delivery details are not published without explicit permission.",
    workSteps: [
      {
        title: "Understand the work",
        detail:
          "Interview the people doing it; inspect real artifacts, decisions, handoffs, constraints, and failure modes.",
      },
      {
        title: "Redesign the system",
        detail:
          "Define the result, the human–AI division of labor, evaluation, ownership, and where context must persist.",
      },
      {
        title: "Build the learning assets",
        detail:
          "Turn the diagnosis into cases, exercises, demos, evaluation criteria, templates, and reusable context.",
      },
      {
        title: "Teach and correct",
        detail:
          "Deliver to the team, watch what fails in practice, answer the hard questions, and revise within scope.",
      },
    ],
    evidenceEyebrow: "COURSE DEPTH · ENTERPRISE REALITY",
    evidenceTitle:
      "The course is refined in public cohorts. Enterprise work tests it against real constraints.",
    evidenceBody:
      "AI Builders has been taught across 13 cohorts and 3,000+ paid learners. Inside an organization, the questions become more concrete: the real workflow, the decision owner, what can be measured, and what the team will actually adopt. Public trainings and internal sessions bring those constraints back into the course; full custom work begins with those constraints and redesigns for one organization.",
    evidenceCaption: "DoorDash Analytics team offsite · Seattle",
    publicWorkLabel: "Selected public team trainings and internal sessions",
    publicWorkNames: "Tencent · Meituan · Xiaohongshu · Pinterest · DoorDash",
    publicWorkNote:
      "The names above refer to public trainings and internal sessions. Full custom engagements are named only with client permission.",
    faculty:
      "AI Builders is co-taught by Yuzheng Sun and Yan Wang. Faculty and delivery roles for each enterprise engagement are named in the proposal and order form.",
    decksCta: "Browse selected enterprise decks",
    faqEyebrow: "BEFORE YOU WRITE",
    faqTitle: "The questions that usually decide the format.",
    faqs: [
      {
        q: "Do we need a custom program?",
        a: "Usually not. If the existing course solves the capability gap, seats are the cleanest purchase. Customization is useful only when company-specific material changes what people need to learn or practice.",
      },
      {
        q: "What is the difference between a private cohort and a fully custom program?",
        a: "A private cohort keeps AI Builders as the curriculum and gives one organization its own dates. A fully custom program begins with research into your work and creates a new curriculum and delivery package for that problem.",
      },
      {
        q: "What should the first email include?",
        a: "Team size and roles, the result you want to change, what you have already tried, rough timing, the decision owner, and the budget range. That is enough to recommend the right starting point.",
      },
    ],
    closeEyebrow: "START WITH THE REAL NEED",
    closeTitle: "Tell us what should be different after the training.",
    closeBody:
      "We will tell you whether the right answer is one organization session, seats, a private cohort, course customization, a fully custom program—or no engagement at all.",
    closeCta: "Email Yuzheng",
    collabCta: "See all collaboration options",
  },
  zh: {
    section: "企业AI培训",
    eyebrow: "企业AI培训 · 从一次交流到完整定制",
    title: "先用成熟课程。只为真正不同的问题重新设计。",
    titleLines: ["先用成熟课程。", "只为真正不同的问题", "重新设计。"],
    intro:
      "AI Builders已经覆盖多数团队需要的共性能力。够用，就按席位采购或开专属班；只有企业自己的案例、目标或工作流改变了“该教什么”，才增加课程定制；只有当岗位和工作方式本身需要重新理解、重新设计，才进入完整定制项目。",
    proof: "两年半持续迭代 · 13期教学 · 3,000+付费学员",
    primaryCta: "查看合作方式",
    secondaryCta: "打开团队方案PDF",
    anchorLabel: "完整定制企业项目",
    anchorPrice: "$100,000起",
    anchorDetail:
      "从业务诊断与岗位访谈开始，重新设计课程、企业案例、练习、交付和可复用的团队资产。",
    anchorNote:
      "只有当企业的工作本身，而不只是课程材料，需要重新理解和设计，才进入这个范围。",
    anchorCta: "讨论完整定制",
    reviewsEyebrow: "Maven公开评价",
    reviewsTitle: "真正做过东西的人，具体认可什么？",
    reviewsIntro:
      "下面三条来自Maven公开学员评价。评价者分别在OpenAI、Anthropic和Google工作；公司信息只说明个人背景，不代表雇主背书。",
    reviews: [
      {
        quote:
          "There are many courses teaching you specific tricks but this course helps you build the right mindset and empower you to teach yourself more effectively.",
        name: "Shuyang",
        role: "Member of Technical Staff, OpenAI",
        note: "Former Sr. AI Manager, Uber",
      },
      {
        quote:
          "There can be different new tools coming, but principles remain!",
        name: "EZ",
        role: "Engineer, Anthropic",
      },
      {
        quote:
          "The content and instruction are both outstanding and very engaging.",
        name: "Chairy",
        role: "UX Manager, Google",
      },
    ],
    reviewsCta: "在Maven查看公开评价",
    advisoryEyebrow: "还不确定从哪里开始",
    advisoryTitle: "先用一次团队问题梳理会，把真正要解决的事讲清楚。",
    advisoryPrice: "$2,000起",
    advisoryDetail:
      "围绕一个真实的组织问题，澄清目标、检验关键假设，并判断更适合内部分享、团队购课还是定制项目。不含专项研究、新课纲或后续交付；主题演讲和大型活动另行确定范围。",
    advisoryCta: "预约团队问题梳理会",
    individualNote:
      "我不接面向个人的付费咨询。个人问题欢迎免费加入Superlinear Academy公开提问，我会在社区里免费回答。",
    communityCta: "去免费社区提问",
    formatsEyebrow: "从最简单、够用的方案开始",
    formatsTitle: "只买团队真正需要的部分。",
    formatsIntro:
      "先看这次合作需要新增什么：席位、专属班、企业自己的课程内容，还是一套从头设计的项目。",
    offers: [
      {
        number: "01",
        label: "团队购课",
        title: "按席位采购AI Builders",
        priceLines: ["团队折扣前$1,999/人"],
        fit: "适合：成熟课程已经覆盖团队要补的能力。",
        bullets: [
          "加入Maven已公布日期的公开班",
          "2–9人八折；10人起七五折",
          "包含完整课程、直播教学、项目反馈、课程终身访问与一年Stay Superlinear会员",
        ],
        cta: "查看AI Builders",
        href: "https://maven.com/superlinear/aibuilders",
      },
      {
        number: "02",
        label: "专属班/可选课程定制",
        title: "交付怎么安排、内容是否定制，可以分开选。",
        priceLines: [
          "专属班：30人起，$44,977.50起",
          "可选课程定制：另加$20,000起",
        ],
        fit: "专属班改变谁在一起学、什么时候学；课程定制改变教什么。两者可以分开选择，也可以叠加。",
        bullets: [
          "专属班使用AI Builders标准课程，双方共同确定日期",
          "团队购课或专属班，都可以另外增加课程定制",
          "课程定制费用另计",
        ],
        cta: "咨询专属班或课程定制",
        href: "email",
      },
      {
        number: "03",
        label: "完整定制企业项目",
        title: "从业务问题开始，不从现成课纲开始。",
        priceLines: ["$100,000起"],
        fit: "适合：真正的问题不是员工会不会某个工具，而是岗位分工、工作流、评估标准和责任边界都需要重新设计。",
        bullets: [
          "研究真实工作、参与者、约束与现有材料",
          "重新设计课程、案例、练习、评估与团队资产",
          "正式交付，看真实使用中哪里会卡住，并在约定范围内迭代",
        ],
        cta: "讨论完整定制",
        href: "email",
      },
    ],
    pricingNote:
      "以上为美元未税参考价。席位价格基于当前AI Builders 2027美国区团队方案；最终范围、讲师、时间、付款、取消条款与税费，以正式报价和双方签署的订单确认书（order form）为准。",
    pdfEyebrow: "团队采购说明 · PDF",
    pdfTitle: "一份可以直接转给同事的两页材料。",
    pdfBody:
      "课程目标、讲师背景、公开学员评价、团队价格、专属班、定制方式、条款与联系方式，已经整理成适合内部沟通的版本。",
    pdfMeta: "PDF · 2页 · 英文 · 2026年9月",
    pdfCta: "打开团队方案PDF",
    workEyebrow: "定制到底增加了什么",
    workTitle: "完整定制增加的，不只是课件。",
    workIntro:
      "它从真实工作开始：看清岗位、流程、决策与约束，再重新设计人和AI的分工、评估、责任与学习资产。课程定制$20,000起；当这套工作需要为一家组织从头完成，完整定制项目$100,000起。",
    confidentialityLabel: "敏感上下文只用于交付",
    confidentialityDetail:
      "完整定制往往需要接触真实岗位、工作流与内部材料。我们只在约定范围内使用这些信息；未经明确许可，不把客户名称、材料或项目细节用于公开传播。",
    workSteps: [
      {
        title: "看清工作",
        detail: "访谈真正做事的人，检查现有材料、决策、交接、约束与常见失效。",
      },
      {
        title: "重做系统",
        detail:
          "定义结果、人和AI怎样分工、如何验收、谁负责，以及哪些上下文需要被团队长期保留。",
      },
      {
        title: "做成课程与资产",
        detail:
          "把诊断变成案例、练习、演示、评估标准、模板与可复用的团队上下文。",
      },
      {
        title: "在现场纠偏",
        detail:
          "正式交付，看大家在哪里卡住，回答真正困难的问题，并在约定范围内继续修改。",
      },
    ],
    evidenceEyebrow: "课程深度 · 企业现实",
    evidenceTitle: "课程在公开班里反复打磨，再到企业现场接受现实检验。",
    evidenceBody:
      "AI Builders已经经历13期教学和3,000+名付费学员。进入组织现场后，问题会变得更具体：真实工作流是什么、谁负责决策、结果如何验收、团队最后会不会采用。公开培训与内部分享让这些约束不断回到课程；完整定制则从这些约束出发，为一家组织重新设计。",
    evidenceCaption: "DoorDash Analytics团队线下培训 · 西雅图",
    publicWorkLabel: "部分可公开的企业培训与内部分享",
    publicWorkNames: "腾讯 · 美团 · 小红书 · Pinterest · DoorDash",
    publicWorkNote:
      "以上名称只指已公开的团队培训与内部分享；完整定制项目是否具名，以客户明确许可为准。",
    faculty:
      "AI Builders由立正与鸭哥共同授课。企业项目由谁参与、分别负责什么，会写进提案与订单确认书。",
    decksCta: "查看精选企业课件",
    faqEyebrow: "发邮件以前",
    faqTitle: "通常是这几个问题，决定合作方式。",
    faqs: [
      {
        q: "我们需要完整定制吗？",
        a: "多数情况不需要。现有课程已经能补上能力缺口，就直接买席位。只有企业自己的材料确实改变了要学什么、练什么，定制才有意义。",
      },
      {
        q: "专属班和完整定制有什么区别？",
        a: "专属班仍以AI Builders为课纲，只为一家企业单独确定日期。完整定制会先研究你们的工作，再为这个问题新做一套课程与交付。",
      },
      {
        q: "第一封邮件需要写什么？",
        a: "团队人数与岗位、希望改变的结果、已经试过什么、大概时间、决策人和预算范围。有这些信息，就足以判断从哪一种方式开始。",
      },
    ],
    closeEyebrow: "从真实需要开始",
    closeTitle: "请告诉我们：培训结束以后，什么应该变得不一样？",
    closeBody:
      "我们会直接判断应该先聊一次、买席位、开专属班、增加课程定制、做完整项目，还是暂时不需要合作。",
    closeCta: "发邮件给立正",
    collabCta: "查看全部合作方式",
  },
};

const offerIcons = [BookOpenCheck, PanelsTopLeft, Route];
const workIcons = [FileSearch, Route, PanelsTopLeft, MessagesSquare];

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
        tone="superlinear"
      />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[#09110C]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(35,131,67,0.30),transparent_34rem)]" />
          <div className="container relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-16">
            <div>
              <p
                className={cn(
                  "font-mono text-xs leading-5 text-superlinear-light",
                  lang === "en"
                    ? "uppercase tracking-[0.2em]"
                    : "tracking-[0.1em]"
                )}
              >
                {t.eyebrow}
              </p>
              <h1 className="mt-6 max-w-4xl text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.025em] text-white [text-wrap:balance] sm:text-5xl md:text-6xl">
                {t.titleLines ? (
                  <>
                    <span className="sm:hidden">{t.title}</span>
                    <span className="hidden sm:block">
                      {t.titleLines.map(line => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </>
                ) : (
                  t.title
                )}
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

            <aside className="border border-superlinear-light/30 bg-[#123521] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.25)] md:p-9">
              <p
                className={cn(
                  "font-mono text-[11px] leading-5 text-[#A4D9B5]",
                  lang === "en"
                    ? "uppercase tracking-[0.18em]"
                    : "tracking-[0.1em]"
                )}
              >
                {t.anchorLabel}
              </p>
              <p className="mt-5 text-[3.25rem] font-semibold leading-none tracking-[-0.04em] text-white sm:text-6xl">
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
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A4D9B5] transition hover:text-white"
              >
                {t.anchorCta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </section>

        <section className="border-b border-[#D6D1C7] bg-[#F2F0EA] py-14 text-[#191712] md:py-20">
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
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-deep transition hover:text-superlinear"
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
                  <figcaption className="mt-6 border-l-2 border-superlinear pl-4 text-xs leading-5 text-[#777064]">
                    <span className="block font-semibold text-[#173C2A]">
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
          className="scroll-mt-[76px] bg-[#F2F0EA] py-16 text-[#191712] md:py-24"
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

            <div className="mt-12 grid border-t border-[#CFC9BE] lg:grid-cols-3">
              {t.offers.map((offer, index) => {
                const Icon = offerIcons[index];
                const isCustom = index === 2;
                return (
                  <article
                    key={offer.number}
                    className={cn(
                      "flex flex-col border-b border-[#CFC9BE] py-8 lg:px-7 lg:py-10",
                      index > 0 && "lg:border-l",
                      isCustom && "bg-[#173C2A] px-5 text-white sm:px-6 lg:px-8"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center border",
                          isCustom
                            ? "border-white/25 text-[#A4D9B5]"
                            : "border-[#CFC9BE] text-superlinear-deep"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span
                        className={cn(
                          "font-mono text-xs",
                          isCustom ? "text-white/50" : "text-[#797268]"
                        )}
                      >
                        {offer.number}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-7 font-mono text-[10px] leading-5",
                        lang === "en"
                          ? "uppercase tracking-[0.15em]"
                          : "tracking-[0.08em]",
                        isCustom ? "text-[#A4D9B5]" : "text-superlinear-deep"
                      )}
                    >
                      {offer.label}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-8">
                      {offer.title}
                    </h3>
                    <div
                      className={cn(
                        "mt-5 space-y-1.5 text-xl font-semibold leading-8",
                        isCustom ? "text-white" : "text-[#173C2A]"
                      )}
                    >
                      {offer.priceLines.map(line => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                    <p
                      className={cn(
                        "mt-5 text-sm leading-7",
                        isCustom ? "text-white/70" : "text-[#5C574D]"
                      )}
                    >
                      {offer.fit}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {offer.bullets.map(bullet => (
                        <li
                          key={bullet}
                          className={cn(
                            "flex gap-3 text-sm leading-6",
                            isCustom ? "text-white/75" : "text-[#4E493F]"
                          )}
                        >
                          <Check
                            className={cn(
                              "mt-1 h-4 w-4 shrink-0",
                              isCustom ? "text-[#A4D9B5]" : "text-superlinear"
                            )}
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={offer.href === "email" ? mailto : offer.href}
                      target={offer.href === "email" ? undefined : "_blank"}
                      rel={
                        offer.href === "email"
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className={cn(
                        "mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold",
                        isCustom
                          ? "text-[#A4D9B5] hover:text-white"
                          : "text-superlinear-deep hover:text-superlinear"
                      )}
                    >
                      {offer.cta}
                      {offer.href === "email" ? (
                        <ArrowRight className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </a>
                  </article>
                );
              })}
            </div>

            <p className="mt-6 max-w-5xl text-xs leading-6 text-[#777064]">
              {t.pricingNote}
            </p>

            <div className="mt-12 grid overflow-hidden border border-[#CFC9BE] bg-white lg:grid-cols-[0.74fr_1.26fr]">
              <figure className="border-b border-[#CFC9BE] bg-[#E8F2EC] p-5 lg:border-b-0 lg:border-r lg:p-7">
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
                <p className="mt-5 font-mono text-[11px] tracking-[0.08em] text-[#777064]">
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
                    "font-mono text-xs leading-5 text-[#A4D9B5]",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {t.workEyebrow}
                </p>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {t.workTitle}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                {t.workIntro}
              </p>
            </div>

            <div className="mt-12 grid border-t border-white/20 md:grid-cols-2 xl:grid-cols-4">
              {t.workSteps.map((step, index) => {
                const Icon = workIcons[index];
                return (
                  <article
                    key={step.title}
                    className={cn(
                      "border-b border-white/20 py-7 md:px-6 md:py-9",
                      index % 2 === 1 && "md:border-l",
                      index > 0 && "xl:border-l"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="h-5 w-5 text-[#A4D9B5]" />
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
                  "font-mono text-[10px] leading-5 text-[#A4D9B5]",
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

        <section className="bg-white py-16 text-[#191712] md:py-24">
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
              <figcaption className="mt-3 text-xs leading-5 text-[#777064]">
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
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777064]">
                  {t.publicWorkLabel}
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-[#173C2A]">
                  {t.publicWorkNames}
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-[#777064]">
                  {t.publicWorkNote}
                </p>
              </div>
              <p className="mt-6 text-sm leading-7 text-[#777064]">
                {t.faculty}
              </p>
              <Link
                href={withLanguage("/decks", lang)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-deep transition hover:text-superlinear"
              >
                {t.decksCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section
          id="ways"
          className="scroll-mt-[76px] bg-white py-10 text-[#191712] md:py-14"
        >
          <div className="container">
            <div className="grid gap-7 border-y border-[#D8D3C9] py-8 lg:grid-cols-[0.72fr_0.28fr_1fr] lg:items-center lg:gap-10">
              <div>
                <p
                  className={cn(
                    "font-mono text-[11px] leading-5 text-superlinear-deep",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {t.advisoryEyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-8 md:text-3xl">
                  {t.advisoryTitle}
                </h2>
              </div>
              <p className="text-3xl font-semibold tracking-[-0.03em] text-[#173C2A] md:text-4xl">
                {t.advisoryPrice}
              </p>
              <div>
                <p className="text-sm leading-7 text-[#5C574D]">
                  {t.advisoryDetail}
                </p>
                <a
                  href={advisoryMailto}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-deep transition hover:text-superlinear"
                >
                  {t.advisoryCta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-l-2 border-superlinear pl-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <p className="max-w-4xl text-sm leading-7 text-[#5C574D]">
                {t.individualNote}
              </p>
              <a
                href="https://www.superlinear.academy/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-superlinear-deep transition hover:text-superlinear"
              >
                {t.communityCta}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0B0F1A] py-16 md:py-24">
          <div className="container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p
                className={cn(
                  "font-mono text-xs leading-5 text-superlinear-light",
                  lang === "en"
                    ? "uppercase tracking-[0.18em]"
                    : "tracking-[0.1em]"
                )}
              >
                {t.faqEyebrow}
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-[1.12] text-white md:text-4xl">
                {t.faqTitle}
              </h2>
            </div>
            <div className="border-t border-white/15">
              {t.faqs.map((item, index) => (
                <article
                  key={item.q}
                  className="grid gap-3 border-b border-white/15 py-7 sm:grid-cols-[2rem_1fr]"
                >
                  <span className="font-mono text-xs text-superlinear-light/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {item.q}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      {item.a}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F2F0EA] py-14 text-[#191712] md:py-20">
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#777064] transition hover:text-superlinear-deep"
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
