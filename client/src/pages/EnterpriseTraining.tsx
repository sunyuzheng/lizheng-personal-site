import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { Quotation } from "@/components/home/Peers";
import { Phrases } from "@/components/home/parts";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { useEffect } from "react";
import { Link } from "wouter";
import { ENTERPRISE_TRAINING_PAGE_META } from "../../../shared/collab-meta";
import { languageAlternates } from "../../../shared/page-meta";
import { buildEnterpriseTrainingStructuredData } from "../../../shared/structured-data";

const copy = {
  en: {
    section: "Enterprise AI training",
    eyebrow: "Enterprise AI training & custom programs",
    title: "The work should be different after the training.",
    titleLines: null,
    intro:
      "When a team needs shared capability, AI Builders is the direct route. When the work itself needs to change, we start with the roles, workflows, materials, and evaluation—then design the program, cases, and tools the team actually needs.",
    proof: "13 cohorts · 3,000+ paid learners · 5.0/5 on Maven",
    primaryCta: "Compare the formats",
    secondaryCta: "Open the team brief (PDF)",
    anchorLabel: "Fully custom enterprise program",
    anchorPrice: "$100,000+",
    anchorDetail:
      "Start with the work. Leave the team with a program, cases, tools, and evaluation standards it can keep using.",
    anchorNote: "Research · Design · Live delivery · Review",
    anchorCta: "Discuss a custom program",
    reviewsEyebrow: "Public Maven reviews",
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
    formatsEyebrow: "Five ways to work together",
    formatsTitle: "Start with the simplest useful step.",
    formatsIntro:
      "Start with what must change: shared capability, course content, or the work itself.",
    formats: [
      {
        number: "01",
        label: "Organization session",
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
        label: "Team enrollment",
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
        label: "Private cohort",
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
        label: "Course customization",
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
        label: "Fully custom enterprise program",
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
    pdfEyebrow: "Team procurement brief · PDF",
    pdfTitle: "Forward this two-page brief to your team.",
    pdfBody:
      "Course outcomes, faculty, public reviews, team pricing, private cohorts, customization, and procurement details are all in one place.",
    pdfMeta: "PDF · 2 pages · English · September 2026",
    pdfCta: "Open the team brief",
    workEyebrow: "Fully custom programs",
    workTitle: "Full customization starts with the work.",
    workIntro:
      "Start with the work itself. Then design the program and delivery around it.",
    confidentialityLabel: "Sensitive context stays with the work",
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
    evidenceEyebrow: "Course depth · Enterprise reality",
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
    closeEyebrow: "Start with one concrete change",
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
      "以下均为Maven公开评价，中文为译文；任职信息用于说明评价者背景，不代表雇主背书。",
    reviews: [
      {
        // The same translation as the About page's (components/CourseReviews.tsx).
        quote:
          "很多课程教具体技巧；这门课帮你建立正确的思维方式，也让你更有效地继续自学。",
        name: "Shuyang",
        role: "Member of Technical Staff",
        company: "OpenAI",
        note: "前Uber高级AI经理",
      },
      {
        quote: "新工具会不断出现，但原理不变！",
        name: "EZ",
        role: "Engineer",
        company: "Anthropic",
      },
      {
        quote: "内容和讲授都很出色，也很吸引人。",
        name: "Chairy",
        role: "UX Manager",
        company: "Google",
      },
    ],
    reviewsCta: "在Maven读英文原文",
    individualNote:
      "我不接面向个人的付费咨询。个人问题欢迎到超线性学院的免费社区公开提问。",
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

  const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;
  const PDF = "/enterprise/AI-Builders-2027-for-Teams.pdf";

  return (
    <div
      className={lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="collab" />

      <main>
        {/* The offer, on the forest: what should change, and beside it what a fully custom
            programme starts at, set as type between hairlines (no box, no badge). */}
        <section className="forest-head grain">
          <div className="wrap">
            <nav className="crumb" aria-label={lang === "en" ? "Breadcrumb" : "位置"}>
              <Link href={withLanguage("/collab", lang)}>
                {lang === "en" ? "Collaborate" : "合作"}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{t.section}</span>
            </nav>
            <div className="cols2">
              <div>
                <div className="eyebrow">{t.eyebrow}</div>
                <h1>
                  {t.titleLines
                    ? t.titleLines.map(line => (
                        <span key={line} className="line">
                          {line}
                        </span>
                      ))
                    : t.title}
                </h1>
                <p className="lede">{t.intro}</p>
                <p className="aside">{t.proof}</p>
                <div className="cta-row">
                  <a className="btn btn-ivory" href="#formats">
                    {t.primaryCta}
                  </a>
                  <a className="btn btn-line" href={PDF} {...EXTERNAL}>
                    {t.secondaryCta}
                  </a>
                </div>
              </div>
              <aside className="offer">
                <div className="t">{t.anchorLabel}</div>
                <p className="price">{t.anchorPrice}</p>
                <p>{t.anchorDetail}</p>
                <p className="steps">{t.anchorNote}</p>
                <a className="lz-link" href={mailto}>
                  {t.anchorCta} <i aria-hidden="true">→</i>
                </a>
              </aside>
            </div>
          </div>
        </section>

        {/* Public reviews: the rating beside the title, three reviewers side by side. */}
        <section className="sec">
          <div className="wrap">
            <div className="head top">
              <div>
                <div className="eyebrow">{t.reviewsEyebrow}</div>
                <p className="rating">
                  5.0<small> / 5</small>
                </p>
              </div>
              <div>
                <h2>{t.reviewsTitle}</h2>
                <p className="after">{t.reviewsIntro}</p>
                <a
                  className="lz-link"
                  href="https://maven.com/superlinear/aibuilders#reviews"
                  {...EXTERNAL}
                >
                  {t.reviewsCta} <i aria-hidden="true">→</i>
                </a>
              </div>
            </div>
            <div className="cols reviews">
              {t.reviews.map(review => (
                <figure key={review.name}>
                  {/* English as the reviewers wrote it; the Chinese page sets its translation in
                      phrases, as the About page does, so no line ends inside a word. */}
                  {lang === "zh" ? (
                    <blockquote>
                      <Quotation text={review.quote} />
                    </blockquote>
                  ) : (
                    <blockquote lang="en">“{review.quote}”</blockquote>
                  )}
                  <figcaption>
                    <b>{review.company}</b>
                    <span>
                      {review.name} · {review.role}
                    </span>
                    {"note" in review && review.note ? (
                      <span>{review.note}</span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* The five formats, lightest first: a ladder of rows. The fully custom programme, the
            one the head names, is ruled in ink. */}
        <section id="formats" className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.formatsEyebrow}</div>
                <h2>{t.formatsTitle}</h2>
              </div>
              <p>{t.formatsIntro}</p>
            </div>
            <ol className="ladder">
              {t.formats.map(format => {
                const href =
                  format.href === "training"
                    ? mailto
                    : format.href === "advisory"
                      ? advisoryMailto
                      : format.href;
                const isExternal = href.startsWith("http");
                return (
                  <li
                    key={format.number}
                    className={format.featured ? "anchor" : undefined}
                  >
                    <span className="n" aria-hidden="true">
                      {Number(format.number)}
                    </span>
                    <div className="what">
                      <div className="t">{format.label}</div>
                      <h3>{format.title}</h3>
                    </div>
                    <p className="price">{format.price}</p>
                    <p className="detail">{format.detail}</p>
                    <a
                      className="lz-link"
                      href={href}
                      {...(isExternal ? EXTERNAL : {})}
                    >
                      {format.cta} <i aria-hidden="true">→</i>
                    </a>
                  </li>
                );
              })}
            </ol>
            <p className="fine">{t.pricingNote}</p>
            <div className="aside-row">
              <p>{t.individualNote}</p>
              <a
                className="lz-link"
                href="https://www.superlinear.academy/"
                {...EXTERNAL}
              >
                {t.communityCta} <i aria-hidden="true">→</i>
              </a>
            </div>

            <div className="doc-row">
              <a href={PDF} {...EXTERNAL} tabIndex={-1} aria-hidden="true">
                <img
                  src="/enterprise/ai-builders-2027-for-teams-preview.webp"
                  alt=""
                  width={1224}
                  height={1584}
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <div>
                <div className="eyebrow">{t.pdfEyebrow}</div>
                <h2>
                  <Phrases text={t.pdfTitle} />
                </h2>
                <p>{t.pdfBody}</p>
                <p className="fine">{t.pdfMeta}</p>
                <div className="cta-row">
                  <a className="btn btn-green" href={PDF} {...EXTERNAL}>
                    {t.pdfCta}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fully custom work, in three moves, and what happens to sensitive material. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.workEyebrow}</div>
                <h2>
                  {lang === "zh" ? (
                    <>
                      <span className="phrase">完整定制，</span>
                      <span className="phrase">从真实工作开始。</span>
                    </>
                  ) : (
                    t.workTitle
                  )}
                </h2>
              </div>
              <p>{t.workIntro}</p>
            </div>
            <div className="cols">
              {t.workSteps.map(step => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </article>
              ))}
            </div>
            <div className="note-row wide">
              <div className="lab">{t.confidentialityLabel}</div>
              <p>{t.confidentialityDetail}</p>
            </div>
          </div>
        </section>

        {/* Where the course has been tested: the room, then what can be named. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="evidence">
              <figure>
                <img
                  src="/english-network/doordash-ai-training.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun leading an AI training session for DoorDash in Seattle"
                      : "孙煜征在西雅图为DoorDash团队进行AI培训"
                  }
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{t.evidenceCaption}</figcaption>
              </figure>
              <div>
                <div className="eyebrow">{t.evidenceEyebrow}</div>
                <h2>
                  <Phrases text={t.evidenceTitle} />
                </h2>
                <p className="say">{t.evidenceBody}</p>
                <div className="named">
                  <div className="t">{t.publicWorkLabel}</div>
                  <p className="orgs-line">{t.publicWorkNames}</p>
                  <p className="fine">{t.publicWorkNote}</p>
                </div>
                <p className="say small">{t.faculty}</p>
                <Link className="lz-link" href={withLanguage("/decks", lang)}>
                  {t.decksCta} <i aria-hidden="true">→</i>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.closeEyebrow}</div>
                <h2>
                  <Phrases text={t.closeTitle} />
                </h2>
              </div>
              <div>
                <p className="say first">{t.closeBody}</p>
                <div className="cta-row">
                  <a className="btn btn-green" href={mailto}>
                    {t.closeCta}
                  </a>
                  <Link className="lz-link" href={withLanguage("/collab", lang)}>
                    {t.collabCta} <i aria-hidden="true">→</i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
