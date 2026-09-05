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
import { languageAlternates } from "../../../shared/page-meta";
import { buildPersonWebPageStructuredData } from "../../../shared/structured-data";

const guestAppearances = [
  {
    date: "2026.06.23",
    show: "屠龙大实话",
    title:
      "59. 线性思维害死人？和康奈尔大学经济学博士课代表立正扒一扒这个思维中的隐形巨坑",
    href: "https://www.xiaoyuzhoufm.com/episode/6a3a1a139d2f5743683c5833",
    format: "guest",
  },
  {
    date: "2026.06.10",
    show: "十字路口 Crossing",
    title: "高手怎么用 AI？普通人怎么学 AI？投资人如何投 AI？｜对谈课代表立正",
    href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
    format: "guest",
  },
  {
    date: "2026.05.24",
    show: "The Build Log",
    title: "#9 课代表：职场的权力是幻觉吗？探讨“借来的职权”与真正的影响力",
    titleEn:
      "#9 Is power at work an illusion? Borrowed authority and real influence",
    href: "https://www.xiaoyuzhoufm.com/episode/6a135fde2507d98728e967e4",
    format: "guest",
  },
  {
    date: "2026.05.21",
    show: "Grad Lounge 不止学术",
    title: "118. 从「象牙塔」到「真本事」，AI时代如何打造个人价值｜课代表立正",
    titleEn:
      "118. From the ivory tower to real capability: building personal value in the AI era",
    href: "https://www.xiaoyuzhoufm.com/episode/6a0efed2fe904f38739093d9",
    format: "guest",
  },
  {
    date: "2026.05.09",
    show: "Talk to JANE｜对话身边的人",
    title: "拆解职场进阶的世纪谎言｜Waking Up at the End of the Ladder",
    href: "https://www.xiaoyuzhoufm.com/episode/69fe3dcce1eb34a93902ac3c",
    format: "guest",
  },
  {
    date: "2026.04.23",
    show: "AI炼金术",
    title: "课代表立正：AI 课卖 2000 刀，偏偏坚持古法手搓",
    href: "https://www.xiaoyuzhoufm.com/episode/69ea11c5824bf96fa14802c9",
    format: "guest",
  },
  {
    date: "2026.04.20",
    show: "The Wanderers 流浪者",
    title: "从焦虑到上手：白领 / 投资者的 AI 实战第一课【串台课代表立正】",
    href: "https://www.xiaoyuzhoufm.com/episode/69e5d0661d989496e70ccc2e",
    format: "guest",
  },
  {
    date: "2026.04.07",
    show: "INDIGO TALK",
    title:
      "戒掉 ChatGPT 才能成为 AI 指挥家 / AI 革命是人类社会的第二次文艺复兴 · EP46",
    titleEn:
      "Quit ChatGPT to become an AI orchestrator / AI as a second Renaissance · EP46",
    href: "https://www.xiaoyuzhoufm.com/episode/69d3dbb3b977fb2c473d2a7e",
    format: "guest",
  },
  {
    date: "2026.03.30",
    show: "人民公园说AI",
    title: "腾讯“血脉觉醒”：马化腾朋友圈背后，小龙虾和大模型我都要！",
    href: "https://www.xiaoyuzhoufm.com/episode/69c7d350b977fb2c4774e5e8",
    format: "guest",
  },
  {
    date: "2026.03.26",
    show: "创见｜对话顶级创投大脑",
    title: "#031 关于 OpenClaw 被封杀以及我们为什么不建议普通人养龙虾？",
    href: "https://www.xiaoyuzhoufm.com/episode/69c511da852cf1b8bb01e246",
    format: "guest",
  },
  {
    date: "2026.03.10",
    show: "牛油果烤面包",
    title: "#148. 我们为什么 AI 焦虑，我们又该怎么脚踏实地",
    href: "https://www.xiaoyuzhoufm.com/episode/69af96999e77d8f89f26350d",
    format: "guest",
  },
  {
    date: "2026.02.26",
    show: "在路上｜ON THE ROAD",
    title: "Vol.74｜大厂的收入是幻象，你的焦虑也是",
    href: "https://www.xiaoyuzhoufm.com/episode/699fa41266e2c303776dcfa9",
    format: "guest",
  },
  {
    date: "2025.12.21",
    show: "破壁圆桌",
    title: "EP14：对话课代表立正：AI时代下，后悔没早点离开职场",
    href: "https://www.xiaoyuzhoufm.com/episode/6947c9a19f70e5d6b3795ff5",
    format: "guest",
  },
  {
    date: "2025.11.17",
    show: "小火车商业进化论",
    title: "课代表立正：知识内容大 V 分享 6 个你不知道的涨粉秘诀",
    href: "https://www.xiaoyuzhoufm.com/episode/691a7452d9014ae7a20f20d2",
    format: "guest",
  },
  {
    date: "2025.10.13",
    show: "StellaxAmy·自定义",
    title: "EP77 Startup 选择、AI Evals 怎么做、Data Science 未来",
    href: "https://www.xiaoyuzhoufm.com/episode/68ec746b1b46b7597d496852",
    format: "guest",
  },
  {
    date: "2025.10.05",
    show: "佐治亚小帅｜北美华人故事访谈",
    title: "S7E10 AI时代的新毕业生怎么办｜课代表立正",
    href: "https://www.xiaoyuzhoufm.com/episode/68e2ec149c0fb097394606a9",
    format: "guest",
  },
  {
    date: "2025.06.10",
    show: "硅谷101",
    title: "E195｜从工具到伙伴：七位 AI Agent 深度使用者的思考",
    titleEn: "E195 · From tool to partner: seven experienced AI agent users",
    href: "https://www.xiaoyuzhoufm.com/episode/684775cbcdecf72d4ca2fcc5",
    format: "panel",
  },
  {
    date: "2025.04.22",
    show: "The Build Log",
    title: "#1 课代表立正：打开第四面墙，走进课代表的世界",
    href: "https://www.xiaoyuzhoufm.com/episode/680746bf1f1db84a56df257b",
    format: "guest",
  },
  {
    date: "2025.03.06",
    show: "INDIGO TALK",
    title: "对谈课代表立正：AI 时代生存指南 · EP20",
    href: "https://www.xiaoyuzhoufm.com/episode/67ca084fe924d4525ad0db95",
    format: "guest",
  },
  {
    date: "2024.11.09",
    show: "王路在隐身",
    title: "康奈尔博士、数据科学家、玄学、阿毗达磨",
    href: "https://www.xiaoyuzhoufm.com/episode/672ed4ed43dc3a43872d1361",
    format: "guest",
  },
  {
    date: "2023.04.14",
    show: "商业 WHY 酱",
    title: "S3E03｜问怎么赚钱之前，先补一课关于 ChatGPT 的基本问题",
    titleEn:
      "S3E03 · Before asking how to profit, ask the basic questions about ChatGPT",
    href: "https://www.xiaoyuzhoufm.com/episode/643926bdb41b2b266b5962cf",
    format: "guest",
  },
  {
    date: "2023.02.22",
    show: "What’s Next｜科技早知道",
    title: "如何应对 ChatGPT？二级市场闭门研讨会精选｜S7E01 硅谷徐老师",
    titleEn:
      "How should we respond to ChatGPT? Highlights from a closed-door market discussion",
    href: "https://www.xiaoyuzhoufm.com/episode/63f5f66e1324e63d1259b079",
    format: "panel",
  },
  {
    date: "2020.12.14",
    show: "随机漫谈 Random Talk",
    title: "跨境电商都是怎么赚钱的？",
    href: "https://www.xiaoyuzhoufm.com/episode/5fd6d39fdee9c1e16d53932a",
    format: "guest",
  },
] as const;

