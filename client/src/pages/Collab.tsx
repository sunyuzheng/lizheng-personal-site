import CollabHeader from "@/components/collab/CollabHeader";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Handshake,
  Mail,
  Mic2,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { COLLAB_PAGE_META } from "../../../shared/collab-meta";
import { languageAlternates } from "../../../shared/page-meta";
import { buildPersonWebPageStructuredData } from "../../../shared/structured-data";

const copy = {
  en: {
    navSub: "Collaborate",
    eyebrow: "Talks · Team programs · Long-term work",
    h1: "Turn what AI makes possible into work that actually happens.",
    intro:
      "I am most useful when new technical capability has to become a judgment about what is worth doing, a redesigned way of working, or an organizational choice that can survive reality. We can begin with a talk, an enterprise program, or a longer partnership. Podcast and video invitations have their own page.",
    proofLine:
      "Cornell Economics PhD · Former Tencent AI leader · Early Statsig team, later acquired by OpenAI · 200+ public conversations",
    creatorLabel: "PODCASTS & CREATOR INVITATIONS",
    creatorTitle: "Inviting me to a podcast or video?",
    creatorDetail:
      "These invitations are handled separately from commercial work. See possible questions, recording details, editorial boundaries, and host-ready materials.",
    creatorCta: "Open the creator page",
    workEyebrow: "ORGANIZATIONS & LONG-TERM WORK",
    workTitle: "Three practical starting points.",
    paths: [
      {
        icon: CalendarDays,
        number: "01",
        title: "Talks & events",
        detail:
          "Keynotes, fireside conversations, and panels on what AI changes, AI-native work and talent, building reliable systems, organizational judgment, and career value.",
        fit: "Most useful when you can name who is in the room and what should change for them afterward.",
      },
      {
        icon: Building2,
        number: "02",
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
        icon: Handshake,
        number: "03",
        title: "Organization advisory & long-term partnerships",
        detail:
          "A focused session or internal conversation can clarify one important product, AI, data, growth, or organizational decision before a team commits to a larger project.",
        fit: "Organization sessions start at $2,000. Long-term advisory or investment conversations can also begin here; all remain separate from editorial coverage.",
      },
    ],
    budgetTitle: "Commercial scope",
    budgetDetail:
      "For planning: organization sessions start at $2,000; AI Builders can be purchased by the seat; fully custom enterprise programs start at $100,000. The enterprise page publishes the complete pricing ladder and a team procurement brief. I do not offer paid consulting to individuals—join the free community and ask there instead. Talks are scoped separately; editorial invitations are never priced or bundled here.",
    principlesEyebrow: "HOW I THINK ABOUT FIT",
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
    contactEyebrow: "START A CONVERSATION",
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
    back: "Back to homepage",
  },
  zh: {
    navSub: "合作",
    eyebrow: "演讲 · 企业项目 · 长期合作",
    h1: "把AI的变化，变成真正发生的工作。",
    intro:
      "我最能发挥价值的地方，是把技术变化翻译成值得做的判断、重新设计的工作方式，以及经得起现实检验的组织选择。可以从一场演讲、一个企业项目，或一段长期合作开始。播客和视频邀请另有入口。",
    proofLine:
      "康奈尔经济学博士 · 前腾讯总监 · OpenAI收购团队早期成员 · 200+场科技领袖与AI研究者对话",
    creatorLabel: "播客与创作者邀请",
    creatorTitle: "想邀请我上播客或视频节目？",
    creatorDetail:
      "这类邀请与商业合作分开处理。单独页面里有可聊问题、录制方式、编辑边界和主持人素材。",
    creatorCta: "前往播客与创作者邀请",
    workEyebrow: "组织与长期合作",
    workTitle: "三种常见的合作起点。",
    paths: [
      {
        icon: CalendarDays,
        number: "01",
        title: "演讲与活动",
        detail:
          "Keynote、炉边对谈和圆桌，主题包括AI到底改变了什么、AI Native工作与人才、可靠系统、组织判断与职业价值。",
        fit: "最合适的情况：你说得清台下是谁，以及听完后希望他们发生什么变化。",
      },
      {
        icon: Building2,
        number: "02",
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
        icon: Handshake,
        number: "03",
        title: "机构咨询与长期合作",
        detail:
          "先用一次聚焦的团队问题梳理会，把产品、AI、数据、增长或组织中的一个重要问题谈清楚，再决定是否值得进入更大的项目。",
        fit: "机构合作$2,000起。长期顾问或投资对话也可以从这里开始，但与节目选题和内容露出彼此独立。",
      },
    ],
    budgetTitle: "商业项目的范围",
    budgetDetail:
      "便于预算判断：团队问题梳理会与内部交流$2,000起；AI Builders可以按席位采购；完整定制企业项目$100,000起。企业页列出了完整价格阶梯，也提供可以内部转发的团队方案。我不接面向个人的付费咨询，个人问题欢迎到免费社区公开提问。演讲另行确定范围；节目邀请不在这里定价，也不与商业项目打包。",
    principlesEyebrow: "如何判断是否合适",
    principlesTitle: "有用的合作，应该从事情开始，不是从交易开始。",
    principles: [
      {
        title: "先说清真实决策或受众需要。",
        detail:
          "最有用的邀请会写清：希望什么变得可能，对谁有用，为什么是现在。",
      },
      {
        title: "判断不出售。",
        detail: "不接受按稿背书，也不为没有形成独立判断的产品提供内容露出。",
      },
      {
        title: "实质商业关系会被披露。",
        detail:
          "客户、顾问和投资关系不会换来编辑入口。如果这些关系与公开内容有关，会明确说明。",
      },
    ],
    contactEyebrow: "开始聊聊",
    contactTitle: "一封简短邮件就够。",
    contactIntro: "请带上四件事：",
    contactItems: [
      "你是谁，正在负责什么。",
      "希望一起让什么变得可能，对谁有用。",
      "大概的形式和时间。",
      "商业项目请说明决策人和预算范围。",
    ],
    contactClose:
      "具体的上下文，能让我更快给你一个真正有用的回答，包括我不是最合适的人时。",
    contactButton: "发邮件给立正",
    back: "回到主页",
  },
};

