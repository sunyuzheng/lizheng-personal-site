import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { useEffect } from "react";
import { Link } from "wouter";
import { COLLAB_PAGE_META } from "../../../shared/collab-meta";
import { languageAlternates } from "../../../shared/page-meta";
import { buildPersonWebPageStructuredData } from "../../../shared/structured-data";

const copy = {
  en: {
    navSub: "Collaborate",
    eyebrow: "Talks · Team programs · Long-term work",
    h1: "AI has changed. The work should too.",
    intro:
      "Talks, team training, and advisory for organizations putting AI to work. Start with what your team needs to understand, learn, or do differently.",
    proofLine:
      "Cornell Economics PhD · Former Tencent AI leader · Early Statsig team, later acquired by OpenAI · 200+ public conversations",
    creatorLabel: "Podcasts & creator invitations",
    creatorTitle: "Inviting me to a podcast or video?",
    creatorDetail:
      "Explore possible topics, past episodes, and a ready-to-use host kit. Program invitations are separate from commercial work.",
    creatorCta: "Open the creator page",
    workEyebrow: "Organizations & long-term work",
    workTitle: "Three practical starting points.",
    paths: [
      {
        title: "Talks & events",
        detail:
          "Keynotes, fireside conversations, and panels on what AI changes, AI-native work and talent, building reliable systems, organizational judgment, and career value.",
        fit: "Most useful when you can name who is in the room and what should change for them afterward.",
      },
      {
        title: "Enterprise AI training and custom programs",
        detail:
          "For engineering and non-engineering teams: use a mature course when it fits, and add company-specific cases or a full redesign only when the work requires it. Selected public team trainings and internal sessions include Tencent, Meituan, Xiaohongshu, DoorDash, and Pinterest.",
        fit: "Best when a team needs to move from discussing AI to changing how work actually gets done.",
        action: {
          label: "Compare enterprise formats",
          href: "/collab/enterprise",
          secondaryLabel: "Browse selected decks",
          secondaryHref: "/en/decks",
        },
      },
      {
        title: "Organization advisory & long-term partnerships",
        detail:
          "A focused session or internal conversation can clarify one important product, AI, data, growth, or organizational decision before a team commits to a larger project.",
        fit: "Organization sessions start at $2,000. Long-term advisory or investment conversations can also begin here; all remain separate from editorial coverage.",
      },
    ],
    budgetTitle: "Commercial scope",
    budgetDetail:
      "For planning: organization sessions start at $2,000; AI Builders can be purchased by the seat; fully custom enterprise programs start at $100,000. The enterprise page publishes the complete pricing ladder and a team procurement brief. I do not offer paid consulting to individuals—join the free community and ask there instead. Talks are scoped separately; editorial invitations are never priced or bundled here.",
    principlesEyebrow: "How I think about fit",
    principlesTitle:
      "A useful collaboration starts with the work, not the transaction.",
    principles: [
      {
        title: "Start with a real decision or audience need.",
        detail:
          "The clearest outreach says what should become possible, for whom, and why this is the right moment.",
      },
      {
        title: "Judgment is not for sale.",
        detail:
          "I do not sell scripted endorsements or coverage of products I have not reached an independent view on.",
      },
      {
        title: "Commercial relationships are disclosed.",
        detail:
          "Client, advisory, and investment relationships do not buy editorial access. If they are relevant to public content, they are disclosed.",
      },
    ],
    contactEyebrow: "Start a conversation",
    contactTitle: "A short email is enough.",
    contactIntro: "Please include four things:",
    contactItems: [
      "Who you are and what you are responsible for.",
      "What you want to make possible, and for whom.",
      "The proposed format and rough timing.",
      "For commercial work, the decision owner and budget range.",
    ],
    contactClose:
      "Specific context makes it much easier to give you a useful answer, including when I am not the right person.",
    contactButton: "Email Yuzheng",
  },
  zh: {
    navSub: "合作",
    eyebrow: "演讲 · 企业项目 · 长期合作",
    h1: "AI变了，工作也该变了。",
    intro:
      "企业想用好AI，先要说清楚：团队需要看懂什么、学会什么，或改变哪项工作。可以从演讲、培训或一次团队交流开始。",
    proofLine:
      "康奈尔经济学博士 · 前腾讯总监 · OpenAI收购团队早期成员 · 200+场科技领袖与AI研究者对话",
    creatorLabel: "播客与创作者邀请",
    creatorTitle: "想邀请我上节目？",
    creatorDetail:
      "可聊的话题、过往节目和介绍素材都在这里。",
    creatorCta: "前往播客与创作者邀请",
    workEyebrow: "组织与长期合作",
    workTitle: "三种常见的合作起点。",
    paths: [
      {
        title: "演讲与活动",
        detail:
          "Keynote、炉边对谈和圆桌，主题包括AI到底改变了什么、AI Native工作与人才、可靠系统、组织判断与职业价值。讲过的场合有哥伦比亚大学、刘润直播间和Seattle (AI) Startup Summit，也在Significance Summit和Acquired的两位主持人同台对谈。",
        fit: "最合适的情况：你说得清台下是谁，以及听完后希望他们发生什么变化。",
        action: {
          label: "看演讲课件与实录",
          href: "/decks",
        },
      },
      {
        title: "企业AI培训与定制",
        detail:
          "面向研发和非研发团队：成熟课程够用，就直接采购；只有企业自己的案例或工作本身确实不同，才增加定制。可公开的团队培训与内部分享包括腾讯、美团、小红书、DoorDash和Pinterest。",
        fit: "最合适的情况：团队需要从讨论AI，走到真正改变工作方式。",
        action: {
          label: "比较企业合作方式",
          href: "/collab/enterprise",
          secondaryLabel: "看过往deck",
          secondaryHref: "/en/decks",
        },
      },
      {
        title: "机构咨询与长期合作",
        detail:
          "先用一次聚焦的团队问题梳理会，把产品、AI、数据、增长或组织中的一个重要问题谈清楚，再决定是否值得进入更大的项目。",
        fit: "机构合作$2,000起。长期顾问或投资对话，也可以从这里开始。",
      },
    ],
    budgetTitle: "商业项目的范围",
    budgetDetail:
      "团队问题梳理会与内部交流$2,000起；AI Builders按席位采购；完整定制企业项目$100,000起。完整的价格阶梯，和可以转发给同事的团队方案，都在企业页。演讲按场合另行商量。我不接面向个人的付费咨询，个人问题欢迎到免费社区公开提问。",
    principlesEyebrow: "如何判断是否合适",
    principlesTitle: "有用的合作，应该从事情开始，不是从交易开始。",
    principles: [
      {
        title: "先说清你要做的决定，或听众的需要。",
        detail: "最有用的邀请会写清：想做成什么事，对谁有用，为什么是现在。",
      },
      {
        title: "判断不出售。",
        detail: "不照稿子背书。我自己没有判断过的产品，不替它做内容。",
      },
      {
        title: "有商业关系，会写明。",
        detail:
          "节目邀请和商业项目分开谈。客户、顾问和投资关系，换不来上节目，也换不来被我写进内容；内容里涉及这些关系时，我会写明。",
      },
    ],
    contactEyebrow: "开始聊聊",
    contactTitle: "一封简短邮件就够。",
    contactIntro: "请带上四件事：",
    contactItems: [
      "你是谁，正在负责什么。",
      "想一起做成什么事，对谁有用。",
      "大概的形式和时间。",
      "商业项目请说明决策人和预算范围。",
    ],
    contactClose:
      "写得具体，我就能更快给你一个有用的答复，包括告诉你我不合适。",
    contactButton: "发邮件给立正",
  },
};

