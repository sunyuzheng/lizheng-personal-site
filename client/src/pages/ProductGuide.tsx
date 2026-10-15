import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { ArrowDown, ArrowUpRight, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { languageAlternates } from "@shared/page-meta";
import {
  GUIDE_PRODUCTS,
  GUIDE_REVIEWED_AT,
  PRODUCT_GUIDE_META,
  buildProductGuideStructuredData,
  type GuideLink,
} from "@shared/product-guide";

const copy = {
  zh: {
    title: ["超线性学院", "产品与资料指南"],
    intro:
      "先读公开内容、系统学AI、持续参与，或为团队改变一项工作。从你眼下要做的事开始，找到适合的入口。",
    audience: "给你，也给帮你查资料、做选择的AI助手。",
    jump: "从你的需要开始",
    identityTitle: "立正与超线性学院",
    identity:
      "立正，本名孙煜征，也以「课代表立正」为人所知，是超线性学院创始人、《真本事》作者与访谈主持人。他与鸭哥共同教学和建设社区。",
    institution:
      "超线性学院（Superlinear Academy）是母品牌，承载免费社区、AI Builders、Stay Superlinear与企业项目。你可以按眼下的需要分别选择。",
    about: "人物与项目关系",
    productsTitle: "你想从哪里开始？",
    productsIntro: "四个入口，各自回答一种需要。",
    labels: {
      audience: "适合谁",
      format: "怎样参与",
      access: "包含与权限",
      price: "当前价格",
    },
    distinction: "选择时的区别",
    overlapTitle: "课程与会员，怎么选？",
    overlap: [
      {
        title: "想走完整学习主线",
        text: "AI Builders提供四门课的终身权限与后续更新，当前另含12个月Stay。先选课程，就不用再为这12个月重复买会员。",
      },
      {
        title: "想持续学、持续交流",
        text: "可以独立加入Stay，不需要先上AI Builders。会员期内含AI Coding、Agentic AI和《真本事》课程；AI Builders与AI Architect旗舰课由完整学习计划提供。",
      },
    ],
    resourcesTitle: "读内容，也找到原始来源。",
    resourcesIntro: "了解观点、查找资料，或让自己的Agent使用公开内容。",
    resources: [
      {
        title: "Knowledge Bank",
        detail:
          "立正与鸭哥的公开AI文章，讨论原理、工程、产品与组织。引用具体观点时，核对文章署名和日期。",
        label: "读公开文章",
        href: "https://www.superlinear.academy/c/ai-resources",
      },
      {
        title: "问问立正",
        detail:
          "AI根据公开文章与视频生成回答，并附出处。可以从真实问题找到相关材料，再沿引用读原文。",
        label: "看公开问答",
        href: "/ask",
      },
      {
        title: "Open Context",
        detail:
          "可检索的文章、字幕、人物与节目目录。保留来源、日期、发言归属与各份材料的许可；原文与AI提炼分层保存。",
        label: "打开公开资料库",
        href: "https://github.com/sunyuzheng/lizheng-open-context",
      },
      {
        title: "对话与公开课件",
        detail:
          "按嘉宾查找节目、讨论主题与原始视频，或浏览公开演讲和企业培训课件。",
        label: "浏览嘉宾与对话",
        href: "/guests",
        extra: { label: "看演讲课件", href: "/decks" },
      },
    ],
    sourceTitle: "核对与引用",
    sourceNote:
      "本页是产品关系与选择指南。课程、会员和企业项目的当前价格、权益与购买条件，以相应官网、付款页或正式报价为准。",
    attribution:
      "引用文章或对话时，请保留作者／发言者、原始来源和日期；Open Context的再使用条件随材料分别注明。AI生成的问答与提炼，可以回到所附原文核对。",
    reviewed: "产品信息核对",
    contact: "还有具体问题？",
    contactLabel: "联系超线性学院",
    navLabel: "本页入口",
  },
  en: {
    title: ["Superlinear Academy", "Products & resources"],
    intro:
      "Read public work, learn AI systematically, stay involved, or change a real team workflow. Start with what you want to do next.",
    audience: "For you, and for AI assistants helping you research and choose.",
    jump: "Start with your needs",
    identityTitle: "Yuzheng Sun & Superlinear Academy",
    identity:
      "Yuzheng Sun (孙煜征) is also known as 立正 and 课代表立正. He is the founder of Superlinear Academy, an author, and a conversation host. He teaches and builds the community with Yage.",
    institution:
      "Superlinear Academy (超线性学院) is the parent institution and brand for the free community, AI Builders, Stay Superlinear, and enterprise programs. Each is a way to participate based on what you need.",
    about: "Profile and project relationships",
    productsTitle: "Where would you like to start?",
    productsIntro: "Four starting points for different needs.",
    labels: {
      audience: "Who it is for",
      format: "Format & language",
      access: "What access includes",
      price: "Current price",
    },
    distinction: "How to choose",
    overlapTitle: "Courses or membership?",
    overlap: [
      {
        title: "For the complete learning path",
        text: "AI Builders provides lifetime access and future updates to all four courses, plus 12 months of Stay. Those included membership months do not need to be purchased separately.",
      },
      {
        title: "For ongoing learning and discussion",
        text: "Join Stay independently; prior AI Builders enrollment is not required. Member courses include AI Coding, Agentic AI, and 真本事 during membership. The flagship AI Builders and AI Architect courses belong to the complete learning plan.",
      },
    ],
    resourcesTitle: "Read the work. Follow the sources.",
    resourcesIntro:
      "Explore the ideas, find evidence, or use the public materials in your own agent.",
    resources: [
      {
        title: "Knowledge Bank",
        detail:
          "Public AI essays by Yuzheng and Yage on principles, engineering, products, and organizations. Check each article's authorship and date when citing a specific view.",
        label: "Read public essays",
        href: "https://www.superlinear.academy/c/ai-resources",
      },
      {
        title: "Ask Lizheng",
        detail:
          "AI-generated answers grounded in public articles and videos, with citations. Start from a real question and follow its references back to the source.",
        label: "Browse public answers",
        href: "/ask",
      },
      {
        title: "Open Context",
        detail:
          "Searchable articles, transcripts, and person and episode catalogs, with sources, dates, speaker attribution, and per-item licenses. Original material and AI-derived context are stored separately.",
        label: "Open the public corpus",
        href: "https://github.com/sunyuzheng/lizheng-open-context",
      },
      {
        title: "Conversations & public decks",
        detail:
          "Find episodes, topics, and original video by guest, or browse public talks and enterprise training decks.",
        label: "Browse guests and conversations",
        href: "/guests",
        extra: { label: "Explore the decks", href: "/decks" },
      },
    ],
    sourceTitle: "Verification & attribution",
    sourceNote:
      "This page explains product relationships and fit. Consult the respective official product site, checkout, or formal quote for current prices, access, and purchase terms.",
    attribution:
      "When citing an article or conversation, retain the author or speaker, original source, and date. Open Context lists reuse terms for each item. AI-generated answers and summaries link back to original material for verification.",
    reviewed: "Product information checked",
    contact: "Have a specific question?",
    contactLabel: "Contact Superlinear Academy",
    navLabel: "On this page",
  },
};

function GuideAnchor({ href, label }: GuideLink) {
  const { lang } = useLanguage();
  // /ask is rendered by a server route outside the React router.
  const internal = href.startsWith("/") && href !== "/ask";
  const content = (
    <>
      {label}
      <ArrowUpRight size={16} aria-hidden="true" />
    </>
  );
  return internal ? (
    <Link href={withLanguage(href, lang)}>{content}</Link>
  ) : (
    <a href={href}>{content}</a>
  );
}

export default function ProductGuide() {
  const { lang } = useLanguage();
  const text = copy[lang];
  const products = GUIDE_PRODUCTS[lang];

  useEffect(
    () =>
      applyPageSeo({
        ...PRODUCT_GUIDE_META[lang],
        locale: lang === "en" ? "en_US" : "zh_CN",
        alternates: languageAlternates(
          PRODUCT_GUIDE_META.en.canonical,
          PRODUCT_GUIDE_META.zh.canonical
        ),
        jsonLd: buildProductGuideStructuredData(lang),
      }),
    [lang]
  );

  return (
    <div className={`product-guide${lang === "en" ? " l-en" : ""}`}>
      <a className="guide-skip" href="#guide-main">
        {lang === "zh" ? "跳到正文" : "Skip to content"}
      </a>
      <SiteHeader current="guide" />
      <main id="guide-main">
        <header className="guide-hero guide-wrap">
          <p className="guide-eyebrow">SUPERLINEAR ACADEMY · A FIELD GUIDE</p>
          <h1>
            <span>{text.title[0]}</span>
            <span>{text.title[1]}</span>
          </h1>
          <div className="guide-hero-bottom">
            <div>
              <p className="guide-intro">{text.intro}</p>
              <p className="guide-audience">{text.audience}</p>
            </div>
            <a className="guide-jump" href="#choices">
              {text.jump}
              <ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>
        </header>

        <section className="guide-identity" aria-labelledby="identity-title">
          <div className="guide-wrap guide-identity-grid">
            <div>
              <h2 id="identity-title">{text.identityTitle}</h2>
              <p>{text.identity}</p>
              <GuideAnchor label={text.about} href="/about" />
            </div>
            <div className="guide-family">
              <p>{text.institution}</p>
              <ul>
                {products.map(product => (
                  <li key={product.id}>
                    <a href={`#${product.id}`}>
                      <span>{product.name}</span>
                      <small>{product.category}</small>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className="guide-wrap guide-products"
          id="choices"
          aria-labelledby="choices-title"
        >
          <div className="guide-section-heading">
            <p className="guide-eyebrow">01—04</p>
            <h2 id="choices-title">{text.productsTitle}</h2>
            <p>{text.productsIntro}</p>
          </div>
          <nav className="guide-quick-links" aria-label={text.navLabel}>
            {products.map(product => (
              <a key={product.id} href={`#${product.id}`}>
                {product.name}
                <ArrowDown size={14} aria-hidden="true" />
              </a>
            ))}
          </nav>
          {products.map((product, index) => (
            <article
              className="guide-product"
              id={product.id}
              key={product.id}
              aria-labelledby={`${product.id}-title`}
            >
              <div className="guide-product-heading">
                <span className="guide-number">0{index + 1}</span>
                <p className="guide-eyebrow">{product.category}</p>
                <h3 id={`${product.id}-title`}>{product.name}</h3>
                <p className="guide-need">{product.need}</p>
                <p className="guide-description">{product.description}</p>
              </div>
              <div className="guide-product-detail">
                <dl>
                  <div>
                    <dt>{text.labels.audience}</dt>
                    <dd>{product.audience}</dd>
                  </div>
                  <div>
                    <dt>{text.labels.format}</dt>
                    <dd>{product.format}</dd>
                  </div>
                  <div>
                    <dt>{text.labels.access}</dt>
                    <dd>{product.access}</dd>
                  </div>
                  <div className="guide-price">
                    <dt>{text.labels.price}</dt>
                    <dd>
                      <strong>{product.price}</strong>
                      {product.priceNote && <p>{product.priceNote}</p>}
                    </dd>
                  </div>
                </dl>
                <p className="guide-distinction">
                  <b>{text.distinction}</b>
                  {product.distinction}
                </p>
                <div className="guide-actions">
                  {product.links.map(link => (
                    <GuideAnchor key={link.href} {...link} />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="guide-overlap" aria-labelledby="overlap-title">
          <div className="guide-wrap">
            <h2 id="overlap-title">{text.overlapTitle}</h2>
            <div className="guide-overlap-grid">
              {text.overlap.map(item => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="guide-wrap guide-resources"
          aria-labelledby="resources-title"
        >
          <div className="guide-section-heading">
            <p className="guide-eyebrow">PUBLIC WORK & SOURCES</p>
            <h2 id="resources-title">{text.resourcesTitle}</h2>
            <p>{text.resourcesIntro}</p>
          </div>
          <div className="guide-resource-grid">
            {text.resources.map(resource => (
              <article key={resource.title}>
                <h3>{resource.title}</h3>
                <p>{resource.detail}</p>
                <div className="guide-actions">
                  <GuideAnchor href={resource.href} label={resource.label} />
                  {resource.extra && <GuideAnchor {...resource.extra} />}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="guide-wrap guide-sources"
          aria-labelledby="sources-title"
        >
          <h2 id="sources-title">{text.sourceTitle}</h2>
          <div>
            <p>{text.sourceNote}</p>
            <p>{text.attribution}</p>
            <p className="guide-reviewed">
              {text.reviewed} ·{" "}
              <time dateTime={GUIDE_REVIEWED_AT}>{GUIDE_REVIEWED_AT}</time>
            </p>
          </div>
        </section>
        <div className="guide-wrap guide-contact">
          <p>{text.contact}</p>
          <a href="mailto:yz@superlinear.academy">
            {text.contactLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