type GuestAppearance = (typeof guestAppearances)[number];

function AppearanceCard({
  appearance,
  lang,
  panelLabel,
}: {
  appearance: GuestAppearance;
  lang: "en" | "zh";
  panelLabel: string;
}) {
  const title =
    lang === "en" && "titleEn" in appearance
      ? appearance.titleEn
      : appearance.title;

  return (
    <a
      href={appearance.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 flex-col bg-[#0F1420] p-4 transition hover:bg-[#151B28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-superlinear-on-dark"
    >
      <div className="flex items-center justify-between gap-3">
        <time
          dateTime={appearance.date.replaceAll(".", "-")}
          className="font-mono text-[10px] tabular-nums tracking-[0.12em] text-zinc-500"
        >
          {appearance.date}
        </time>
        <span className="flex flex-wrap items-center justify-end gap-2">
          {appearance.format === "panel" && (
            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-medium leading-none text-zinc-400">
              {panelLabel}
            </span>
          )}
          <ExternalLink
            className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-superlinear-on-dark"
            aria-hidden="true"
          />
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-zinc-100 transition group-hover:text-white">
        {appearance.show}
      </p>
      <p className="mt-1 text-xs leading-5 text-zinc-500 transition group-hover:text-zinc-400">
        {title}
      </p>
    </a>
  );
}

const copy = {
  en: {
    navSub: "Podcast & video invitations",
    eyebrow: "Podcasts · Video · Long-form",
    h1: "Take one real question all the way—and help the conversation travel farther.",
    intro: [
      "You set the question. I’ll bring first-hand experience and evidence, and we’ll follow the question wherever it leads. We can use your usual format; my team can also help with editing, clips, and co-publishing.",
    ],
    heroProofs: [
      {
        label: "Research to practice",
        value: "Cornell PhD · Amazon · Meta · Tencent · Statsig",
      },
      {
        label: "Long-form experience",
        value: "200+ public conversations · 23 verified guest appearances",
      },
      {
        label: "Cross-platform",
        value: "YouTube · Bilibili · Xiaohongshu · 400K+ followers",
      },
      {
        label: "Production-ready",
        value: "Remote or Seattle · editing and co-publishing available",
      },
    ],
    questionCta: "See the collaboration cases",
    kitCta: "Download the guest kit",
    formatsEyebrow: "WHERE THE VIEW COMES FROM",
    formatsTitle: "I have met the same questions from several sides.",
    formats: [
      {
        number: "01",
        title: "Research, products, organizations, and early-stage work",
        detail:
          "A Cornell Economics PhD led to work at Amazon, Meta, Tencent, and the early Statsig team. At Tencent I led a 30-person Data & AI team and received the highest performance rating in two consecutive cycles.",
        proof: "Mechanisms · product judgment · organizational reality",
      },
      {
        number: "02",
        title: "Keep the original judgment—and the corrections—public",
        detail:
          "In 2021 I described the ceiling of the dominant AI paradigm. In February 2023, before GPT-4, I argued that ChatGPT had begun to break it—and reasoned forward to cheaper inference, tool use, persistent memory, and AI-native systems. The original probabilities and later corrections remain public.",
        proof: "A dated, public chain of reasoning",
      },
      {
        number: "03",
        title: "Put the ideas inside a system I am responsible for",
        detail:
          "At Superlinear, the ideas meet courses, a 20,000+ member community, 700+ real projects, enterprise programs, and more than 200 public conversations. They have to remain useful after the talk is over.",
        proof: "Superlinear Academy · real projects · enterprise work",
      },
    ],
    questionsEyebrow: "WHERE AN EPISODE COULD BEGIN",
    questionsTitle: "Four questions that can carry a full conversation.",
    questionsIntro:
      "Choose the one your audience is already living through. We can take it from a sharp opening claim into mechanisms, first-hand cases, disagreement, and practical consequences.",
    questions: [
      {
        title:
          "When AI makes ‘being able to make’ cheap, why does a defining body of work matter more?",
        detail:
          "As acceptable first drafts multiply, the scarce parts move to choosing the problem, setting the standard, exercising craft, remaining recognizably responsible, and staying with the work. A defining work also compounds context, trust, and the next opportunity.",
        proof: "MAKE WHAT LASTS · creator work · real projects",
      },
      {
        title:
          "Will AI eliminate fake work—or make it far easier to manufacture?",
        detail:
          "AI can remove the interface tax between work and results. It can also produce reports, meeting notes, and visible activity at almost no cost. What should an organization measure when busyness becomes abundant?",
        proof: "Organizational design · incentives · enterprise AI",
      },
      {
        title: "What actually makes someone AI-native?",
        detail:
          "Tool fluency is the visible part. The deeper shift is to start from the result, recompute the whole workflow, build compounding context with AI, and remain accountable for the outcome.",
        proof: "AI Builders · 700+ community projects · enterprise programs",
      },
      {
        title: "How does a company know when its judgment is wrong?",
        detail:
          "Data, experiments, and professional process can correct a mistake—or fortify it. Across Amazon, Meta, Tencent, and Statsig: when do organizations get closer to reality, and when do they merely become better at explaining themselves?",
        proof: "Economics · data science · big tech and startups",
      },
    ],
    otherDirections:
      "Other directions include the public AI calls I made before GPT-4, experimentation, creator businesses, China–U.S. technology, and the design of AI education and community. One real question is stronger than a complete tour.",
    conversationsEyebrow: "TWO COLLABORATIONS · TWO KINDS OF PROOF",
    conversationsTitle:
      "Good content should hold on its own—and reward further investment.",
    conversationsIntro:
      "The Koji episode shows what the conversation can do with a simple remote setup and the host’s own channels. The Tulong episode shows what can happen when both teams edit, distribute, and build around the same recording.",
    conversations: [
      {
        priority: "lead",
        label: "CASE 01 · THE CONTENT HOLDS",
        name: "A remote conversation crossed long-form audio and three video platforms",
        role: "Crossing with Koji × Yuzheng Sun",
        note: "A 63-minute remote recording became one of Crossing’s two most-played episodes. Its clips set Koji’s all-time Douyin like record and annual Xiaohongshu save record. Koji’s team handled the production and publishing; my accounts did not co-publish, so the result is unusually clean evidence of the topic and conversation itself.",
        metrics: [
          {
            value: "67K",
            label: "Xiaoyuzhou plays",
            signal: "Show Top 2",
          },
          {
            value: "12K",
            label: "Douyin likes",
            signal: "Account all-time high",
          },
          {
            value: "8,343",
            label: "Xiaohongshu saves",
            signal: "Account annual high",
          },
          {
            value: "6,502",
            label: "WeChat Channels shares",
            signal: "Cross-platform sharing",
          },
        ],
        proofNote:
          "Also: 132 Xiaoyuzhou comments; 4,709 Xiaohongshu likes; 8,582 Douyin saves and 1,476 shares.",
        quote:
          "“A genuinely useful episode. I’m moving from ChatGPT to Codex and building up my context.” — Xiaoyuzhou listener",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
        linkLabel: "Listen on Xiaoyuzhou",
        image: "https://img.youtube.com/vi/4hi93cDfVls/maxresdefault.jpg",
        evidenceLabel: "View platform screenshots (4)",
        evidenceImages: [
          {
            src: "/collab/creator-proof/koji-xiaoyuzhou.webp",
            alt: "Crossing episode listed among the most popular with 67K plays and 132 comments",
            caption: "Xiaoyuzhou · 67K plays · 132 comments",
          },
          {
            src: "/collab/creator-proof/koji-xiaohongshu.webp",
            alt: "Koji clip on Xiaohongshu with 4,709 likes and 8,343 saves",
            caption: "Xiaohongshu · 4,709 likes · 8,343 saves",
          },
          {
            src: "/collab/creator-proof/koji-douyin.webp",
            alt: "Koji clip on Douyin with 12K likes, 8,582 saves and 1,476 shares",
            caption: "Douyin · 12K likes · account record",
          },
          {
            src: "/collab/creator-proof/koji-wechat.webp",
            alt: "Koji clip on WeChat Channels with 6,502 shares",
            caption: "WeChat Channels · 6,502 shares",
          },
        ],
      },
      {
        priority: "lead",
        label: "CASE 02 · BOTH SIDES AMPLIFY",
        name: "Two teams made different cuts—and introduced the guest to new audiences",
        role: "Yuzheng × Yang Ying (Tulong)",
        note: "Tulong’s team kept the voice of her show. Our team made a second long-form version and clips for Xiaohongshu, YouTube, Bilibili, and the Superlinear community. The collaboration produced breakout numbers and brought Tulong to viewers who had never encountered her before.",
        metrics: [
          {
            value: "58.7K",
            label: "Xiaohongshu likes",
            signal: "Co-published",
          },
          {
            value: "59.6K",
            label: "Xiaohongshu saves",
            signal: "More saves than likes",
          },
          {
            value: "110K+",
            label: "YouTube views",
            signal: "New viewers discovered Tulong",
          },
          {
            value: "108K+",
            label: "Bilibili views",
            signal: "Long-form reach",
          },
        ],
        proofNote:
          "Also: 11.3K Xiaohongshu shares and 1,088 comments; 3.6K YouTube likes and 481 comments; 8,026 Bilibili saves.",
        quote:
          "“I hadn’t known her before, but she’s incredibly cool. I hope they talk every year so we can see how her thinking changes.” — YouTube viewer (translated)",
        href: "https://www.youtube.com/watch?v=vd_oYgwQSBM&lc=UgxFa4IYFTFcAJUFOsd4AaABAg",
        linkLabel: "Watch the YouTube cut and comments",
        image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
        evidenceLabel: "Verify the latest Xiaohongshu result (1 screenshot)",
        evidenceImages: [
          {
            src: "/collab/creator-proof/tulong-performance.webp",
            alt: "Yuzheng and Tulong co-created Xiaohongshu video with 58.7K likes, 59.6K saves, 11.3K shares and 1,088 comments",
            caption:
              "Our cut · 58.7K likes · 59.6K saves · 11.3K shares · 1,088 comments",
          },
        ],
      },
      {
        priority: "supporting",
        label: "ANOTHER SAMPLE · I AM THE HOST",
        name: "Professor Liu Jia: from neuroscience to AI and education",
        role: "Chair, Department of Psychology and Cognitive Science, Tsinghua University",
        note: "This nearly three-hour conversation moves from intelligence, learning, and consciousness to embodied AI, brain–computer interfaces, and education. It has reached 130K+ YouTube views and 460+ comments.",
        metrics: [
          { value: "130K+", label: "YouTube views", signal: "Long-form" },
          { value: "460+", label: "comments", signal: "Deep discussion" },
          {
            value: "~3 hrs",
            label: "one continuous conversation",
            signal: "Full-length",
          },
        ],
        proofNote: "",
        quote: "",
        href: "https://www.youtube.com/watch?v=-Et3GJRSI_0",
        linkLabel: "Watch the full conversation",
        image: "https://img.youtube.com/vi/-Et3GJRSI_0/maxresdefault.jpg",
        evidenceLabel: "",
        evidenceImages: [],
      },
    ],
    metricsNote:
      "Counts come from public platform pages and screenshots captured in July 2026. Platforms use different counting methods.",
    appearancesEyebrow: "SELECTED BY OTHER SHOWS",
    appearancesTitle:
      "Invited across AI, technology, organizations, careers, and creator businesses.",
    appearancesIntro:
      "The list below emphasizes recognizable shows and repeat invitations. A complete 23-episode Xiaoyuzhou archive remains available for producers who want to inspect the full record.",
    programs: [
      {
        show: "Crossing with Koji",
        note: "Remote long-form · show Top 2",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
      },
      {
        show: "Tulong Dashihua",
        note: "Co-produced · cross-platform breakout",
        href: "https://www.xiaoyuzhoufm.com/episode/6a3a1a139d2f5743683c5833",
      },
      {
        show: "Silicon Valley 101",
        note: "AI Agent roundtable",
        href: "https://www.xiaoyuzhoufm.com/episode/684775cbcdecf72d4ca2fcc5",
      },
      {
        show: "INDIGO TALK",
        note: "Two invitations",
        href: "https://www.xiaoyuzhoufm.com/episode/69d3dbb3b977fb2c473d2a7e",
      },
      {
        show: "The Build Log",
        note: "Two invitations",
        href: "https://www.xiaoyuzhoufm.com/episode/6a135fde2507d98728e967e4",
      },
      {
        show: "What’s Next",
        note: "Pre-GPT-4 AI discussion · 2023",
        href: "https://www.xiaoyuzhoufm.com/episode/63f5f66e1324e63d1259b079",
      },
    ],
    appearancesArchive: "Open all 23 verified guest appearances",
    appearancesArchiveDetail:
      "The full Xiaoyuzhou archive is preserved here for producers who want to check topics, formats, and earlier work.",
    panelLabel: "Panel",
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
        title: "Disagreement can stay; a judgment can change.",
        detail:
          "I will state the view clearly and say what evidence could overturn it. The best conversations make me re-check—and sometimes change—how I think.",
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
    pdfCta: "Download the six-page Chinese guest kit",
    shortBioLabel: "Short bio",
    shortBio:
      "Yuzheng Sun (课代表立正) has a PhD in Economics from Cornell and is the founder of Superlinear Academy. He was an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG, and an early member of Statsig, which was later acquired by OpenAI. His work asks what capabilities and works matter more when AI makes execution cheaper.",
    longBioLabel: "Long bio",
    longBio:
      "Yuzheng Sun (课代表立正) has a PhD in Economics from Cornell and is a founder, operator, and author based in Seattle. He was an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG—where he led a 30-person team and received the highest performance rating in two consecutive cycles—and an early member of Statsig, which was later acquired by OpenAI. He founded Superlinear Academy, the parent institution for its free community, AI Builders, and Stay Superlinear. His defining idea is MAKE WHAT LASTS. As of August 2026, he has taught 3,000+ paying learners, held 200+ public conversations with researchers, founders, and operators, and built a free community of 20,000+ members with 700+ shared real-world projects. He is co-author of Growth Data Analytics Playbook and author of 《真本事》.",
    brandLineLabel: "One line for the introduction",
    brandLine: "MAKE WHAT LASTS.",
    headshotLabel: "1280 × 1280 headshot",
    headshotCta: "Download headshot",
    factsTitle: "Public facts & source links",
    facts: [
      {
        label: "Dated public AI calls",
        href: "/#judgment",
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
    contactEyebrow: "PROGRAM INVITATIONS",
    contactTitle:
      "If there is a question worth taking all the way, send it over.",
    contactDetail:
      "Send the show or channel, the question you most want to pursue, and a rough format and timing. If I have something genuinely new to add, we can set a time and prepare around the show.",
    businessContact: "Business contact: Miao (喵老师) | WeChat: FM13870617",
    contactButton: "Discuss an episode",
    back: "Back to all collaboration options",
  },
  zh: {
    navSub: "播客与视频节目邀请",
    eyebrow: "播客 · 视频访谈 · 长对话",
    h1: "把一个真问题聊透，\n也让它走得更远。",
    intro: [
      "你定问题。我带着亲历和证据来，和你一起把问题追到底。按你的节目方式录；需要时，我的团队也可以参与剪辑、切片与联合发布。",
    ],
    heroProofs: [
      {
        label: "研究到一线",
        value: "康奈尔博士 · Amazon · Meta · 腾讯 · Statsig",
      },
      {
        label: "长对话经验",
        value: "200+场公开对谈 · 23期做客记录",
      },
      {
        label: "跨平台内容",
        value: "YouTube · B站 · 小红书 · 40万+关注者",
      },
      {
        label: "制作协作",
        value: "远程或西雅图线下 · 可剪辑、切片与联发",
      },
    ],
    questionCta: "先看两次合作",
    kitCta: "下载嘉宾资料",
    formatsEyebrow: "这些判断从哪里来",
    formatsTitle: "这些问题，我在几个不同的位置上都亲手处理过。",
    formats: [
      {
        number: "01",
        title: "研究、产品、组织和创业现场",
        detail:
          "从康奈尔经济学博士，到Amazon、Meta、腾讯和Statsig早期团队。在腾讯，我带过30人的数据与AI团队，连续两个周期获得最高绩效。",
        proof: "机制 · 产品判断 · 组织现实",
      },
      {
        number: "02",
        title: "把当时的判断和后来的修正都留下",
        detail:
          "2021年，我公开解释了旧AI范式的能力上限；2023年2月、GPT-4发布前，我判断ChatGPT已经开始突破那道上限，并继续推演推理成本、工具连接、长期记忆与AI-native系统。原文的概率和后来复盘的错误都还留着。",
        proof: "一条可以回看的公开推理链",
      },
      {
        number: "03",
        title: "也把这些判断放进自己负责的系统里",
        detail:
          "Superlinear Academy、20,000+人的免费社区、700+真实项目、AI Builders和企业AI项目，都要求这些判断在节目结束以后继续有用。",
        proof: "Superlinear Academy · 真实项目 · 企业现场",
      },
    ],
    questionsEyebrow: "这期可以从哪里开始",
    questionsTitle: "四个足以撑起一整期的问题。",
    questionsIntro:
      "挑一个听众真的在碰到的问题。开头可以有一句够尖锐的判断，但接下来要把依据、反例和实际后果讲清楚。",
    questions: [
      {
        title: "AI把“能做”变便宜以后，为什么更需要代表作？",
        detail:
          "合格的第一版越来越多，真正稀缺的会转向选什么、做到什么程度、愿意为哪一种后果负责。代表作还会继续替一个人积累context、信誉和下一次机会。",
        proof: "MAKE WHAT LASTS · 创作者实践 · 真实项目",
      },
      {
        title: "AI会消灭fake work，还是让fake work多到看不完？",
        detail:
          "AI能减少工作与结果之间的摩擦，也能更便宜地制造汇报、会议纪要和忙碌痕迹。当‘看起来做了很多’不再稀缺，组织该看什么？",
        proof: "组织设计 · 激励机制 · 企业AI项目",
      },
      {
        title: "会用AI，和成为AI-native的人，中间差什么？",
        detail:
          "工具熟练度只是表面。更深的变化，是从结果出发重算整套工作，和AI一起积累长期context，并且继续为结果负责。",
        proof: "AI Builders · 700+社区项目 · 企业AI项目",
      },
      {
        title: "一家公司，怎样知道自己错了？",
        detail:
          "数据、实验和专业流程可以纠错，也能替错误加固。从Amazon、Meta、腾讯到Statsig，组织什么时候更接近现实，什么时候只是更会解释自己？",
        proof: "经济学 · 数据科学 · 大厂与创业公司",
      },
    ],
    otherDirections:
      "2023年GPT-4发布前留下的AI判断、增长实验、创作者商业、中美科技，以及AI教育和社区怎么做，也都有公开材料和亲历案例。一个真问题，比一张完整的话题清单更有力量。",
    conversationsEyebrow: "两次合作 · 两种证明",
    conversationsTitle: "好内容自己站得住，双方投入以后还能走得更远。",
    conversationsIntro:
      "Koji那期只用节目方自己的渠道：长音频有人听完，三个视频平台的切片也各自跑出来。屠龙那期则由双方分别编辑和分发，一场对话不只有了更大的影响力，也替节目和嘉宾找到了新的观众。",
    conversations: [
      {
        priority: "lead",
        label: "案例一 · 内容自己站得住",
        name: "一次远程录制，跨过长音频和三个视频平台",
        role: "十字路口 Crossing × 课代表立正",
        note: "远程录了63分钟，Koji团队完成全部制作和发布。这期成为《十字路口》播放前二，切片又刷新Koji抖音历史点赞和小红书年度收藏。我的账号没有联发，因此这组数据更接近题目和对话本身的表现。",
        metrics: [
          { value: "6.7万", label: "小宇宙播放", signal: "节目播放前二" },
          { value: "1.2万", label: "抖音点赞", signal: "账号历史最高" },
          { value: "8,343", label: "小红书收藏", signal: "账号年度最高" },
          { value: "6,502", label: "视频号转发", signal: "跨平台高转发" },
        ],
        proofNote:
          "其他数据：小宇宙132条评论；小红书4,709赞；抖音8,582收藏、1,476转发。",
        quote:
          "“很有帮助的一期，最近正在从ChatGPT转Codex，也在积累上下文。”——小宇宙听众",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
        linkLabel: "去小宇宙听完整节目",
        image: "https://img.youtube.com/vi/4hi93cDfVls/maxresdefault.jpg",
        evidenceLabel: "查看平台数据截图（4张）",
        evidenceImages: [
          {
            src: "/collab/creator-proof/koji-xiaoyuzhou.webp",
            alt: "《十字路口》节目最受欢迎页面，显示6.7万播放和132条评论",
            caption: "小宇宙 · 6.7万播放 · 132条评论",
          },
          {
            src: "/collab/creator-proof/koji-xiaohongshu.webp",
            alt: "Koji的小红书切片，显示4,709赞和8,343收藏",
            caption: "小红书 · 4,709赞 · 8,343收藏",
          },
          {
            src: "/collab/creator-proof/koji-douyin.webp",
            alt: "Koji的抖音切片，显示1.2万赞、8,582收藏和1,476转发",
            caption: "抖音 · 1.2万赞 · 账号历史最高",
          },
          {
            src: "/collab/creator-proof/koji-wechat.webp",
            alt: "Koji的视频号切片，显示6,502次转发",
            caption: "视频号 · 6,502转发",
          },
        ],
      },
      {
        priority: "lead",
        label: "案例二 · 双方投入继续放大",
        name: "双方各做一版，也把嘉宾带给了新观众",
        role: "课代表立正 × 杨滢（屠龙）",
        note: "屠龙团队保留自己的节目语言；我们再做一版长片和切片，发布到小红书、YouTube、B站和Superlinear社区。这次合作既有破圈数据，也让从未听过屠龙的新观众真正认识了她。",
        metrics: [
          { value: "5.87万", label: "小红书点赞", signal: "联合发布" },
          { value: "5.96万", label: "小红书收藏", signal: "收藏高于点赞" },
          { value: "11万+", label: "YouTube观看", signal: "新观众认识嘉宾" },
          { value: "10.8万+", label: "B站播放", signal: "长视频承接" },
        ],
        proofNote:
          "其他数据：小红书1.13万转发、1,088条评论；YouTube3,600赞、481条评论；B站8,026收藏。",
        quote:
          "“之前並不認識這位女士，但她太酷了！希望能每年都和她聊一下一年的回顧和明年的展望，想窺視她的思想變化。”——YouTube观众",
        href: "https://www.youtube.com/watch?v=vd_oYgwQSBM&lc=UgxFa4IYFTFcAJUFOsd4AaABAg",
        linkLabel: "看YouTube完整正片与评论",
        image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
        evidenceLabel: "核对最新小红书数据（1张截图）",
        evidenceImages: [
          {
            src: "/collab/creator-proof/tulong-performance.webp",
            alt: "课代表立正与屠龙联合发布的小红书视频，显示5.87万赞、5.96万收藏、1.13万转发和1,088条评论",
            caption: "我们的版本·5.87万赞·5.96万收藏·1.13万转发·1,088条评论",
          },
        ],
      },
      {
        priority: "supporting",
        label: "另一个样本 · 我做主持",
        name: "刘嘉教授：从脑科学聊到AI和教育",
        role: "清华大学心理与认知科学系主任",
        note: "这场近三小时的对话，从智能、学习和意识，一路追到具身智能、脑机接口与教育；在YouTube获得13万+观看和460+评论。",
        metrics: [
          { value: "13万+", label: "YouTube观看", signal: "长视频" },
          { value: "460+", label: "评论", signal: "深度讨论" },
          { value: "近3小时", label: "一场连续对话", signal: "完整长谈" },
        ],
        proofNote: "",
        quote: "",
        href: "https://www.youtube.com/watch?v=-Et3GJRSI_0",
        linkLabel: "看完整对话",
        image: "https://img.youtube.com/vi/-Et3GJRSI_0/maxresdefault.jpg",
        evidenceLabel: "",
        evidenceImages: [],
      },
    ],
    metricsNote: "数据来自2026年7月的平台页面与截图；各平台统计口径不同。",
    appearancesEyebrow: "节目做客",
    appearancesTitle: "从AI与技术组织，到职业选择与创作者商业。",
    appearancesIntro:
      "这里优先保留有辨识度的节目与重复邀请。完整23期小宇宙做客记录仍在页面后面，制作人可以随时核对题目、形式与成片。",
    programs: [
      {
        show: "十字路口 Crossing",
        note: "远程长谈 · 节目播放前二",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
      },
      {
        show: "屠龙大实话",
        note: "双方制作 · 跨平台破圈",
        href: "https://www.xiaoyuzhoufm.com/episode/6a3a1a139d2f5743683c5833",
      },
      {
        show: "硅谷101",
        note: "AI Agent深度使用者圆桌",
        href: "https://www.xiaoyuzhoufm.com/episode/684775cbcdecf72d4ca2fcc5",
      },
      {
        show: "INDIGO TALK",
        note: "两次邀请",
        href: "https://www.xiaoyuzhoufm.com/episode/69d3dbb3b977fb2c473d2a7e",
      },
      {
        show: "The Build Log",
        note: "两次邀请",
        href: "https://www.xiaoyuzhoufm.com/episode/6a135fde2507d98728e967e4",
      },
      {
        show: "What’s Next｜科技早知道",
        note: "2023年GPT-4发布前谈AI",
        href: "https://www.xiaoyuzhoufm.com/episode/63f5f66e1324e63d1259b079",
      },
    ],
    appearancesArchive: "展开全部23期做客记录",
    appearancesArchiveDetail:
      "完整的小宇宙记录保留在这里，方便制作人核对过往话题、节目形式和成片。",
    panelLabel: "圆桌",
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
        title: "分歧可以保留，判断也可以更新。",
        detail:
          "我会把观点讲清，也会说明什么证据能推翻它。最好的对话，是让我重新检查、甚至改变自己的想法。",
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
        value: "通常聊60–120分钟，按你的节目调整",
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
    pdfCta: "下载六页播客与视频访谈资料（PDF）",
    shortBioLabel: "短介绍",
    shortBio:
      "孙煜征（课代表立正），康奈尔大学经济学博士、Superlinear Academy创始人。曾任Amazon经济学家、Meta数据科学家、腾讯IEG数据与AI副总监，也是Statsig早期成员；Statsig后被OpenAI收购。他长期研究AI改变工作以后，什么能力和作品反而更重要。",
    longBioLabel: "长介绍",
    longBio:
      "孙煜征（课代表立正）毕业于康奈尔大学，获经济学博士学位，现居西雅图。他曾任Amazon经济学家、Meta数据科学家、腾讯IEG数据与AI副总监；在腾讯带过30人的数据与AI团队，连续两个周期获得最高绩效。他也是Statsig早期成员，Statsig后被OpenAI收购。他从大厂管理岗位进入早期创业公司，后来全职创办Superlinear Academy；AI Builders课程与Stay Superlinear会员都在这个母体下。截至2026年8月，他教过3,000多名付费学员，主持或参与了200多场公开对谈，并建立了一个拥有2万+成员、700+真实项目分享的免费社区。他合著英文书《Growth Data Analytics Playbook》，著有《真本事》。",
    brandLineLabel: "节目介绍可用的一句话",
    brandLine: "学点真本事，做点真东西。",
    headshotLabel: "1280 × 1280头像",
    headshotCta: "下载头像",
    factsTitle: "相关链接",
    facts: [
      { label: "过去公开做过的AI判断", href: "/#judgment" },
      { label: "200+场公开对谈", href: "/guests" },
      {
        label: "AI Builders · 3,000+付费学员",
        href: "https://ai-builders.com",
      },
      {
        label: "Stay Superlinear会员",
        href: "https://staysuperlinear.com",
      },
    ],
    contactEyebrow: "节目邀请",
    contactTitle: "如果你有一个值得聊透的问题，发给我们。",
    contactDetail:
      "发来节目或频道链接、你最想追的那个问题，以及大概的形式和时间。我们会尽快确认方向、录制与后续素材安排。",
    businessContact: "商务负责人：喵老师｜微信：FM13870617",
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
  const leadConversations = t.conversations.filter(
    conversation => conversation.priority === "lead"
  );
  const hostConversation = t.conversations.find(
    conversation => conversation.priority === "supporting"
  );

  useEffect(
    () =>
      applyPageSeo({
        ...CREATOR_COLLAB_PAGE_META[lang],
        locale: lang === "zh" ? "zh_CN" : "en_US",
        alternates: languageAlternates(
          CREATOR_COLLAB_PAGE_META.en.canonical,
          CREATOR_COLLAB_PAGE_META.zh.canonical
        ),
        jsonLd: buildPersonWebPageStructuredData({
          canonical: CREATOR_COLLAB_PAGE_META[lang].canonical,
          name: CREATOR_COLLAB_PAGE_META[lang].title,
          description: CREATOR_COLLAB_PAGE_META[lang].description,
          lang,
          lastModified: CREATOR_COLLAB_PAGE_META[lang].lastModified,
        }),
      }),
    [lang]
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <CollabHeader
        backHref="/collab"
        section={{ en: "Podcasts & creators", zh: "播客与视频" }}
      />

      <main className="relative z-10">
        <section className="container py-12 md:py-20">
          <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:gap-x-16 lg:gap-y-8">
            <div className="order-1 lg:col-start-1 lg:row-start-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                {t.eyebrow}
              </p>
              <h1 className="mt-5 max-w-3xl whitespace-pre-line text-4xl font-semibold leading-[1.08] text-white md:text-[3.5rem]">
                {t.h1}
              </h1>
            </div>
            <figure className="order-3 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
              <div className="overflow-hidden border border-white/10 bg-[#151A25]">
                <img
                  src="/hero/acquired-behind-scenes-desktop.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired"
                      : "课代表立正与Acquired的两位主播（Ben Gilbert、David Rosenthal）对谈"
                  }
                  className="aspect-[4/3] w-full object-cover object-center"
                  width={2400}
                  height={1600}
                />
              </div>
              <figcaption className="mt-3 text-xs leading-5 text-zinc-400">
                {lang === "en"
                  ? "With Ben Gilbert and David Rosenthal of Acquired · Significance Summit"
                  : "Significance Summit现场，与Acquired的两位主播Ben Gilbert、David Rosenthal对谈"}
              </figcaption>
            </figure>
            <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-2">
              <div className="max-w-2xl space-y-3">
                {t.intro.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={cn(
                      index === 0
                        ? "text-base leading-7 text-zinc-300 md:text-lg md:leading-8"
                        : "text-sm leading-7 text-zinc-400"
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#conversations"
                  className={cn(
                    buttonVariants(),
                    "bg-superlinear text-white hover:bg-superlinear-deep"
                  )}
                >
                  {t.questionCta}
                  <ArrowDown className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="/collab/podcast-kit-zh.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                  )}
                >
                  {t.kitCta}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 grid border-y border-white/10 md:grid-cols-2 lg:grid-cols-4">
            {t.heroProofs.map((proof, index) => (
              <div
                key={proof.label}
                className={cn(
                  "py-5 md:px-5",
                  index > 0 && "border-t border-white/10 md:border-t-0",
                  index % 2 === 1 && "md:border-l md:border-white/10",
                  index > 1 && "lg:border-l lg:border-white/10"
                )}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-superlinear-on-dark">
                  {proof.label}
                </p>
                <p className="mt-2 text-xs font-medium leading-5 text-zinc-300">
                  {proof.value}
                </p>
              </div>
            ))}
          </div>

          <section
            id="conversations"
            className="relative left-1/2 mt-16 w-screen -translate-x-1/2 scroll-mt-24 bg-superlinear-canvas py-16 text-superlinear-ink md:mt-24 md:py-24"
          >
            <div className="container">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-superlinear-deep">
                {t.conversationsEyebrow}
              </p>
              <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">
                {t.conversationsTitle}
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[#5C574D] md:text-base md:leading-8">
                {t.conversationsIntro}
              </p>

              <div className="mt-12 border-b border-[#CEC9BF]">
                {leadConversations.map((conversation, caseIndex) => (
                  <article
                    key={conversation.name}
                    className="border-t border-[#CEC9BF] py-10 md:py-14"
                  >
                    <div className="grid items-start gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:gap-14">
                      <a
                        href={conversation.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group block overflow-hidden bg-[#DDD8CE]",
                          caseIndex % 2 === 1 && "lg:order-2"
                        )}
                        aria-label={conversation.linkLabel}
                      >
                        <img
                          src={conversation.image}
                          alt={conversation.role}
                          className="aspect-video h-auto w-full object-cover transition duration-500 group-hover:scale-[1.012]"
                          loading="lazy"
                          width={1280}
                          height={720}
                        />
                      </a>

                      <div className={cn(caseIndex % 2 === 1 && "lg:order-1")}>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-superlinear-deep">
                          {conversation.label}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold leading-snug md:text-3xl">
                          {conversation.name}
                        </h3>
                        <p className="mt-2 text-xs leading-5 text-[#6E685D]">
                          {conversation.role}
                        </p>

                        <div
                          className={cn(
                            "mt-6 grid grid-cols-2 border-y border-[#CEC9BF] sm:grid-cols-4",
                            conversation.metrics.length === 3 &&
                              "sm:grid-cols-3"
                          )}
                        >
                          {conversation.metrics.map((metric, metricIndex) => (
                            <div
                              key={`${conversation.name}-${metric.label}`}
                              className={cn(
                                "min-w-0 py-4 pr-3 sm:px-4 sm:first:pl-0",
                                metricIndex % 2 === 1 &&
                                  "border-l border-[#CEC9BF] pl-3",
                                metricIndex > 1 &&
                                  "border-t border-[#CEC9BF] sm:border-t-0 sm:border-l",
                                conversation.metrics.length === 3 &&
                                  metricIndex === 2 &&
                                  "col-span-2 sm:col-span-1"
                              )}
                            >
                              <p className="whitespace-nowrap font-mono text-xl font-semibold tabular-nums text-superlinear-ink sm:text-2xl">
                                {metric.value}
                              </p>
                              <p className="mt-1 text-xs font-medium leading-5 text-[#5C574D]">
                                {metric.label}
                              </p>
                              {metric.signal && (
                                <p className="mt-2 text-[11px] font-semibold leading-4 text-superlinear-deep">
                                  {metric.signal}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        <p className="mt-5 text-sm leading-7 text-[#5C574D]">
                          {conversation.note}
                        </p>
                        {conversation.proofNote && (
                          <p className="mt-3 text-xs leading-6 text-[#777064]">
                            {conversation.proofNote}
                          </p>
                        )}
                        {conversation.quote && (
                          <blockquote className="mt-5 border-l-2 border-superlinear pl-4 text-sm leading-7 text-[#403C35]">
                            {conversation.quote}
                          </blockquote>
                        )}

                        <a
                          href={conversation.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-superlinear-link transition hover:text-superlinear-deep"
                        >
                          {conversation.linkLabel}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {conversation.evidenceImages.length > 0 && (
                      <details className="mt-8 border-y border-[#CEC9BF]">
                        <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-3 text-xs font-medium text-[#5C574D] transition hover:text-superlinear-deep">
                          <span>{conversation.evidenceLabel}</span>
                          <ArrowDown className="h-3.5 w-3.5 shrink-0" />
                        </summary>
                        <div
                          className={cn(
                            "grid items-start gap-5 border-t border-[#CEC9BF] py-5 sm:grid-cols-2",
                            conversation.evidenceImages.length === 1 &&
                              "sm:grid-cols-1"
                          )}
                        >
                          {conversation.evidenceImages.map(evidence => (
                            <figure
                              key={evidence.src}
                              className="border border-[#CEC9BF] bg-white/45 p-3"
                            >
                              <a
                                href={evidence.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block overflow-hidden bg-[#E7E2D8]"
                              >
                                <img
                                  src={evidence.src}
                                  alt={evidence.alt}
                                  className="mx-auto max-h-[34rem] w-full object-contain transition duration-300 group-hover:opacity-90"
                                  loading="lazy"
                                />
                              </a>
                              <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-3 text-[11px] leading-5 text-[#777064]">
                                <span>{evidence.caption}</span>
                                <a
                                  href={evidence.src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 transition hover:text-superlinear-deep"
                                >
                                  {lang === "zh"
                                    ? "打开完整截图"
                                    : "Open full screenshot"}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      </details>
                    )}
                  </article>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[#777064]">
                {t.metricsNote}
              </p>
            </div>
          </section>

          <section
            id="questions"
            className="relative left-1/2 w-screen -translate-x-1/2 scroll-mt-24 border-y border-white/10 bg-[#0F1420] py-16 md:py-24"
          >
            <div className="container grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                  {t.questionsEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                  {t.questionsTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {t.questionsIntro}
                </p>
              </div>
              <div className="border-t border-white/15">
                {t.questions.map((question, index) => (
                  <article
                    key={question.title}
                    className="grid gap-3 border-b border-white/15 py-6 sm:grid-cols-[2.5rem_1fr]"
                  >
                    <span className="font-mono text-xs text-zinc-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium leading-8 text-zinc-100">
                        {question.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        {question.detail}
                      </p>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-superlinear-on-dark">
                        {question.proof}
                      </p>
                    </div>
                  </article>
                ))}
                <p className="mt-6 text-sm leading-7 text-zinc-400">
                  {t.otherDirections}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-14 md:mt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-superlinear-on-dark">
              {t.formatsEyebrow}
            </p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-4xl">
              {t.formatsTitle}
            </h2>
            <div className="mt-9 grid border-y border-white/10 lg:grid-cols-3">
              {t.formats.map(format => (
                <article
                  key={format.number}
                  className="flex flex-col border-b border-white/10 py-7 last:border-b-0 lg:border-b-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
                >
                  <span className="font-mono text-xs text-superlinear-on-dark">
                    {format.number}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {format.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {format.detail}
                  </p>
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs font-medium leading-5 text-superlinear-on-dark">
                    {format.proof}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="relative left-1/2 mt-16 w-screen -translate-x-1/2 bg-superlinear-canvas py-16 text-superlinear-ink md:mt-24 md:py-20">
            <div className="container">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-superlinear-deep">
                {t.appearancesEyebrow}
              </p>
              <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-4xl">
                {t.appearancesTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5C574D]">
                {t.appearancesIntro}
              </p>

              <div className="mt-9 grid border-y border-[#CEC9BF] md:grid-cols-2 lg:grid-cols-3">
                {t.programs.map((program, index) => (
                  <a
                    key={program.href}
                    href={program.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group flex min-h-28 items-start justify-between gap-4 border-b border-[#CEC9BF] py-5 transition hover:text-superlinear-deep md:px-5",
                      index % 2 === 1 && "md:border-l",
                      index > 3 && "md:border-b-0",
                      index % 3 !== 0 && "lg:border-l",
                      index > 2 && "lg:border-b-0",
                      index % 3 === 0 && "lg:pl-0"
                    )}
                  >
                    <div>
                      <h3 className="text-base font-semibold leading-6">
                        {program.show}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-[#777064]">
                        {program.note}
                      </p>
                    </div>
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-[#999184] transition group-hover:text-superlinear-deep" />
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section
            id="contact"
            className="relative left-1/2 w-screen -translate-x-1/2 scroll-mt-24 bg-superlinear py-14 text-center md:py-16"
          >
            <div className="container">
              <Mic2 className="mx-auto h-7 w-7 text-white" />
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white">
                {t.contactEyebrow}
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
                {t.contactTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white">
                {t.contactDetail}
              </p>
              <a
                href={buildCreatorMailto(lang)}
                className={cn(
                  buttonVariants(),
                  "mt-7 bg-white text-superlinear-deep hover:bg-superlinear-canvas"
                )}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t.contactButton}
              </a>
              <div className="mt-5 space-y-2 text-xs text-white">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>yz@superlinear.academy</span>
                </div>
                <p>{t.businessContact}</p>
              </div>
            </div>
          </section>

          <section className="mt-14 border-y border-white/10 py-8 md:mt-20 md:py-12">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-superlinear-on-dark">
                  {t.agreementsEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                  {t.agreementsTitle}
                </h2>
                {hostConversation && (
                  <a
                    href={hostConversation.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-7 block overflow-hidden border border-white/10 bg-black/15 transition hover:border-superlinear/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-superlinear-on-dark"
                  >
                    <img
                      src={hostConversation.image}
                      alt={hostConversation.role}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                      width={1280}
                      height={720}
                    />
                    <div className="p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-superlinear-on-dark">
                        {hostConversation.label}
                      </p>
                      <h3 className="mt-2 text-base font-semibold leading-6 text-white">
                        {hostConversation.name}
                      </h3>
                      <p className="mt-2 text-xs leading-6 text-zinc-400">
                        {hostConversation.note}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-superlinear-on-dark">
                        {hostConversation.linkLabel}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                )}
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

          <section className="mt-14 md:mt-20">
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
                    <Icon className="h-5 w-5 text-superlinear-on-dark" />
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

          <section className="mt-14 md:mt-20">
            <details className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 p-5 transition hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-superlinear-on-dark md:p-7 [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {lang === "en" ? "COMPLETE ARCHIVE" : "完整做客档案"}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-zinc-100 md:text-xl">
                    {t.appearancesArchive}
                  </h2>
                  <p className="mt-2 max-w-3xl text-xs leading-6 text-zinc-500">
                    {t.appearancesArchiveDetail}
                  </p>
                </div>
                <ArrowDown
                  className="h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="grid gap-px border-t border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
                {guestAppearances.map(appearance => (
                  <AppearanceCard
                    key={appearance.href}
                    appearance={appearance}
                    lang={lang}
                    panelLabel={t.panelLabel}
                  />
                ))}
              </div>
            </details>
          </section>

          <section id="host-kit" className="scroll-mt-24 pt-14 md:pt-20">
            <div className="rounded-2xl border border-white/10 bg-superlinear-canvas p-6 text-superlinear-ink md:p-10">
              <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-superlinear-deep">
                    {t.kitEyebrow}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                    {t.kitTitle}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#5C574D]">
                    {t.kitIntro}
                  </p>
                  <a
                    href="/collab/podcast-kit-zh.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 border border-superlinear/35 bg-white/55 px-4 py-3 text-sm font-semibold text-superlinear-link transition hover:border-superlinear hover:bg-white hover:text-superlinear-deep"
                  >
                    <Download className="h-4 w-4" />
                    {t.pdfCta}
                  </a>
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
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-link hover:text-superlinear-deep"
                  >
                    <Download className="h-4 w-4" />
                    {t.headshotCta}
                  </a>
                </div>
                <div>
                  <div className="border-t border-[#D4D0C7] py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-superlinear-deep">
                      {t.shortBioLabel}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#48443B]">
                      {t.shortBio}
                    </p>
                  </div>
                  <details className="group border-t border-[#D4D0C7] py-6">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-superlinear-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-superlinear [&::-webkit-details-marker]:hidden">
                      <span>
                        {lang === "en" ? "View full bio" : "展开长介绍"}
                      </span>
                      <ArrowDown
                        className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-[#48443B]">
                      {t.longBio}
                    </p>
                  </details>
                  <div className="border-t border-[#D4D0C7] py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-superlinear-deep">
                      {t.brandLineLabel}
                    </p>
                    <p className="mt-3 border-l-2 border-superlinear pl-4 text-lg font-semibold leading-8 text-[#29251F]">
                      {t.brandLine}
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
                          className="flex items-start justify-between gap-3 border border-[#D4D0C7] bg-white/45 p-4 text-sm font-medium leading-6 transition hover:border-superlinear/45"
                        >
                          <span>{fact.label}</span>
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-superlinear-deep" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