function buildMailto(lang: "en" | "zh") {
  const subject =
    lang === "en" ? "Collaboration with Yuzheng Sun" : "与课代表立正合作";
  const body =
    lang === "en"
      ? "Who I am:\n\nWhat I want to make possible, and for whom:\n\nFormat and timing:\n\nDecision owner and budget range (for commercial work):\n"
      : "我是谁：\n\n想一起做成什么事，对谁有用：\n\n形式和时间：\n\n决策人和预算范围（商业项目）：\n";
  return `mailto:yz@superlinear.academy?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Collab() {
  const { lang } = useLanguage();
  const t = copy[lang];

  useEffect(
    () =>
      applyPageSeo({
        ...COLLAB_PAGE_META[lang],
        locale: lang === "zh" ? "zh_CN" : "en_US",
        alternates: languageAlternates(
          COLLAB_PAGE_META.en.canonical,
          COLLAB_PAGE_META.zh.canonical
        ),
        jsonLd: buildPersonWebPageStructuredData({
          canonical: COLLAB_PAGE_META[lang].canonical,
          name: COLLAB_PAGE_META[lang].title,
          description: COLLAB_PAGE_META[lang].description,
          lang,
          lastModified: COLLAB_PAGE_META[lang].lastModified,
        }),
      }),
    [lang]
  );

  return (
    <div
      className={lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="collab" />

      <main>
        <section className="page-head">
          <div className="wrap">
            <div className="eyebrow">{t.eyebrow}</div>
            <h1>
              {lang === "zh" ? (
                <>
                  AI变了，
                  <br />
                  工作也该变了。
                </>
              ) : (
                t.h1
              )}
            </h1>
            <p className="lede">{t.intro}</p>
            <p className="aside">{t.proofLine}</p>
          </div>
        </section>

        {/* Three ways to start, side by side between hairlines; what commercial work costs, as a
            note under them; then the other kind of request, a programme invitation, with its
            picture. */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.workEyebrow}</div>
                <h2>{t.workTitle}</h2>
              </div>
            </div>
            <div className="cols">
              {t.paths.map(path => (
                <article key={path.title}>
                  <h3>{path.title}</h3>
                  <p>{path.detail}</p>
                  <p className="fit">{path.fit}</p>
                  {"action" in path && path.action ? (
                    <div className="links">
                      <Link
                        className="lz-link"
                        href={withLanguage(path.action.href, lang)}
                      >
                        {path.action.label} <i aria-hidden="true">→</i>
                      </Link>
                      {"secondaryHref" in path.action &&
                      path.action.secondaryHref ? (
                        <Link
                          className="lz-link"
                          href={withLanguage(path.action.secondaryHref, lang)}
                        >
                          {path.action.secondaryLabel}{" "}
                          <i aria-hidden="true">→</i>
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
            <div className="note-row">
              <div className="lab">{t.budgetTitle}</div>
              <p>{t.budgetDetail}</p>
            </div>

            <Link
              href={withLanguage("/collab/creators", lang)}
              className="pic-row"
            >
              <img
                src="/hero/acquired-behind-scenes-desktop.webp"
                alt={
                  lang === "en"
                    ? "Yuzheng Sun in conversation with the hosts of Acquired"
                    : "课代表立正与Acquired的主播对谈"
                }
                width={2400}
                height={1600}
                loading="lazy"
                decoding="async"
              />
              <div>
                <div className="eyebrow">{t.creatorLabel}</div>
                <h2>{t.creatorTitle}</h2>
                <p>{t.creatorDetail}</p>
              </div>
              <span className="lz-link">
                {t.creatorCta} <i aria-hidden="true">→</i>
              </span>
            </Link>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.principlesEyebrow}</div>
                <h2>{t.principlesTitle}</h2>
              </div>
              <ul className="points">
                {t.principles.map(principle => (
                  <li key={principle.title}>
                    <h3>{principle.title}</h3>
                    <p>{principle.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.contactEyebrow}</div>
                <h2>{t.contactTitle}</h2>
                <p className="say">{t.contactClose}</p>
                <div className="cta-row">
                  <a className="btn btn-green" href={buildMailto(lang)}>
                    {t.contactButton}
                  </a>
                </div>
                <p className="mail">yz@superlinear.academy</p>
              </div>
              <div>
                <p className="eyebrow">{t.contactIntro}</p>
                <ol className="points">
                  {t.contactItems.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
