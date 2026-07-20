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
        value: "Remote, or in person in Seattle",
      },
      {
        icon: Clock3,
        label: "Length",
        value: "Usually 60–120 minutes; adaptable to the show",
      },
      {
        icon: MapPin,
        label: "Based in",
        value: "Seattle · Pacific Time",
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
      "Yuzheng Sun (课代表立正) is a Cornell-trained economist, operator, author, and AI educator based in Seattle. He has worked as an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG, and Principal Data Scientist and evangelist at Statsig. Today he builds Superlinear, teaches AI Builders, and co-leads Stay Superlinear with Yage. He has taught 3,000+ paying learners and held 200+ public conversations with researchers, founders, and operators. He is co-author of Growth Data Analytics Playbook and author of 《真本事》.",
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
    eyebrow: "播客 · 视频访谈 · 长对话",
    h1: "你来定问题，我们把它聊透。",
    intro:
      "我做过经济学研究，也先后在 Amazon、Meta、腾讯和 Statsig 做过经济学、数据和 AI 相关的工作。后来自己做课程、社区和内容。如果你想把 AI、工作、学习，或者一个具体的人生选择聊深，可以来找我。我会带着原文、数据，也会讲自己真正做过、见过的事。不怕追问，也不怕反驳。你的节目，你来定方向。",
    heroProofs: [
      "康奈尔经济学博士",
      "Amazon · Meta · 腾讯 · Statsig",
      "200+ 场公开对谈",
      "YouTube · B站 · 小红书 40 万+ 关注者",
    ],
    questionCta: "先看三场对话",
    kitCta: "查看嘉宾资料",
    stanceEyebrow: "不是来跑通告",
    stanceTitle: "如果只是把我讲过的话再讲一遍，就没必要录。",
    stanceDetail:
      "你比我更清楚自己的听众，也更清楚这期节目该从哪里切入。我会围绕你的问题准备原文和案例，也会把自己现在怎么想的理清楚。哪一点站不住，都可以当场追问。如果聊到 AI Builders 和 Stay Superlinear，是因为里面正好有值得讲的案例，不会为了宣传硬塞进来。",
    formatsEyebrow: "我能带来的",
    formatsTitle: "这里面的事，我自己做过，也踩过坑。",
    formats: [
      {
        number: "01",
        title: "不只从一个位置看问题",
        detail:
          "我做过经济学研究，也在大厂和 AI 创业公司一线工作过；现在自己做课程、社区和内容。同一个问题，放在学术研究、大公司、创业公司和自己的生意里，答案常常完全不同。为什么会这样，我可以慢慢拆。",
      },
      {
        number: "02",
        title: "过去说过的话，可以翻旧账",
        detail:
          "我公开讲过的判断大多留有时间戳。哪里说对、哪里说错、什么新证据让我改口，都可以摊开聊。",
      },
      {
        number: "03",
        title: "我也坐过主持人的位置",
        detail:
          "做过 200 多场对谈后，我知道嘉宾最容易把答案讲得太满，也知道什么时候该停下来，让你继续往下问。",
      },
    ],
    questionsEyebrow: "可以聊什么",
    questionsTitle: "不用列十个话题。挑一个真有分歧的，往下聊。",
    questionsIntro: "下面这些问题，我最近一直在想，其中不少还没想明白。",
    questions: [
      "AI 模型越来越强，为什么大多数人的实际产出几乎没变？",
      "AI 把执行变得越来越便宜以后，人和公司真正值钱的东西还剩什么？",
      "我为什么说“停止使用 ChatGPT”？从聊天框到 Agent，工作方式到底变了什么？",
      "在 Amazon、Meta、腾讯和 Statsig，我见过的大公司和创业公司，通常怎么做判断，又怎么把自己带偏？",
      "回头看我过去的 AI 判断，哪些说对了，哪些现在必须改口？",
      "一门课、一个社区，到底是在帮人长本事，还是让人越来越离不开老师和圈子？",
    ],
    otherDirections:
      "增长实验、创作者怎么赚钱、科技创业也都能聊。AI Builders 和 Stay Superlinear 是怎么做起来的、哪里做错过，我也可以讲得很具体。不用一口气全塞进去，挑一个问题聊透就够了。",
    conversationsEyebrow: "最近几场中文对话",
    conversationsTitle: "我做过嘉宾，也做过主持。还有一场，双方各剪各的。",
    conversationsIntro:
      "这三场里，我坐的位置都不一样。看完大概就知道，我在节目里会是什么样。",
    conversations: [
      {
        label: "做嘉宾，后半场换位提问 · 十字路口 Crossing",
        name: "高手怎么用 AI？普通人怎么学 AI？",
        role: "与 Koji 的上下两集视频播客",
        note: "Koji 先问我怎么用 Agent、怎么学 AI。聊到后半场，我们干脆换了位置，我问他怎么看 2026 年的 AI 创业和投资。最后自然做成了上下两集。",
        proof: "小宇宙 6.7 万+ 播放 · 130+ 评论",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
        image: "https://img.youtube.com/vi/4hi93cDfVls/maxresdefault.jpg",
      },
      {
        label: "做主持，一口气聊了近三小时",
        name: "刘嘉教授：从脑科学聊到 AI 和教育",
        role: "清华大学心理与认知科学系主任",
        note: "从智能、学习和意识，一路聊到具身智能、脑机接口和教育。话题很多，但一直追着同一个问题：我们到底该怎样理解智能？",
        proof: "YouTube 13 万+ 观看 · 460+ 评论",
        href: "https://www.youtube.com/watch?v=-Et3GJRSI_0",
        image: "https://img.youtube.com/vi/-Et3GJRSI_0/maxresdefault.jpg",
      },
      {
        label: "同一场录制，两边各发自己的正片",
        name: "我和屠龙，用一场对话做了两期不同的节目",
        role: "课代表立正 × 杨滢（屠龙）",
        note: "我这边从她的脑科学背景聊到创业；屠龙那边把主线定成“线性思维害死人”。同一场录制，双方各自定标题、结构和重点，最后剪成了两期不一样的完整节目。",
        proof: "B站 8.5 万+ 播放 · 6,700+ 收藏",
        href: "https://www.bilibili.com/video/BV1krM46BEpn",
        image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
      },
    ],
    metricsNote: "播放与互动数据截至 2026 年 7 月。",
    agreementsEyebrow: "怎么一起录",
    agreementsTitle: "录之前把边界说清，录的时候就可以放开聊。",
    agreements: [
      {
        title: "怎么问、怎么剪，你说了算。",
        detail:
          "可以提前对一下方向，但不用提前给我问题清单，成片也不用给我审。",
      },
      {
        title: "我会做功课，但不背稿。",
        detail:
          "原文、数据和案例我会准备，也会先想一遍，别人最可能从哪里反对我。不会准备逐字答案。",
      },
      {
        title: "不同意也没关系。",
        detail:
          "可以反驳，也可以追问到我改口。我会说清楚哪些是事实，哪些是我的判断，哪些我确实不知道。",
      },
      {
        title: "具体事实，发布前一起核对。",
        detail:
          "人名、日期、引文和数据，我愿意帮忙查；最后怎么呈现，还是你决定。",
      },
    ],
    coproduction:
      "如果双方都要发，录前把谁来剪主版、素材怎么用、什么时候发说清楚，后面就省事。",
    logisticsEyebrow: "录制信息",
    logisticsTitle: "录制怎么安排",
    logistics: [
      { icon: Languages, label: "语言", value: "中文或英文" },
      {
        icon: MonitorUp,
        label: "形式",
        value: "远程；西雅图也可以线下",
      },
      {
        icon: Clock3,
        label: "时长",
        value: "通常聊 60–120 分钟，按你的节目调整",
      },
      {
        icon: MapPin,
        label: "常驻",
        value: "西雅图 · 美国太平洋时间",
      },
    ],
    kitEyebrow: "嘉宾资料",
    kitTitle: "做节目介绍需要的资料，都在这里。",
    kitIntro: "短版、长版，你按节目需要选。经历和数据都附了链接，方便核对。",
    shortBioLabel: "短介绍",
    shortBio:
      "孙煜征（课代表立正），康奈尔大学经济学博士，Superlinear 创始人。曾在 Amazon、Meta、腾讯和 Statsig 从事经济学、数据与 AI 工作，现在主要做 AI 教育、内容和社区，关心个人和公司怎样把 AI 真正用进工作。",
    longBioLabel: "长介绍",
    longBio:
      "孙煜征（课代表立正）毕业于康奈尔大学，获经济学博士学位，现居西雅图。他先后做过 Amazon 经济学家、Meta 数据科学家、腾讯 IEG 数据与 AI 副总监，以及 Statsig 首席数据科学家和开发者布道师。现在主理 Superlinear，开设 AI Builders 课程，并和鸭哥共同主理 Stay Superlinear。过去几年，他教过 3,000 多名付费学员，也主持或参与了 200 多场公开对谈。他合著英文书《Growth Data Analytics Playbook》，著有《真本事》。",
    headshotLabel: "1200 × 1200 头像",
    headshotCta: "下载头像",
    factsTitle: "相关链接",
    facts: [
      { label: "过去公开做过的 AI 判断", href: "/#ideas" },
      { label: "200+ 场公开对谈", href: "/guests" },
      {
        label: "AI Builders · 3,000+ 付费学员",
        href: "https://ai-builders.com",
      },
      {
        label: "Stay Superlinear 会员社区",
        href: "https://staysuperlinear.com",
      },
    ],
    audienceFact: "YouTube、B 站和小红书共 40 万+ 关注者。",
    contactEyebrow: "节目邀请",
    contactTitle: "邮件里先告诉我：你最想追问什么。",
    contactDetail:
      "发我节目或频道链接，再写清楚你最想追的那个问题、听众为什么会在意、想怎么录，以及大概什么时候方便。先看这个问题我是不是真有东西可讲；如果有，我们就约时间、开始准备。不需要先谈互推，也不用写一份完整提案。",
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
      : "节目或频道链接：\n\n最想追问的问题：\n\n为什么听众会在意：\n\n想怎么录：\n\n大概时间：\n";
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
