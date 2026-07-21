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
    href: "https://www.xiaoyuzhoufm.com/episode/6a135fde2507d98728e967e4",
    format: "guest",
  },
  {
    date: "2026.05.21",
    show: "Grad Lounge 不止学术",
    title: "118. 从「象牙塔」到「真本事」，AI时代如何打造个人价值｜课代表立正",
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
    href: "https://www.xiaoyuzhoufm.com/episode/643926bdb41b2b266b5962cf",
    format: "guest",
  },
  {
    date: "2023.02.22",
    show: "What’s Next｜科技早知道",
    title: "如何应对 ChatGPT？二级市场闭门研讨会精选｜S7E01 硅谷徐老师",
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

const guestAppearanceShowCount = new Set(
  guestAppearances.map(appearance => appearance.show)
).size;

const copy = {
  en: {
    navSub: "Podcast & video invitations",
    eyebrow: "Podcasts · Video · Long-form",
    h1: "You set the question. I’ll bring a view and the evidence.",
    intro: [
      "I’m Yuzheng Sun: a Cornell-trained economist who worked across Amazon, Meta, Tencent, and Statsig, and now builds AI Builders and Stay Superlinear.",
      "I most often talk about three things: how AI actually changes work, how companies make decisions, and how people keep getting better while the ground moves under them.",
    ],
    heroProofs: [
      "Cornell Economics PhD",
      "Amazon · Meta · Tencent · Statsig",
      "200+ published conversations · Jul 2026",
      "400K+ across Xiaohongshu · YouTube · Bilibili · Jul 2026",
    ],
    questionCta: "See two proven collaborations",
    kitCta: "Open the host kit",
    stanceEyebrow: "STRONG OPINIONS, WEAKLY HELD",
    stanceTitle: "A clear view, without the need to defend a persona.",
    stanceDetail:
      "I like making a view clear enough to challenge. You can question the premise, keep the disagreement, or press until new evidence changes how I think. Those are often my favorite moments in a conversation. AI Builders and Stay Superlinear only enter when they genuinely help explain the issue.",
    formatsEyebrow: "WHY THIS EPISODE IS WORTH MAKING",
    formatsTitle: "Three things I can bring to the conversation.",
    formats: [
      {
        number: "01",
        title: "A background that is hard to duplicate",
        detail:
          "Cornell Economics PhD; economist at Amazon, data scientist at Meta, Data & AI leader at Tencent, and an early operator at Statsig. I now build courses, community, and media—across research, big tech, startup, and creator work.",
        proof: "China & U.S. · research & operating · big tech & startup",
      },
      {
        number: "02",
        title: "A point of view, not a performance",
        detail:
          "I like stating a judgment clearly enough for a host to push against it. Strong opinions, weakly held: I bring reasons, cases, and the strongest counterargument—and I genuinely enjoy the question that changes my mind.",
        proof: "A useful judgment, plus room for the conversation to change it",
      },
      {
        number: "03",
        title: "Content travels; co-publishing can amplify it",
        detail:
          "My communities span Xiaohongshu, YouTube, and Bilibili, and our team can edit long-form video and clips. But audience and production are amplifiers, not the premise: Koji’s independently published episode already traveled across audio and three video platforms.",
        proof:
          "Koji: content traveled independently · Tulong: co-production reached 58.2K likes",
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
    conversationsEyebrow: "CONTENT, THEN AMPLIFICATION",
    conversationsTitle:
      "First prove the content holds. Then see how far production and distribution can push it.",
    conversationsIntro:
      "Koji first shows that one strong conversation can work in long-form audio and across video platforms. Tulong then layers strong content, both audiences, and co-production to see how much farther it can go.",
    conversations: [
      {
        priority: "lead",
        label: "CASE 01 · THE CONTENT TEST · REMOTE",
        name: "One remote conversation set records across audio and three video platforms",
        role: "Crossing with Koji × Yuzheng Sun",
        note: "The episode reached 67K Xiaoyuzhou plays, then produced high-save and high-share clips on Douyin, Xiaohongshu, and WeChat Channels. The Douyin clip became Koji’s all-time most-liked post; Xiaohongshu reached an annual save high. Only then does the smaller point matter: this was a simple remote recording, edited and published by Koji, without co-publishing from my accounts.",
        highlight:
          "This was not one lucky hit on one platform. People listened in long form, then saved and shared the ideas in short form—evidence that the guest background and point of view survived the change in medium.",
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
        label: "CASE 02 · CONTENT + PRODUCTION + BOTH AUDIENCES",
        name: "Once the content holds, both sides can make it much bigger",
        role: "Yuzheng × Yang Ying (Tulong)",
        note: "Each side chose its own title, structure, and emphasis. Tulong kept the language of her show; our team built a second long-form cut and Xiaohongshu clips. When a joint release fits, my communities on Xiaohongshu, YouTube, and Bilibili can carry the work farther, while our team adds topic development, editing, clipping, and distribution support.",
        highlight:
          "Our Xiaohongshu version reached 58.2K likes, 59K saves, and 11K shares; the Bilibili long-form cut added 90K+ plays and nearly 7,000 saves. This was more than exposure: saves exceeded likes, which shows that the content held the attention the joint reach created.",
        metrics: [
          {
            value: "58.2K",
            label: "Xiaohongshu likes",
            signal: "Co-published",
          },
          {
            value: "59K",
            label: "Xiaohongshu saves",
            signal: "More saves than likes",
          },
          { value: "11K", label: "shares", signal: "Secondary reach" },
          { value: "1,066", label: "comments", signal: "High discussion" },
        ],
        proofNote: "",
        quote: "",
        href: "https://www.bilibili.com/video/BV1krM46BEpn",
        linkLabel: "Watch our full cut",
        image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
        evidenceLabel: "Verify the Xiaohongshu result (1 screenshot)",
        evidenceImages: [
          {
            src: "/collab/creator-proof/tulong-performance.webp",
            alt: "Yuzheng and Tulong co-created Xiaohongshu video with 58.2K likes, 59K saves and 1,066 comments",
            caption: "Our cut · 58.2K likes · 59K saves · 1,066 comments",
          },
        ],
      },
      {
        priority: "supporting",
        label: "ANOTHER SAMPLE · I AM THE HOST",
        name: "Professor Liu Jia: from neuroscience to AI and education",
        role: "Chair, Department of Psychology and Cognitive Science, Tsinghua University",
        note: "A nearly three-hour conversation moves from intelligence, learning, and consciousness to embodied AI, brain–computer interfaces, and education. It is here to show the other side of the table: I know how much preparation and listening a host brings to a long interview.",
        highlight:
          "A long conversation does not need a pile of topics. It needs one question that can keep unfolding.",
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
    appearancesEyebrow: "MORE GUEST APPEARANCES",
    appearancesIntro:
      "These are the appearances I could verify on Xiaoyuzhou. Two were multi-guest panels; INDIGO TALK and The Build Log each invited me back.",
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
    shortBioLabel: "Short bio",
    shortBio:
      "Yuzheng Sun is an economist, AI educator, and founder of Superlinear Academy and AI Builders. A Cornell PhD, he has worked across Amazon, Meta, Tencent, and Statsig, and now works across AI education, content, and community.",
    longBioLabel: "Long bio",
    longBio:
      "Yuzheng Sun (课代表立正) is a Cornell-trained economist, operator, author, and AI educator based in Seattle. He has worked as an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG, and Principal Data Scientist and evangelist at Statsig. He is the founder of Superlinear Academy and AI Builders, and co-leads Stay Superlinear with Yage. As of July 2026, he has taught 3,000+ paying learners and held 200+ public conversations with researchers, founders, and operators. He is co-author of Growth Data Analytics Playbook and author of 《真本事》.",
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
      "As of July 2026: 400K+ followers across YouTube, Bilibili, and Xiaohongshu.",
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
    h1: "你定问题，我带着判断和证据来。",
    intro: [
      "我是课代表立正。康奈尔经济学博士，先后在 Amazon、Meta、腾讯和 Statsig 做过经济学、数据和 AI；现在主理 AI Builders 和 Stay Superlinear。",
      "我最常聊三件事：AI 到底怎么改变工作，公司怎么做判断，人又怎么在变化里长出真本事。",
    ],
    heroProofs: [
      "康奈尔经济学博士",
      "Amazon · Meta · 腾讯 · Statsig",
      "200+ 场公开对谈 · 2026.07",
      "小红书 · YouTube · B站 40 万+ 关注者 · 2026.07",
    ],
    questionCta: "先看两个合作案例",
    kitCta: "查看嘉宾资料",
    stanceEyebrow: "STRONG OPINIONS, WEAKLY HELD",
    stanceTitle: "有立场，但不需要守住人设。",
    stanceDetail:
      "我喜欢先把观点说得足够明确，让主持人真的有东西可以追问。你可以挑战前提、保留分歧，也可以用一个好问题让我重新想一遍。我最喜欢的，就是在对话里真的改变了自己的想法。",
    formatsEyebrow: "为什么这期值得录",
    formatsTitle: "我能给这场对话带来三样东西。",
    formats: [
      {
        number: "01",
        title: "这组经历，通常不在同一个嘉宾身上出现",
        detail:
          "康奈尔经济学博士；做过 Amazon 经济学家、Meta 数据科学家、腾讯数据与 AI 副总监，也在 Statsig 这样的创业公司一线干过。我既做过研究，也真正带过业务、做过产品和内容。",
        proof: "中美 · 研究与实战 · 大厂与创业",
      },
      {
        number: "02",
        title: "有立场，也最喜欢被挑战",
        detail:
          "我信奉 strong opinions, weakly held：观点要讲得足够明确，理由、案例和反方也都摆出来；一个好问题真能让我改变想法，我会很开心。",
        proof: "有判断，不护答案 · 观众能带走一个可用的观点",
      },
      {
        number: "03",
        title: "内容能自己跑，联发还能放大",
        detail:
          "我在小红书、YouTube 和 B 站都有长期经营的社区，团队也能做长视频、切片和分发。但流量和团队只是放大器：Koji 独立发布的节目，已经同时在音频和三个视频平台跑了出来。",
        proof: "Koji：内容自己跑 · 屠龙：联合制作 5.82 万赞",
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
      "回头看我过去的 AI 判断，哪些说对了，哪些现在需要重新判断？",
      "一门课、一个社区，到底是在帮人长本事，还是让人越来越离不开老师和圈子？",
    ],
    otherDirections:
      "增长实验、创作者怎么赚钱、科技创业也都能聊。AI Builders 和 Stay Superlinear 是怎么做起来的、哪里做错过，我也可以讲得很具体。不用一口气全塞进去，挑一个问题聊透就够了。",
    conversationsEyebrow: "两个合作案例",
    conversationsTitle: "先看内容自己能不能跑，再看双方能把它推多远。",
    conversationsIntro:
      "Koji 那期先证明，一场好对话能同时在音频和多个视频平台成立。屠龙的合作则把好内容、双方受众和制作资源叠在一起，看它还能被放大到哪里。",
    conversations: [
      {
        priority: "lead",
        label: "案例一 · 内容自己能跑",
        name: "一场远程对话：节目播放前二，抖音历史最高，小红书年度最高",
        role: "十字路口 Crossing × 课代表立正",
        note: "这期在《十字路口》的节目列表里排到播放量前二；切片分别成了 Koji 抖音历史点赞最高、小红书年度收藏最高的内容。录制只是简单远程，节目和切片也都由 Koji 独立制作、发布，没有从我的账号联发——这让内容本身的表现更容易看清。",
        highlight:
          "同一场对话，在小宇宙有人完整听完，到了抖音、小红书和视频号，也有人收藏、转发。不少听众留下完整笔记，还写下自己准备怎样改变 AI 工作方式。",
        metrics: [
          { value: "6.7万", label: "小宇宙播放", signal: "节目播放前二" },
          { value: "1.2万", label: "抖音点赞", signal: "账号历史最高" },
          { value: "8,343", label: "小红书收藏", signal: "账号年度最高" },
          { value: "6,502", label: "视频号转发", signal: "跨平台高转发" },
        ],
        proofNote:
          "其他数据：小宇宙 132 条评论；小红书 4,709 赞；抖音 8,582 收藏、1,476 转发。",
        quote:
          "“很有帮助的一期，最近正在从 ChatGPT 转 Codex，也在积累上下文。”——小宇宙听众",
        href: "https://www.xiaoyuzhoufm.com/episode/6a275ed57444b5722235a897",
        linkLabel: "去小宇宙听完整节目",
        image: "https://img.youtube.com/vi/4hi93cDfVls/maxresdefault.jpg",
        evidenceLabel: "查看平台数据截图（4 张）",
        evidenceImages: [
          {
            src: "/collab/creator-proof/koji-xiaoyuzhou.webp",
            alt: "《十字路口》节目最受欢迎页面，显示 6.7 万播放和 132 条评论",
            caption: "小宇宙 · 6.7 万播放 · 132 条评论",
          },
          {
            src: "/collab/creator-proof/koji-xiaohongshu.webp",
            alt: "Koji 小红书切片，显示 4,709 赞和 8,343 收藏",
            caption: "小红书 · 4,709 赞 · 8,343 收藏",
          },
          {
            src: "/collab/creator-proof/koji-douyin.webp",
            alt: "Koji 抖音切片，显示 1.2 万赞、8,582 收藏和 1,476 转发",
            caption: "抖音 · 1.2 万赞 · 账号历史最高",
          },
          {
            src: "/collab/creator-proof/koji-wechat.webp",
            alt: "Koji 视频号切片，显示 6,502 次转发",
            caption: "视频号 · 6,502 转发",
          },
        ],
      },
      {
        priority: "lead",
        label: "案例二 · 双方各做一版、共同分发",
        name: "好内容再叠加双方受众，能走得更远",
        role: "课代表立正 × 杨滢（屠龙）",
        note: "同一场录制，屠龙团队按自己的节目语言剪成《线性思维害死人》；我们则从脑科学一路剪到创业现场，再为小红书和 B 站重新组织内容。双方各自保留编辑判断，也各自带来受众；我们这边的小红书、YouTube、B 站和社区还能承接后续分发，团队也能补上选题、剪辑和切片。",
        highlight:
          "我们的小红书版本获得 5.82 万赞、5.9 万收藏和 1.1 万转发；B 站正片 9 万+ 播放、近 7,000 收藏。这不只是曝光：收藏高于点赞，说明内容真的接住了这波流量。",
        metrics: [
          { value: "5.82万", label: "小红书点赞", signal: "联合发布" },
          { value: "5.9万", label: "小红书收藏", signal: "收藏高于点赞" },
          { value: "1.1万", label: "小红书转发", signal: "二次传播" },
          { value: "1,066", label: "小红书评论", signal: "高讨论度" },
        ],
        proofNote: "",
        quote: "",
        href: "https://www.bilibili.com/video/BV1krM46BEpn",
        linkLabel: "看我们的完整正片",
        image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
        evidenceLabel: "核对小红书数据（1 张截图）",
        evidenceImages: [
          {
            src: "/collab/creator-proof/tulong-performance.webp",
            alt: "课代表立正与屠龙联合发布的小红书视频，显示 5.82 万赞、5.9 万收藏和 1,066 条评论",
            caption: "我们的版本 · 5.82 万赞 · 5.9 万收藏 · 1,066 条评论",
          },
        ],
      },
      {
        priority: "supporting",
        label: "另一个样本 · 我做主持",
        name: "刘嘉教授：从脑科学聊到 AI 和教育",
        role: "清华大学心理与认知科学系主任",
        note: "近三小时的对话，从智能、学习和意识，一路聊到具身智能、脑机接口和教育。把它放在这里，是想说明我也坐过桌子的另一边，知道主持人为一场长访谈要做多少准备、花多少心思。",
        highlight: "长对话不需要堆话题。它需要一个能一层层往下追的问题。",
        metrics: [
          { value: "13万+", label: "YouTube 观看", signal: "长视频" },
          { value: "460+", label: "评论", signal: "深度讨论" },
          { value: "近 3 小时", label: "一场连续对话", signal: "完整长谈" },
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
    metricsNote: "数据来自 2026 年 7 月的平台页面与截图；各平台统计口径不同。",
    appearancesEyebrow: "更多做客记录",
    appearancesIntro:
      "这些是目前能在小宇宙查到的做客记录。其中两期是多人圆桌；INDIGO TALK 和 The Build Log 都邀请过我两次。",
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
      "孙煜征（课代表立正），康奈尔大学经济学博士，Superlinear Academy 与 AI Builders 创始人。曾在 Amazon、Meta、腾讯和 Statsig 从事经济学、数据与 AI 工作，现在主要做 AI 教育、内容和社区，关心个人和公司怎样把 AI 真正用进工作。",
    longBioLabel: "长介绍",
    longBio:
      "孙煜征（课代表立正）毕业于康奈尔大学，获经济学博士学位，现居西雅图。他先后做过 Amazon 经济学家、Meta 数据科学家、腾讯 IEG 数据与 AI 副总监，以及 Statsig 首席数据科学家和开发者布道师。他是 Superlinear Academy 与 AI Builders 创始人，并和鸭哥共同主理 Stay Superlinear。截至 2026 年 7 月，他教过 3,000 多名付费学员，也主持或参与了 200 多场公开对谈。他合著英文书《Growth Data Analytics Playbook》，著有《真本事》。",
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
    audienceFact: "截至 2026 年 7 月，YouTube、B 站和小红书共 40 万+ 关注者。",
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
              <div className="mt-6 max-w-2xl space-y-3">
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

          <section className="mt-14 md:mt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
              {t.formatsEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              {t.formatsTitle}
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {t.formats.map(format => (
                <article
                  key={format.number}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6 md:p-7"
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
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs font-medium leading-5 text-amber-200/80">
                    {format.proof}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="conversations" className="scroll-mt-24 pt-14 md:pt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {t.conversationsEyebrow}
            </p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold text-white md:text-4xl">
              {t.conversationsTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              {t.conversationsIntro}
            </p>
            <div className="mt-8 grid gap-6">
              {t.conversations.map(conversation => (
                <article
                  key={conversation.name}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] lg:grid",
                    conversation.priority === "lead"
                      ? "lg:grid-cols-[0.82fr_1.18fr]"
                      : "lg:grid-cols-[0.64fr_1.36fr]"
                  )}
                >
                  <a
                    href={conversation.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block self-start overflow-hidden bg-[#151A25]"
                    aria-label={conversation.linkLabel}
                  >
                    <img
                      src={conversation.image}
                      alt={conversation.role}
                      className="aspect-video h-auto w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                      loading="lazy"
                      width={1280}
                      height={720}
                    />
                  </a>
                  <div className="p-6 md:p-8 lg:p-10">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                      {conversation.label}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-snug text-white md:text-3xl">
                      {conversation.name}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-amber-200/75">
                      {conversation.role}
                    </p>

                    <div
                      className={cn(
                        "mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10",
                        conversation.metrics.length === 3 && "sm:grid-cols-3"
                      )}
                    >
                      {conversation.metrics.map((metric, index) => (
                        <div
                          key={`${conversation.name}-${metric.label}`}
                          className={cn(
                            "min-w-0 bg-[#111622] p-3.5 sm:p-4",
                            metric.signal && "bg-amber-300/[0.045]",
                            conversation.metrics.length === 3 &&
                              index === 2 &&
                              "col-span-2 sm:col-span-1"
                          )}
                        >
                          <p className="font-mono text-2xl font-semibold tabular-nums text-white">
                            {metric.value}
                          </p>
                          <p className="mt-1 text-xs font-medium leading-5 text-zinc-300">
                            {metric.label}
                          </p>
                          {metric.signal && (
                            <span className="mt-2 inline-flex w-fit max-w-full rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold leading-none text-amber-200 sm:text-[11px]">
                              {metric.signal}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-sm leading-7 text-zinc-400">
                      {conversation.note}
                    </p>
                    <p className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.055] p-4 text-sm font-medium leading-7 text-amber-50/90">
                      {conversation.highlight}
                    </p>

                    {conversation.proofNote && (
                      <p className="mt-4 text-xs leading-6 text-zinc-400">
                        {conversation.proofNote}
                      </p>
                    )}
                    {conversation.quote && (
                      <blockquote className="mt-4 border-l border-amber-300/40 pl-4 text-xs leading-6 text-zinc-300">
                        {conversation.quote}
                      </blockquote>
                    )}

                    <a
                      href={conversation.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
                    >
                      {conversation.linkLabel}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  {conversation.evidenceImages.length > 0 && (
                    <details className="mx-6 mb-6 overflow-hidden rounded-xl border border-white/10 bg-black/10 md:mx-8 md:mb-8 lg:col-span-2 lg:mx-10 lg:mb-10">
                      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 px-4 py-3 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.035]">
                        <span>{conversation.evidenceLabel}</span>
                        <ArrowDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      </summary>
                      <div
                        className={cn(
                          "grid items-start gap-4 border-t border-white/10 p-4 sm:grid-cols-2",
                          conversation.evidenceImages.length === 1 &&
                            "sm:grid-cols-1"
                        )}
                      >
                        {conversation.evidenceImages.map(evidence => (
                          <figure
                            key={evidence.src}
                            className="self-start rounded-lg border border-white/10 bg-black/20 p-2"
                          >
                            <a
                              href={evidence.src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block overflow-hidden rounded-md bg-black/30"
                            >
                              <img
                                src={evidence.src}
                                alt={evidence.alt}
                                className="mx-auto max-h-[34rem] w-full object-contain transition duration-300 group-hover:opacity-90"
                                loading="lazy"
                              />
                            </a>
                            <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 pb-1 pt-3 text-[11px] leading-5 text-zinc-400">
                              <span>{evidence.caption}</span>
                              <a
                                href={evidence.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-amber-300"
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
            <p className="mt-4 text-xs leading-5 text-zinc-500">
              {t.metricsNote}
            </p>
          </section>

          <section className="mt-14 md:mt-20">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                  {t.appearancesEyebrow}
                </p>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
                  {lang === "en"
                    ? `${guestAppearances.length} episodes across ${guestAppearanceShowCount} shows—and more than one return invitation.`
                    : `我还做客过 ${guestAppearanceShowCount} 档节目，共 ${guestAppearances.length} 期。`}
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
                  {t.appearancesIntro}
                </p>
              </div>
              <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-amber-300/80">
                {lang === "en"
                  ? `${guestAppearances.length} episodes · ${guestAppearanceShowCount} shows`
                  : `${guestAppearances.length} 期 · ${guestAppearanceShowCount} 档节目`}
              </p>
            </div>

            <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
              {guestAppearances.map(appearance => (
                <a
                  key={appearance.href}
                  href={appearance.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-w-0 flex-col bg-[#0F1420] p-4 transition hover:bg-[#151B28]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <time className="font-mono text-[10px] tabular-nums tracking-[0.12em] text-zinc-500">
                      {appearance.date}
                    </time>
                    <span className="flex items-center gap-2">
                      {appearance.format === "panel" && (
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-medium leading-none text-zinc-400">
                          {t.panelLabel}
                        </span>
                      )}
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-amber-300" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-zinc-100 transition group-hover:text-white">
                    {appearance.show}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 transition group-hover:text-zinc-400">
                    {appearance.title}
                  </p>
                </a>
              ))}
            </div>
          </section>

          <section className="mt-14 border-y border-white/10 py-10 md:mt-20 md:py-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
              {t.stanceEyebrow}
            </p>
            <div className="mt-4 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
              <h2 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                {t.stanceTitle}
              </h2>
              <p className="text-sm leading-7 text-zinc-300 md:text-base md:leading-8">
                {t.stanceDetail}
              </p>
            </div>
          </section>

          <section id="questions" className="scroll-mt-24 pt-14 md:pt-20">
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

          <section className="mt-14 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6 md:mt-20 md:p-10">
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

          <section id="host-kit" className="scroll-mt-24 pt-14 md:pt-20">
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

          <section
            id="contact"
            className="mt-14 scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-center md:mt-20 md:p-10"
          >
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
