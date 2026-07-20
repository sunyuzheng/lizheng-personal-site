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
    navSub: "Podcast & video invitations",
    eyebrow: "Podcasts · Video · Long-form",
    h1: "Let’s make a conversation only your show could create.",
    intro:
      "My work has moved across economics, big tech, AI products, education, and independent media. If you are pursuing a question about AI, work, learning, or judgment, I can bring first-hand cases and claims that welcome pressure-testing. You define the show; the conversation should have its own edge.",
    heroProofs: [
      "Cornell Economics PhD",
      "Amazon · Meta · Tencent · Statsig",
      "200+ published conversations",
      "400K+ cross-platform audience",
    ],
    questionCta: "See three representative conversations",
    kitCta: "Open the host kit",
    stanceEyebrow: "NOT A PRESS TOUR",
    stanceTitle: "I am not coming to repeat a polished set of talking points.",
    stanceDetail:
      "The best episodes begin with the host’s editorial instinct. I will prepare sources, cases, and my strongest current view; you can challenge any of it. AI Builders and Stay Superlinear can appear when they are useful live cases—not as the reason for the episode.",
    formatsEyebrow: "WHAT I BRING INTO THE ROOM",
    formatsTitle:
      "More than one set of AI talking points: several real arenas.",
    formats: [
      {
        number: "01",
        title: "First-hand operating context",
        detail:
          "From economics and big tech to an AI startup, courses, community, and independent media—I have seen the same question carry different costs inside different systems.",
      },
      {
        number: "02",
        title: "Claims that can be revisited",
        detail:
          "I leave timestamps on public views, then return to what held up, what failed, and which new evidence changed my mind.",
      },
      {
        number: "03",
        title: "An interviewer’s ear",
        detail:
          "After 200+ published conversations, I know when an answer is too neat, when to stop, and how to leave room for the host’s next question.",
      },
    ],
    questionsEyebrow: "QUESTIONS WITH REAL TENSION",
    questionsTitle: "A sharp question matters more than a complete topic list.",
    questionsIntro:
      "Every one of these can be challenged, and any one can carry the episode on its own.",
    questions: [
      "Why do stronger AI models leave most people’s real output nearly unchanged?",
      "As execution approaches zero cost, where do human value, organizational moats, and career leverage move?",
      "What is ‘stop using ChatGPT’ actually arguing against—and what does agentic work change?",
      "Across Amazon, Meta, Tencent, and Statsig, how do technology organizations make decisions and systematically get them wrong?",
      "Which of my public AI calls have aged well, which require a correction, and why?",
      "Can education and community build judgment without creating a new form of dependency?",
    ],
    otherDirections:
      "There are also grounded cases in experimentation, creator economics, China–U.S. technology, and the operating decisions behind AI Builders and Stay Superlinear. An episode does not need to cover them all; one good question is usually stronger.",
    conversationsEyebrow: "RECENT CHINESE CONVERSATIONS",
    conversationsTitle:
      "Three conversations, three different editorial relationships.",
    conversationsIntro:
      "Guest, role-swapping counterpart, and long-form host: these examples say more about what an episode can become than a list of available topics.",
    conversations: [
      {
        label: "INVITED GUEST / ROLE-SWAP · CROSSING",
        name: "How do power users actually use AI?",
        role: "Koji × Yuzheng · two-part video podcast",
        note: "Koji begins by pressing me on agentic work and learning. In the second half, we switch seats to examine AI investing—a single premise expanding naturally into two episodes.",
        proof: "67K+ Xiaoyuzhou plays · 130+ comments",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
        image: "https://img.youtube.com/vi/4hi93cDfVls/maxresdefault.jpg",
      },
      {
        label: "HOST · DEEP INTERVIEW",
        name: "Professor Liu Jia: neuroscience at the edge of AI",
        role: "Chair, Department of Psychology and Cognitive Science, Tsinghua University",
        note: "A nearly three-hour conversation moves from intelligence, learning, and consciousness to embodied AI, brain–computer interfaces, and education—one line of inquiry across several disciplines.",
        proof: "130K+ YouTube views · 460+ comments",
        href: "https://www.youtube.com/watch?v=-Et3GJRSI_0",
        image: "https://img.youtube.com/vi/-Et3GJRSI_0/maxresdefault.jpg",
      },
      {
        label: "DUAL RELEASE · TULONG DASHIHUA",
        name: "One recording, two shows each treated it as their own episode",
        role: "Yuzheng × Yang Ying (Tulong)",
        note: "On my channel it became a 95-minute profile moving from neuroscience into the realities of company-building. On Tulong’s show, the same recording became an episode about the trap of linear thinking—two editorial frames, both released in full.",
        proof: "90K+ YouTube views · 3,100+ likes",
        href: "https://www.youtube.com/watch?v=vd_oYgwQSBM",
        image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
      },
    ],
    metricsNote:
      "Public platform counts checked July 2026 and rounded down; platforms use different counting methods.",
    agreementsEyebrow: "HOW I WORK",
    agreementsTitle: "Respect the show, and bring a point of view.",
    agreements: [
      {
        title: "The host sets the frame.",
        detail:
          "You choose the questions, pacing, title, and final edit. We can align on direction before recording; I do not require pre-approval of questions or the final cut.",
      },
      {
        title: "Prepare around one or two real questions.",
        detail:
          "I can bring primary sources, data, first-hand cases, and the strongest counterargument I can find—not scripted answers.",
      },
      {
        title: "Disagreement can stay in.",
        detail:
          "Challenge the premise or follow an answer until it changes. I will distinguish facts, inference, experience, and what I simply do not know.",
      },
      {
        title: "Facts deserve care.",
        detail:
          "Before release, I can help check names, dates, quotations, and data. The editorial conclusion remains yours.",
      },
    ],
    coproduction:
      "For a jointly published episode, we can agree in advance on the primary cut, editing responsibility, clip rights, and release timing.",
    logisticsEyebrow: "RECORDING DETAILS",
    logisticsTitle: "Production details, without ceremony.",
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
        value: "Usually 60–120 minutes; adaptable to the show",
      },
      {
        icon: MapPin,
        label: "Scheduling",
        value: "Pacific Time; arranged around the host’s window",
      },
    ],
    kitEyebrow: "HOST KIT",
    kitTitle: "A producer can build the introduction from this page.",
    kitIntro:
      "Use whichever bio length fits the show. The facts and links are here for verification, not as required talking points.",
    shortBioLabel: "Short bio",
    shortBio:
      "Yuzheng Sun is an economist, AI educator, and founder of Superlinear. A Cornell PhD, he has worked across Amazon, Meta, Tencent, and Statsig, and focuses on turning judgment into testable, reusable systems that compound.",
    longBioLabel: "Long bio",
    longBio:
      "Yuzheng Sun (课代表立正) is a Cornell-trained economist, operator, author, and AI educator based in Silicon Valley. He has worked as an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG, and Principal Data Scientist and evangelist at Statsig. Today he builds Superlinear, teaches AI Builders, and co-leads Stay Superlinear with Yage. He has taught 3,000+ paying learners and held 200+ public conversations with researchers, founders, and operators. He is co-author of Growth Data Analytics Playbook and author of 《真本事》.",
    headshotLabel: "1200 × 1200 headshot",
    headshotCta: "Download headshot",
    factsTitle: "Public facts & source links",
    facts: [
      {
        label: "Dated public AI calls",
        href: "/#ideas",
      },
      {
        label: "200+ published conversations",
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
      "Current public audience: 400K+ followers across YouTube, Bilibili, and Xiaohongshu.",
    contactEyebrow: "PROGRAM INVITATIONS",
    contactTitle: "Start with the question you want to pursue.",
    contactDetail:
      "Send the show or channel, the core question, why it matters to your audience, the format and language, and a rough recording window. We can first see whether I am the right guest for that question, then prepare around your editorial direction. No audience swap or cross-promotion is assumed.",
    contactButton: "Discuss an episode",
    back: "Back to all collaboration options",
  },
  zh: {
    navSub: "播客与视频节目邀请",
    eyebrow: "播客 · 视频 · 深度对谈",
    h1: "把一个值得追的问题，聊成一期真正属于你的节目。",
    intro:
      "我的经历横跨经济学、科技大厂、AI 产品、教育与独立内容。如果你正在追一个关于 AI、工作、学习或判断的问题，我可以带来一线案例，以及愿意接受追问和反驳的判断。节目由你定义；对话应该有自己的锋芒。",
    heroProofs: [
      "康奈尔经济学博士",
      "Amazon · Meta · 腾讯 · Statsig",
      "200+ 场公开对谈",
      "400K+ 跨平台关注",
    ],
    questionCta: "先看三场代表对话",
    kitCta: "打开主持人素材",
    stanceEyebrow: "不是宣传通告",
    stanceTitle: "我不是来重复一套已经讲熟的标准答案。",
    stanceDetail:
      "真正好的节目，首先来自主持人的问题意识。我会准备原文、一线案例和自己当下最强的判断，你可以从任何地方追问或反驳。AI Builders 和 Stay Superlinear 只在能说明问题时作为真实案例出现，不是录制的目的。",
    formatsEyebrow: "我能带进录音棚的",
    formatsTitle: "不只是一套 AI 观点，而是几种真实现场。",
    formats: [
      {
        number: "01",
        title: "横跨几种现场",
        detail:
          "从经济学研究、科技大厂、AI 初创公司，到自己做课程、社区和内容；同一个问题，我见过不同组织里的真实代价。",
      },
      {
        number: "02",
        title: "可以复盘的公开判断",
        detail:
          "我习惯给观点留下时间戳，也愿意重看哪里说对、哪里说错、哪些新证据让我改口。",
      },
      {
        number: "03",
        title: "采访者的耳朵",
        detail:
          "做过 200+ 场公开对谈后，我知道一个答案什么时候太顺、什么时候该停，也知道如何把空间留给主持人的追问。",
      },
    ],
    questionsEyebrow: "有张力的问题",
    questionsTitle: "一个锋利的问题，比完整的选题清单更重要。",
    questionsIntro: "下面这些都可以被挑战，也可以只选一个往深处走。",
    questions: [
      "AI 模型越来越强，为什么多数人的实际产出没有同步跃升？",
      "当执行成本不断接近零，人的价值、组织的壁垒和职业杠杆会迁移到哪里？",
      "“停止使用 ChatGPT”究竟在反对什么？Agentic work 真正改变了哪一层？",
      "从 Amazon、Meta、腾讯到 Statsig，中美科技组织如何做出判断，又怎样系统性地犯错？",
      "回看我过去公开的 AI 判断，哪些成立、哪些需要改口，为什么？",
      "AI 时代的教育与社区，怎样培养判断力，而不是制造新的依赖？",
    ],
    otherDirections:
      "也可以谈增长实验、创作者经济、科技创业，以及 AI Builders 与 Stay Superlinear 的真实经营决策。一期节目不必面面俱到；一个足够好的问题，往往更有力量。",
    conversationsEyebrow: "近期中文对谈",
    conversationsTitle: "三场对话，三种节目合作方式。",
    conversationsIntro:
      "我做过受邀嘉宾，也和对方交换过采访角色，还主持过近三小时的深度访谈。它们比一串可聊话题更能说明，一期节目最终可以长成什么样。",
    conversations: [
      {
        label: "受邀嘉宾 / 交换角色 · 十字路口 Crossing",
        name: "高手怎么用 AI？普通人怎么学 AI？",
        role: "Koji × 课代表立正 · 上下两集视频播客",
        note: "上半场由 Koji 追问 agentic 工作方式与学习；下半场双方交换角色，继续讨论 2026 年的 AI 创业与投资。一个问题自然延展成两集，而不是把履历轮流讲一遍。",
        proof: "小宇宙 6.7 万+ 播放 · 130+ 评论",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
        image: "https://img.youtube.com/vi/4hi93cDfVls/maxresdefault.jpg",
      },
      {
        label: "主持 · 近三小时深度访谈",
        name: "刘嘉教授：站在脑科学顶端看 AI",
        role: "清华大学心理与认知科学系主任",
        note: "从智能、学习和意识，一路追到具身智能、脑机接口和 AI 时代教育；不同学科没有被做成话题拼盘，而是沿着同一条主线持续往下走。",
        proof: "YouTube 13 万+ 观看 · 460+ 评论",
        href: "https://www.youtube.com/watch?v=-Et3GJRSI_0",
        image: "https://img.youtube.com/vi/-Et3GJRSI_0/maxresdefault.jpg",
      },
      {
        label: "双向发布 · 屠龙大实话",
        name: "一场录制，两个节目都把它当成自己的正片",
        role: "课代表立正 × 杨滢（屠龙）",
        note: "在我的频道，它是一场从脑科学走到创业现场的 95 分钟人物访谈；在屠龙自己的节目，它被重新编辑为“线性思维害死人”。双方各自决定标题、结构和重点，再把完整对话带回自己的观众。",
        proof: "B站 8.5 万+ 播放 · 6,700+ 收藏",
        href: "https://www.bilibili.com/video/BV1krM46BEpn",
        image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
      },
    ],
    metricsNote:
      "公开平台数据核验于 2026 年 7 月，并向下取整；各平台统计口径不同，数字仅作内容表现参考。",
    agreementsEyebrow: "录制方式",
    agreementsTitle: "尊重你的节目，也带着自己的判断来。",
    agreements: [
      {
        title: "编辑判断属于主持人。",
        detail:
          "你决定问题、节奏、标题和最终剪辑。录制前可以对齐方向，但我不要求提前审核问题或成片。",
      },
      {
        title: "围绕一两个真问题准备。",
        detail:
          "我会带来原文、数据、一线案例，以及能找到的最强反方论证；不准备逐字答案。",
      },
      {
        title: "分歧不必剪掉。",
        detail:
          "欢迎反驳，也欢迎追问到我改口。我会尽量区分事实、推断、个人经验和不知道。",
      },
      {
        title: "事实可以一起核对。",
        detail:
          "涉及具体人名、日期、引文和数据，发布前可以一起核对；最终怎样呈现，仍由你决定。",
      },
    ],
    coproduction:
      "如果需要共同发布，我们会在录制前把主版本、剪辑责任、素材使用和发布时间说清楚。",
    logisticsEyebrow: "录制信息",
    logisticsTitle: "制作信息，简单说清。",
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
        value: "通常 60–120 分钟，也可适配节目形式",
      },
      {
        icon: MapPin,
        label: "时区",
        value: "美国太平洋时间；按双方档期协调",
      },
    ],
    kitEyebrow: "主持人素材",
    kitTitle: "制作人可以直接从这一页完成节目介绍。",
    kitIntro:
      "按节目需要选择简介长度。下面的事实和链接用于核对，不是必问话术。",
    shortBioLabel: "短介绍",
    shortBio:
      "孙煜征（课代表立正），经济学博士、AI 教育者，Superlinear 创始人。曾在 Amazon、Meta、腾讯和 Statsig 从事经济学、数据与 AI 工作，长期关注如何把判断变成可检验、可复用、能够持续复利的系统。",
    longBioLabel: "长介绍",
    longBio:
      "孙煜征（课代表立正）是康奈尔大学经济学博士、科技从业者、作者与 AI 教育者，现居硅谷。他做过 Amazon 经济学家、Meta 数据科学家、腾讯 IEG 数据与 AI 副总监，以及 Statsig 首席数据科学家与开发者布道师。现主理 Superlinear，教授 AI Builders，并与鸭哥共同主理 Stay Superlinear；累计有 3,000+ 付费学员，并与研究者、创始人和一线管理者完成 200+ 场公开对话。他合著《Growth Data Analytics Playbook》，著有《真本事》。",
    headshotLabel: "1200 × 1200 头像",
    headshotCta: "下载头像",
    factsTitle: "公开事实与来源",
    facts: [
      { label: "有时间戳的 AI 公开判断", href: "/#ideas" },
      { label: "200+ 场公开对谈", href: "/guests" },
      {
        label: "AI Builders · 3,000+ 付费学员",
        href: "https://ai-builders.com",
      },
      {
        label: "Stay Superlinear 年费会员",
        href: "https://staysuperlinear.com",
      },
    ],
    audienceFact: "当前公开受众：YouTube、B 站与小红书合计 400K+ 关注者。",
    contactEyebrow: "节目邀请",
    contactTitle: "从你真正想追的那个问题开始。",
    contactDetail:
      "请发来节目或频道、你想追的核心问题、为什么你的听众会关心它、形式与语言，以及大概的录制时间。我们先看我是不是这个问题的合适嘉宾，再沿着你的编辑方向认真准备。合作不以互推或换量为前提。",
    contactButton: "聊聊这期节目",
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
      ? "Show or channel:\n\nCore question:\n\nWhy this matters to your audience:\n\nFormat and language:\n\nRough recording window:\n"
      : "节目或频道：\n\n核心问题：\n\n为什么你的听众会关心：\n\n形式和语言：\n\n大概录制时间：\n";
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
              <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-3 border-y border-white/10 py-5">
                {t.heroProofs.map(proof => (
                  <p
                    key={proof}
                    className="text-xs font-medium leading-5 text-zinc-300"
                  >
                    {proof}
                  </p>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#conversations"
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

          <section id="conversations" className="scroll-mt-24 pt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {t.conversationsEyebrow}
            </p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold text-white md:text-4xl">
              {t.conversationsTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              {t.conversationsIntro}
            </p>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {t.conversations.map((conversation, index) => (
                <a
                  key={conversation.name}
                  href={conversation.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:border-amber-300/35 hover:bg-white/[0.055]",
                    index === 0 &&
                      "lg:col-span-2 lg:grid lg:grid-cols-[1.14fr_0.86fr]"
                  )}
                >
                  <div className="overflow-hidden bg-[#151A25]">
                    <img
                      src={conversation.image}
                      alt=""
                      className={cn(
                        "aspect-video h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]",
                        index === 0 && "lg:aspect-auto"
                      )}
                      loading="lazy"
                      width={1280}
                      height={720}
                    />
                  </div>
                  <div
                    className={cn(
                      "p-6",
                      index === 0 &&
                        "lg:flex lg:flex-col lg:justify-center lg:p-10"
                    )}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                      {conversation.label}
                    </p>
                    <h3
                      className={cn(
                        "mt-3 flex items-start gap-2 text-xl font-semibold leading-snug text-white",
                        index === 0 && "md:text-3xl"
                      )}
                    >
                      <span>{conversation.name}</span>
                      <ExternalLink className="mt-1.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-amber-200/75">
                      {conversation.role}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">
                      {conversation.note}
                    </p>
                    <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-300">
                      {conversation.proof}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">
              {t.metricsNote}
            </p>
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
