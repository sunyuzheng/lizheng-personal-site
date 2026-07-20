import CollabHeader from "@/components/collab/CollabHeader";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Clock3,
  Download,
  ExternalLink,
  Languages,
  Mail,
  MapPin,
  Mic2,
  MonitorUp,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import { CREATOR_COLLAB_PAGE_META } from "../../../shared/collab-meta";

const copy = {
  en: {
    navSub: "Podcasts & creator invitations",
    eyebrow: "Podcasts · Video · Long-form conversations",
    h1: "Invite me to your show.",
    intro:
      "If your audience is wrestling with a real question about AI, work, learning, or judgment, send the invitation. You own the format and editorial direction; I’ll come prepared, welcome hard questions, and say when I don’t know.",
    fitNote:
      "The size of the show is not the first filter. The question, whether I can genuinely contribute, and timing matter more.",
    questionCta: "See possible questions",
    kitCta: "Open the host kit",
    stanceEyebrow: "A GOOD CONVERSATION",
    stanceTitle:
      "Start with the audience’s question, not my résumé or a product launch.",
    stanceDetail:
      "We do not need to agree. The episode should leave people with a clearer way to think, a claim they can test, or a useful next move.",
    formatsEyebrow: "POSSIBLE FORMATS",
    formatsTitle: "The shape follows the question.",
    formats: [
      {
        number: "01",
        title: "Long-form interview",
        detail:
          "You set the questions and direction. I bring relevant sources, first-hand cases, and the strongest counterargument I can find.",
      },
      {
        number: "02",
        title: "Thesis audit or debate",
        detail:
          "Put a dated claim, live disagreement, or contested assumption on the table and examine where the evidence actually leads.",
      },
      {
        number: "03",
        title: "Builder breakdown",
        detail:
          "Take a real workflow, product, or creator problem and work through what AI should do, what a person must judge, and how the result gets tested.",
      },
    ],
    questionsEyebrow: "POSSIBLE STARTING POINTS",
    questionsTitle: "Questions I can do real work on.",
    questionsIntro:
      "These are starting points, not a fixed menu or a prewritten tour.",
    questions: [
      "As AI makes execution cheaper, where does human value move?",
      "What actually separates using AI from building with it?",
      "How do you form strong views without becoming trapped by them?",
      "Looking back at recent AI predictions: what was right, what was wrong, and why?",
      "How do economics, product work, and organizational experience change the way we think about careers and learning?",
    ],
    otherDirections:
      "Other useful directions include growth and experimentation, career leverage, China–U.S. technology, and when a long-running free community should add a paid membership layer—with Stay Superlinear as one live case.",
    conversationsEyebrow: "CONVERSATIONS I’VE HOSTED",
    conversationsTitle: "These show how I prepare for a serious conversation.",
    conversations: [
      {
        name: "Gergely Orosz",
        role: "Founder, The Pragmatic Engineer",
        note: "Engineering careers, the technology industry, and the systems behind durable independent work.",
        href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
        image: "/english-network/gergely-orosz.webp",
      },
      {
        name: "Ryo Lu",
        role: "Head of Design, Cursor",
        note: "How an AI-native product is designed, where taste enters, and what changes when software starts to act.",
        href: "/guests/ryo-lu",
        image: "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
      },
      {
        name: "Vijaye Raji",
        role: "Founder, Statsig · CTO of Applications, OpenAI",
        note: "Experimentation, product judgment, company building, and what changes when AI becomes an operating layer.",
        href: "/guests/vijaye-raji",
        image: "https://img.youtube.com/vi/iw2QYZeVlOQ/maxresdefault.jpg",
      },
    ],
    agreementsEyebrow: "WORKING AGREEMENT",
    agreementsTitle: "Clear boundaries make a better conversation.",
    agreements: [
      {
        title: "Your show, your editorial judgment.",
        detail:
          "You choose the questions, pacing, title, and final edit. I do not require pre-approval of questions or a final cut.",
      },
      {
        title: "Preparation helps; it does not control the interview.",
        detail:
          "I can share sources and cases before recording, then help fact-check names, dates, or data before release. Your argument and framing remain yours.",
      },
      {
        title: "Distribution is not the price of the interview.",
        detail:
          "No audience swap or cross-promotion commitment is required. If the finished conversation fits my audience and we agree on clip rights, we can discuss sharing the episode or excerpts.",
      },
      {
        title: "Editorial and commercial relationships stay separate.",
        detail:
          "Paid work, advisory relationships, and investments do not buy coverage or an appearance on my own channels. Any material relationship relevant to the conversation will be disclosed in the episode or notes.",
      },
    ],
    coproduction:
      "For a co-produced episode, we agree before recording on the primary cut, editing responsibility, clip rights, and release timing.",
    logisticsEyebrow: "RECORDING DETAILS",
    logisticsTitle: "Easy to schedule, clear before recording.",
    logistics: [
      { icon: Languages, label: "Languages", value: "Mandarin or English" },
      {
        icon: MonitorUp,
        label: "Format",
        value: "Remote, or in person in the San Francisco Bay Area",
      },
      {
        icon: Clock3,
        label: "Length",
        value: "Usually 45–90 minutes; adaptable to the show",
      },
      {
        icon: MapPin,
        label: "Scheduling",
        value: "Pacific Time; arranged around the host’s window",
      },
    ],
    kitEyebrow: "HOST KIT",
    kitTitle: "Everything useful for an introduction, now on the page.",
    kitIntro:
      "Use the bio length that fits your show. Facts and links below are provided for verification, not as required talking points.",
    shortBioLabel: "Short bio",
    shortBio:
      "Yuzheng Sun is an economist, AI educator, and founder of Superlinear. A Cornell PhD, he has worked across Amazon, Meta, Tencent, and Statsig, and focuses on turning judgment into testable, reusable systems that compound.",
    longBioLabel: "Long bio",
    longBio:
      "Yuzheng Sun (课代表立正) is a Cornell-trained economist, operator, author, and AI educator based in Silicon Valley. He has worked as an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG, and Principal Data Scientist and sole evangelist at Statsig. Today he teaches AI Builders and co-leads Stay Superlinear with Yage, has taught 3,000+ paying learners, and has held 200+ public conversations with researchers, founders, and operators. He is co-author of Growth Data Analytics Playbook and author of 《真本事》.",
    headshotLabel: "1200 × 1200 headshot",
    headshotCta: "Download headshot",
    factsTitle: "Public facts & source links",
    facts: [
      {
        label: "Dated public AI calls",
        href: "/#ideas",
      },
      {
        label: "200+ guest conversations",
        href: "/guests",
      },
      {
        label: "AI Builders · 3,000+ paying learners",
        href: "https://ai-builders.com",
      },
      {
        label: "Stay Superlinear membership",
        href: "https://staysuperlinear.com",
      },
    ],
    audienceFact:
      "Current public reach: 400K+ followers across YouTube, Bilibili, and Xiaohongshu. This is context, not a condition for collaboration.",
    contactEyebrow: "SEND AN INVITATION",
    contactTitle: "A few plain sentences are enough.",
    contactDetail:
      "Send a link to the show, the question you want to explore, the format and language, and a rough recording window. No polished deck, full outline, or cross-promotion promise needed.",
    contactButton: "Invite Yuzheng",
    back: "Back to all collaboration options",
  },
  zh: {
    navSub: "播客与创作者邀请",
    eyebrow: "播客 · 视频 · 深度对谈",
    h1: "邀请我上你的节目。",
    intro:
      "如果你的听众或观众正在面对一个关于 AI、工作、学习或判断的真实问题，欢迎把邀请发来。你决定节目的形式和编辑方向；我会认真准备，欢迎尖锐问题，也会坦白哪些事情我还不知道。",
    fitNote:
      "节目体量不是首要标准。问题是否值得谈、我是否真能贡献，以及时间是否合适，才是。",
    questionCta: "看可以从哪些问题开始",
    kitCta: "打开主持人素材",
    stanceEyebrow: "一场好对话",
    stanceTitle: "从观众真正关心的问题出发，不是从我的履历或产品发布出发。",
    stanceDetail:
      "我们不必同意。录完后，应该让观众多一套能带走的判断方式、一个可以验证的说法，或者一个有用的下一步。",
    formatsEyebrow: "可以怎么录",
    formatsTitle: "形式应该服务问题。",
    formats: [
      {
        number: "01",
        title: "长篇访谈",
        detail:
          "你决定问题和方向。我带来相关原文、一线案例，以及我能找到的最强反方论证。",
      },
      {
        number: "02",
        title: "判断复盘或辩论",
        detail:
          "把一个有时间戳的判断、真实分歧或有争议的假设放到桌上，看证据究竟把我们带到哪里。",
      },
      {
        number: "03",
        title: "Builder 拆解",
        detail:
          "拿一个真实工作流、产品或创作者问题，现场拆清 AI 该做什么、人必须判断什么、结果怎么验证。",
      },
    ],
    questionsEyebrow: "可能的起点",
    questionsTitle: "这些问题，我可以真正做功课。",
    questionsIntro: "它们是起点，不是固定菜单，也不是写好的巡回话术。",
    questions: [
      "当 AI 让执行越来越便宜，人的价值会往哪里移动？",
      "从会用 AI 到能用 AI 构建，真正的门槛是什么？",
      "如何形成强观点，又不把自己困在观点里？",
      "回看过去几年的 AI 判断：哪里说对了，哪里说错了，为什么？",
      "经济学、产品与组织经验，如何改变我们对职业和学习的判断？",
    ],
    otherDirections:
      "其他可聊方向包括增长与实验、职业杠杆、中美科技，以及一个长期免费的社区在什么时候、为什么应该增加付费会员层——Stay Superlinear 可以作为一个正在发生的案例。",
    conversationsEyebrow: "我主持过的对谈",
    conversationsTitle: "这些节目能看出我会如何为一场认真对话做准备。",
    conversations: [
      {
        name: "Gergely Orosz",
        role: "The Pragmatic Engineer 创始人",
        note: "工程师职业、科技行业，以及能够长期运行的独立工作系统。",
        href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
        image: "/english-network/gergely-orosz.webp",
      },
      {
        name: "Ryo Lu",
        role: "Cursor 设计负责人",
        note: "AI-native 产品如何被设计，品味在哪里进入，软件开始行动后什么发生变化。",
        href: "/guests/ryo-lu",
        image: "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
      },
      {
        name: "Vijaye Raji",
        role: "Statsig 创始人 · OpenAI CTO of Applications",
        note: "实验、产品判断、公司构建，以及 AI 成为运营底层后的变化。",
        href: "/guests/vijaye-raji",
        image: "https://img.youtube.com/vi/iw2QYZeVlOQ/maxresdefault.jpg",
      },
    ],
    agreementsEyebrow: "合作约定",
    agreementsTitle: "边界说清，对话才会更好。",
    agreements: [
      {
        title: "这是你的节目，编辑判断属于你。",
        detail:
          "你决定问题、节奏、标题和最终剪辑。我不要求提前审核问题或成片。",
      },
      {
        title: "准备服务事实，不控制采访。",
        detail:
          "我可以在录制前提供原文和案例，发布前协助核对人名、日期和数据。你的论点和框架仍属于你。",
      },
      {
        title: "分发不是访谈的交换价格。",
        detail:
          "不要求换量，也不以互推为合作条件。如果成片适合我的受众，双方也同意素材使用方式，可以再讨论转发正片或剪出片段。",
      },
      {
        title: "内容判断与商业关系分开。",
        detail:
          "付费合作、顾问关系和投资，不会换来我个人频道的采访或内容露出。与对话有关的实质利益关系，会在节目或说明中披露。",
      },
    ],
    coproduction:
      "如果是双方共同制作、共同发布，我们会在录制前把主版本、剪辑责任、素材使用和发布时间说清楚。",
    logisticsEyebrow: "录制信息",
    logisticsTitle: "好安排，开录前说清。",
    logistics: [
      { icon: Languages, label: "语言", value: "普通话或英文" },
      {
        icon: MonitorUp,
        label: "形式",
        value: "远程，或旧金山湾区线下",
      },
      {
        icon: Clock3,
        label: "时长",
        value: "通常 45–90 分钟，也可适配节目形式",
      },
      {
        icon: MapPin,
        label: "时区",
        value: "美国太平洋时间；随主持人档期协调",
      },
    ],
    kitEyebrow: "主持人素材",
    kitTitle: "节目介绍需要的信息，都放在网页上。",
    kitIntro:
      "按节目需要选择简介长度。下面的事实和链接用于核对，不是必问话术。",
    shortBioLabel: "短介绍",
    shortBio:
      "孙煜征（课代表立正），经济学博士、AI 教育者，Superlinear 创始人。曾在 Amazon、Meta、腾讯和 Statsig 从事经济学、数据与 AI 工作，长期关注如何把判断变成可检验、可复用、能够持续复利的系统。",
    longBioLabel: "长介绍",
    longBio:
      "孙煜征（课代表立正）是康奈尔大学经济学博士、管理者、作者与 AI 教育者，现居硅谷。他做过 Amazon 经济学家、Meta 数据科学家、腾讯 IEG 数据与 AI 副总监，以及 Statsig 首席数据科学家和唯一布道师。现教授 AI Builders，并与鸭哥共同主理 Stay Superlinear；累计有 3,000+ 付费学员，并与研究者、创始人和一线管理者完成 200+ 场公开对话。他合著《Growth Data Analytics Playbook》，著有《真本事》。",
    headshotLabel: "1200 × 1200 头像",
    headshotCta: "下载头像",
    factsTitle: "公开事实与来源",
    facts: [
      { label: "有时间戳的 AI 公开判断", href: "/#ideas" },
      { label: "200+ 场嘉宾对话", href: "/guests" },
      {
        label: "AI Builders · 3,000+ 付费学员",
        href: "https://ai-builders.com",
      },
      {
        label: "Stay Superlinear 年费会员",
        href: "https://staysuperlinear.com",
      },
    ],
    audienceFact:
      "当前公开触达：YouTube、B 站与小红书合计 400K+ 关注者。这是背景信息，不是合作条件。",
    contactEyebrow: "发出邀请",
    contactTitle: "几句话就够。",
    contactDetail:
      "发来节目链接、你想讲清的问题、形式与语言，以及大概的录制时间。无需先做完整提案或提纲，也不需要承诺互推。",
    contactButton: "邀请立正",
    back: "回到全部合作入口",
  },
};