function buildMailto(lang: "en" | "zh") {
  const subject =
    lang === "en" ? "Collaboration with Yuzheng Sun" : "与课代表立正合作";
  const body =
    lang === "en"
      ? "Who I am:\n\nWhat I want to make possible, and for whom:\n\nFormat and timing:\n\nDecision owner and budget range (for commercial work):\n"
      : "我是谁：\n\n希望一起让什么变得可能，对谁有用：\n\n形式和时间：\n\n决策人和预算范围（商业项目）：\n";
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
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,191,36,0.08)_0%,rgba(11,15,26,0)_26rem)]" />
      <CollabHeader backHref="/" section={{ en: "Collaborate", zh: "合作" }} />

      <main className="relative z-10">
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
              {t.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-[34px] font-semibold leading-[1.08] text-white md:text-6xl">
              {lang === "zh" ? (
                <>
                  把AI的变化，
                  <br />
                  变成真正发生的工作。
                </>
              ) : (
                t.h1
              )}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              {t.intro}
            </p>
            <p className="mt-6 max-w-3xl border-l border-amber-300/50 pl-4 text-xs font-medium leading-6 text-zinc-400">
              {t.proofLine}
            </p>
          </div>

          <Link
            href={withLanguage("/collab/creators", lang)}
            className="group mt-12 grid overflow-hidden rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] transition hover:border-amber-300/50 md:grid-cols-[0.68fr_1fr]"
          >
            <div className="relative min-h-56 overflow-hidden md:min-h-full">
              <img
                src="/hero/acquired-behind-scenes-desktop.webp"
                alt={
                  lang === "en"
                    ? "Yuzheng Sun in conversation with the hosts of Acquired"
                    : "课代表立正与Acquired的主播对谈"
                }
                className="absolute inset-0 h-full w-full object-cover object-center"
                width={2400}
                height={1600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A]/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0B0F1A]/60" />
            </div>
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-2 text-amber-300">
                <Mic2 className="h-4 w-4" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
                  {t.creatorLabel}
                </p>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
                {t.creatorTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
                {t.creatorDetail}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                {t.creatorCta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <div className="mt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {t.workEyebrow}
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
              {t.workTitle}
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {t.paths.map(path => {
                const Icon = path.icon;
                return (
                  <article
                    key={path.number}
                    className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6 md:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center border border-white/15 text-amber-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs text-zinc-400">
                        {path.number}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white">
                      {path.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      {path.detail}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-zinc-300">
                      {path.fit}
                    </p>
                    {"action" in path && path.action ? (
                      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-6">
                        <Link
                          href={withLanguage(path.action.href, lang)}
                          className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
                        >
                          {path.action.label} <span aria-hidden="true">→</span>
                        </Link>
                        <Link
                          href={withLanguage(path.action.secondaryHref, lang)}
                          className="text-sm font-semibold text-zinc-400 transition hover:text-zinc-200"
                        >
                          {path.action.secondaryLabel}{" "}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white">
              {t.budgetTitle}
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-zinc-300">
              {t.budgetDetail}
            </p>
          </div>

          <div className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
                {t.principlesEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
                {t.principlesTitle}
              </h2>
            </div>
            <div className="border-t border-white/10">
              {t.principles.map((principle, index) => (
                <div
                  key={principle.title}
                  className="grid gap-3 border-b border-white/10 py-6 sm:grid-cols-[2rem_1fr]"
                >
                  <span className="font-mono text-xs text-zinc-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">
                      {principle.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                      {principle.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="mt-20 rounded-2xl border border-white/10 bg-white/[0.045] p-6 md:p-10">
            <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
                  {t.contactEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-white">
                  {t.contactTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {t.contactClose}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-300">{t.contactIntro}</p>
                <ol className="mt-4 space-y-3">
                  {t.contactItems.map((item, index) => (
                    <li key={item} className="flex gap-3 text-sm leading-7">
                      <span className="font-mono text-amber-300/90">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ol>
                <a
                  href={buildMailto(lang)}
                  className={cn(
                    buttonVariants(),
                    "mt-7 bg-amber-400 text-[#211300] hover:bg-amber-300"
                  )}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {t.contactButton}
                </a>
              </div>
            </div>
          </section>

          <div className="mt-10 flex items-center justify-center gap-3 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4" />
            <span>yz@superlinear.academy</span>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href={withLanguage("/", lang)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