function buildCreatorMailto(lang: "en" | "zh") {
  const subject =
    lang === "en"
      ? "Podcast or creator invitation for Yuzheng Sun"
      : "邀请课代表立正参与节目";
  const body =
    lang === "en"
      ? "Show link:\n\nQuestion to explore:\n\nFormat and language:\n\nRough recording window:\n"
      : "节目链接：\n\n想讲清的问题：\n\n形式和语言：\n\n大概录制时间：\n";
  return `mailto:yz@superlinear.academy?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function CreatorCollab() {
  const { lang } = useLanguage();
  const t = copy[lang];

  useEffect(
    () =>
      applyPageSeo({
        ...CREATOR_COLLAB_PAGE_META[lang],
        locale: lang === "zh" ? "zh_CN" : "en_US",
      }),
    [lang]
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,191,36,0.08)_0%,rgba(11,15,26,0)_30rem)]" />
      <CollabHeader
        backHref="/collab"
        section={{ en: "Podcasts & creators", zh: "播客与视频" }}
      />

      <main className="relative z-10">
        <section className="container py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
                {t.eyebrow}
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] text-white md:text-6xl">
                {t.h1}
              </h1>
              <p className="mt-6 text-lg leading-8 text-zinc-300">{t.intro}</p>
              <p className="mt-5 border-l border-amber-300/50 pl-4 text-sm leading-7 text-zinc-400">
                {t.fitNote}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#questions"
                  className={cn(
                    buttonVariants(),
                    "bg-amber-400 text-[#211300] hover:bg-amber-300"
                  )}
                >
                  {t.questionCta}
                  <ArrowDown className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="#host-kit"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                  )}
                >
                  {t.kitCta}
                </a>
              </div>
            </div>
            <figure>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151A25]">
                <img
                  src="/hero/acquired-behind-scenes-desktop.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired"
                      : "课代表立正与 Acquired 主播 Ben Gilbert、David Rosenthal 对谈"
                  }
                  className="aspect-[4/3] w-full object-cover object-center"
                  width={2400}
                  height={1600}
                />
              </div>
              <figcaption className="mt-3 text-xs leading-5 text-zinc-400">
                {lang === "en"
                  ? "With Ben Gilbert and David Rosenthal of Acquired · Significance Summit"
                  : "与 Acquired 主播 Ben Gilbert、David Rosenthal 对谈 · Significance Summit"}
              </figcaption>
            </figure>
          </div>

          <section className="mt-20 border-y border-white/10 py-12 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
                  {t.stanceEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                  {t.stanceTitle}
                </h2>
              </div>
              <p className="self-end text-lg leading-8 text-zinc-300">
                {t.stanceDetail}
              </p>
            </div>
          </section>

          <section className="mt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {t.formatsEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              {t.formatsTitle}
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {t.formats.map(format => (
                <article
                  key={format.number}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 md:p-7"
                >
                  <span className="font-mono text-xs text-amber-300">
                    {format.number}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {format.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {format.detail}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="questions" className="scroll-mt-24 pt-20">
            <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
                  {t.questionsEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                  {t.questionsTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {t.questionsIntro}
                </p>
              </div>
              <div className="border-t border-white/10">
                {t.questions.map((question, index) => (
                  <div
                    key={question}
                    className="grid gap-3 border-b border-white/10 py-5 sm:grid-cols-[2.5rem_1fr]"
                  >
                    <span className="font-mono text-xs text-zinc-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-lg font-medium leading-8 text-zinc-200">
                      {question}
                    </p>
                  </div>
                ))}
                <p className="mt-6 text-sm leading-7 text-zinc-400">
                  {t.otherDirections}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {t.conversationsEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              {t.conversationsTitle}
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {t.conversations.map(conversation => (
                <a
                  key={conversation.name}
                  href={withLanguage(conversation.href, lang)}
                  target={
                    conversation.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    conversation.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:border-white/25"
                >
                  <img
                    src={conversation.image}
                    alt={conversation.name}
                    className="aspect-video w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                  <div className="p-5">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                      {conversation.name}
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-600" />
                    </h3>
                    <p className="mt-1 text-xs text-amber-300/80">
                      {conversation.role}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      {conversation.note}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="mt-20 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
                  {t.agreementsEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                  {t.agreementsTitle}
                </h2>
              </div>
              <div className="border-t border-white/10">
                {t.agreements.map((agreement, index) => (
                  <div
                    key={agreement.title}
                    className="grid gap-3 border-b border-white/10 py-5 sm:grid-cols-[2.5rem_1fr]"
                  >
                    <span className="font-mono text-xs text-zinc-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">
                        {agreement.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        {agreement.detail}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="mt-6 text-sm leading-7 text-zinc-300">
                  {t.coproduction}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {t.logisticsEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              {t.logisticsTitle}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {t.logistics.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-[#0F1420] p-6">
                    <Icon className="h-5 w-5 text-amber-300" />
                    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-200">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="host-kit" className="scroll-mt-24 pt-20">
            <div className="rounded-2xl border border-white/10 bg-[#F2F0EA] p-6 text-[#191712] md:p-10">
              <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8B4A19]">
                    {t.kitEyebrow}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                    {t.kitTitle}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#5C574D]">
                    {t.kitIntro}
                  </p>
                  <img
                    src="/yuzheng-sun-headshot.jpg"
                    alt={lang === "en" ? "Yuzheng Sun" : "孙煜征（课代表立正）"}
                    className="mt-7 aspect-square w-full max-w-72 object-cover"
                    width={1200}
                    height={1200}
                    loading="lazy"
                  />
                  <p className="mt-3 text-xs text-[#6E685D]">
                    {t.headshotLabel}
                  </p>
                  <a
                    href="/yuzheng-sun-headshot.jpg"
                    download="yuzheng-sun-headshot.jpg"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#743B13] hover:text-[#A65318]"
                  >
                    <Download className="h-4 w-4" />
                    {t.headshotCta}
                  </a>
                </div>
                <div>
                  <div className="border-t border-[#D4D0C7] py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B4A19]">
                      {t.shortBioLabel}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#48443B]">
                      {t.shortBio}
                    </p>
                  </div>
                  <div className="border-t border-[#D4D0C7] py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B4A19]">
                      {t.longBioLabel}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#48443B]">
                      {t.longBio}
                    </p>
                  </div>
                  <div className="border-t border-[#D4D0C7] py-6">
                    <h3 className="text-lg font-semibold">{t.factsTitle}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {t.facts.map(fact => (
                        <a
                          key={fact.label}
                          href={withLanguage(fact.href, lang)}
                          target={
                            fact.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            fact.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="flex items-start justify-between gap-3 border border-[#D4D0C7] bg-white/45 p-4 text-sm font-medium leading-6 transition hover:border-[#BFAF98]"
                        >
                          <span>{fact.label}</span>
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8B4A19]" />
                        </a>
                      ))}
                    </div>
                    <p className="mt-5 text-xs leading-6 text-[#6E685D]">
                      {t.audienceFact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-20 rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-center md:p-10">
            <Mic2 className="mx-auto h-7 w-7 text-amber-300" />
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
              {t.contactEyebrow}
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold text-white md:text-4xl">
              {t.contactTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              {t.contactDetail}
            </p>
            <a
              href={buildCreatorMailto(lang)}
              className={cn(
                buttonVariants(),
                "mt-7 bg-amber-400 text-[#211300] hover:bg-amber-300"
              )}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t.contactButton}
            </a>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4" />
              <span>yz@superlinear.academy</span>
            </div>
          </section>

          <div className="mt-10 flex justify-center">
            <Link
              href={withLanguage("/collab", lang)}
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
