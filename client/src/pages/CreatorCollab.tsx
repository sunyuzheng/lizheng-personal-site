import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { Dotted, Phrases } from "@/components/home/parts";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { useEffect } from "react";
import { Link } from "wouter";
import { CREATOR_COLLAB_PAGE_META } from "../../../shared/collab-meta";
import { languageAlternates } from "../../../shared/page-meta";
import {
  guestAppearances,
  type GuestAppearance,
} from "../../../shared/guest-appearances-snapshot";
import { buildPersonWebPageStructuredData } from "../../../shared/structured-data";
import {
  PROJECTS_FIGURE,
  PROJECTS_ZH,
  membersAsOf,
  membersFigure,
  membersWan,
} from "../../../shared/community-facts";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * A quotation followed by who said it: the attribution stays in one piece, so a narrow column
 * moves it to the next line whole instead of leaving its last two characters there.
 */
function Quoted({ text }: { text: string }) {
  const end = text.lastIndexOf("”");
  if (end < 0 || end === text.length - 1) return <>{text}</>;
  const rest = text.slice(end + 1);
  return (
    <>
      {text.slice(0, end + 1)}
      {rest.startsWith(" ") ? " " : ""}
      <span className="phrase">{rest.trimStart()}</span>
    </>
  );
}

/** One past appearance in the complete record: when, which show, what it was about. */
function AppearanceRow({
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
    <li>
      <a href={appearance.href} {...EXTERNAL}>
        <time dateTime={appearance.date.replaceAll(".", "-")}>
          {appearance.date}
        </time>
        <b>
          {appearance.show}
          {appearance.format === "panel" && <small>{panelLabel}</small>}
        </b>
        <span>{title}</span>
      </a>
    </li>
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
        value: `200+ public conversations · ${guestAppearances.length} verified guest appearances`,
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
    formatsEyebrow: "Where the view comes from",
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
          `At Superlinear, the ideas meet courses, a ${membersFigure()} member community, ${PROJECTS_FIGURE} real projects, enterprise programs, and more than 200 public conversations. They have to remain useful after the talk is over.`,
        proof: "Superlinear Academy · real projects · enterprise work",
      },
    ],
    questionsEyebrow: "Where an episode could begin",
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
        proof: `AI Builders · ${PROJECTS_FIGURE} community projects · enterprise programs`,
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
    conversationsEyebrow: "Three collaborations · Three kinds of proof",
    conversationsTitle:
      "Good content should hold on its own, reward further investment—and travel to a different audience.",
    conversationsIntro:
      "The Koji episode shows what the conversation can do with a simple remote setup and the host’s own channels. The Tulong episode shows what can happen when both teams edit, distribute, and build around the same recording. The Yang Tiannan episode began with a topic I proposed and ran on a personal-finance podcast: 45K plays in under two weeks.",
    conversations: [
      {
        priority: "lead",
        label: "Case 1 · The content holds",
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
        label: "Case 2 · Both sides amplify",
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
        priority: "lead",
        label: "Case 3 · A different audience",
        name: "A topic I proposed became an episode of a personal-finance podcast",
        role: "听懂涨声 with Yang Tiannan × Yuzheng Sun",
        note: "听懂涨声 is a Chinese podcast about family wealth, spending, and investing, with 190K+ subscribers on Xiaoyuzhou. I proposed “fake work” to its host, Yang Tiannan—the second question in the list below. He made the conversation an episode of his own show, where listeners used the comments to talk about their own jobs. Our team cut a 71-minute video and co-published it on Xiaohongshu.",
        metrics: [
          {
            value: "45K",
            label: "Xiaoyuzhou plays",
            signal: "In under two weeks",
          },
          {
            value: "175K",
            label: "Xiaohongshu views",
            signal: "A 71-minute video",
          },
          {
            value: "4,220",
            label: "Xiaohongshu saves",
            signal: "Close to likes",
          },
          {
            value: "1,480",
            label: "Xiaohongshu shares",
            signal: "Co-published",
          },
        ],
        proofNote:
          "Also: 113 Xiaoyuzhou comments and 534 saves; 4,660 Xiaohongshu likes and 113 comments; 17K YouTube views.",
        quote:
          "“So when Yuzheng proposed this topic, I said yes right away.” — Yang Tiannan, in the episode’s show notes (translated)",
        href: "https://www.xiaoyuzhoufm.com/episode/6ae1e359c96c8942ec13bb1f",
        linkLabel: "Listen to the episode on Xiaoyuzhou",
        image: "https://img.youtube.com/vi/ur-HjD422ig/maxresdefault.jpg",
        evidenceLabel: "View platform screenshots (2)",
        evidenceImages: [
          {
            src: "/collab/creator-proof/yangtiannan-xiaoyuzhou.webp",
            alt: "The 听懂涨声 episode page on Xiaoyuzhou with 45,403 plays and 113 comments",
            caption: "Xiaoyuzhou · 45K plays · 113 comments",
          },
          {
            src: "/collab/creator-proof/yangtiannan-xiaohongshu.webp",
            alt: "The co-published video on Xiaohongshu with 175.3K views, 4,660 likes, 4,220 saves, 1,480 shares and 113 comments",
            caption: "Xiaohongshu · 175K views · 4,220 saves · 1,480 shares",
          },
        ],
      },
      {
        priority: "supporting",
        label: "Another sample · I am the host",
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
      "Counts for the first two cases come from public platform pages and screenshots captured in July 2026; the third was captured on November 9, 2026, less than two weeks after release. Platforms use different counting methods.",
    appearancesEyebrow: "Selected by other shows",
    appearancesTitle:
      "Invited across AI, technology, organizations, careers, and creator businesses.",
    appearancesIntro: `The list below emphasizes recognizable shows and repeat invitations. A complete ${guestAppearances.length}-episode guest appearance archive remains available for producers who want to inspect the full record.`,
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
    appearancesArchive: `Open all ${guestAppearances.length} verified guest appearances`,
    appearancesArchiveDetail:
      "The full guest appearance archive is preserved here for producers who want to check topics, formats, and earlier work.",
    panelLabel: "Panel",
    agreementsEyebrow: "How I work",
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
    logisticsEyebrow: "Recording details",
    logisticsTitle: "Production details, without ceremony.",
    logistics: [
      { label: "Languages", value: "Mandarin or English" },
      {
        label: "Format",
        value: "Remote, or in person in Seattle",
      },
      {
        label: "Length",
        value: "Usually 60–120 minutes; adaptable to the show",
      },
      {
        label: "Based in",
        value: "Seattle · Pacific Time",
      },
    ],
    kitEyebrow: "Host kit",
    kitTitle: "A producer can build the introduction from this page.",
    kitIntro:
      "Use whichever bio length fits the show. The facts and links are here for verification, not as required talking points.",
    pdfCta: "Download the seven-page Chinese guest kit",
    shortBioLabel: "Short bio",
    shortBio:
      "Yuzheng Sun (课代表立正) has a PhD in Economics from Cornell and is the founder of Superlinear Academy. He was an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG, and an early member of Statsig, which was later acquired by OpenAI. His work asks what capabilities and works matter more when AI makes execution cheaper.",
    longBioLabel: "Long bio",
    longBio:
      `Yuzheng Sun (课代表立正) has a PhD in Economics from Cornell and is a founder, operator, and author based in Seattle. He was an economist at Amazon, a data scientist at Meta, Vice Director of Data & AI at Tencent IEG—where he led a 30-person team and received the highest performance rating in two consecutive cycles—and an early member of Statsig, which was later acquired by OpenAI. He founded Superlinear Academy, the parent institution for its free community, AI Builders, and Stay Superlinear. His defining idea is MAKE WHAT LASTS. As of ${membersAsOf("en")}, he has taught 3,000+ paying learners, held 200+ public conversations with researchers, founders, and operators, and built a free community of ${membersFigure()} members with ${PROJECTS_FIGURE} shared real-world projects. He is the author of Feels Like Progress and 《真本事》 (Real Stuff), and co-author of Growth Data Analytics Playbook.`,
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
    contactEyebrow: "Program invitations",
    contactTitle:
      "If there is a question worth taking all the way, send it over.",
    contactDetail:
      "Send the show or channel, the question you most want to pursue, and a rough format and timing. If I have something genuinely new to add, we can set a time and prepare around the show.",
    businessContact: "Business contact: Miao (喵老师) | WeChat: FM13870617",
    contactButton: "Discuss an episode",
    back: "Back to all collaboration options",
  },
  zh: {
    navSub: "播客与视频节目合作",
    eyebrow: "播客与视频创作者 · 节目合作",
    h1: "一起做一期节目，\n聊聊彼此的看法。",
    intro: [
      "聊AI怎么改变工作，也聊职业选择、创业和组织管理。我会带来自己的经历和案例，也想听听你的观察和不同看法。",
      "可以做客、串台，也可以一起策划。录制方式一起商量；有需要，我的团队也能参与剪辑、切片与联合发布。",
    ],
    heroProofs: [
      {
        label: "研究到一线",
        value: "康奈尔博士 · Amazon · Meta · 腾讯 · Statsig",
      },
      {
        label: "长对话经验",
        value: `200+场公开对谈 · ${guestAppearances.length}期做客记录`,
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
    questionCta: "先看三次合作",
    kitCta: "下载嘉宾资料",
    formatsEyebrow: "这些判断从哪里来",
    formatsTitle: "这些问题，我在几个不同的位置上|都亲手处理过。",
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
          `超线性学院、${membersWan()}人的免费社区、${PROJECTS_ZH}个真实项目、AI Builders和企业AI项目，都要求这些判断在节目结束以后继续有用。`,
        proof: "超线性学院 · 真实项目 · 企业现场",
      },
    ],
    questionsEyebrow: "这期可以从哪里开始",
    // "|" marks where the title may break (Phrases).
    questionsTitle: "四个足以撑起|一整期的问题。",
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
        proof: `AI Builders · ${PROJECTS_FIGURE}社区项目 · 企业AI项目`,
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
    conversationsEyebrow: "三次合作 · 三种证明",
    conversationsTitle: "好内容自己站得住，双方投入走得更远，|换一群听众也成立。",
    conversationsIntro:
      "Koji那期只用节目方自己的渠道：长音频有人听完，三个视频平台的切片也各自跑出来。屠龙那期则由双方分别编辑和分发，一场对话不只有了更大的影响力，也替节目和嘉宾找到了新的观众。杨天楠那期是我提的选题，发在一档讲家庭财富和投资的播客里，不到两周4.5万次播放。",
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
        note: "屠龙团队保留自己的节目语言；我们再做一版长片和切片，发布到小红书、YouTube、B站和超线性学院社区。这次合作既有破圈数据，也让从未听过屠龙的新观众真正认识了她。",
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
        priority: "lead",
        label: "案例三 · 换一群听众也成立",
        name: "我提的选题，成了一档财经播客的一期",
        role: "听懂涨声 × 课代表立正",
        note: "《听懂涨声》讲家庭财富、消费和投资，小宇宙有19万订阅。我向主播杨天楠提了fake work这个选题，就是下面四个问题里的第二个。他把对话做成自己节目的一期，评论区里听众聊的是各自的工作；我们剪出71分钟的视频，在小红书联合发布。",
        metrics: [
          { value: "4.5万", label: "小宇宙播放", signal: "发布不到两周" },
          { value: "17.5万", label: "小红书观看", signal: "71分钟长视频" },
          { value: "4,220", label: "小红书收藏", signal: "收藏接近点赞" },
          { value: "1,480", label: "小红书转发", signal: "联合发布" },
        ],
        proofNote:
          "其他数据：小宇宙113条评论、534次收藏；小红书4,660赞、113条评论；YouTube 1.7万观看。",
        quote:
          "“当课代表立正和我提了这个选题，我立刻答应了下来。”——杨天楠，《听懂涨声》节目介绍",
        href: "https://www.xiaoyuzhoufm.com/episode/6ae1e359c96c8942ec13bb1f",
        linkLabel: "去小宇宙听《听懂涨声》这一期",
        image: "https://img.youtube.com/vi/ur-HjD422ig/maxresdefault.jpg",
        evidenceLabel: "查看平台数据截图（2张）",
        evidenceImages: [
          {
            src: "/collab/creator-proof/yangtiannan-xiaoyuzhou.webp",
            alt: "《听懂涨声》这一期在小宇宙的页面，显示45,403次播放和113条评论",
            caption: "小宇宙 · 4.5万播放 · 113条评论",
          },
          {
            src: "/collab/creator-proof/yangtiannan-xiaohongshu.webp",
            alt: "课代表立正在小红书联合发布的视频，显示17.5万次观看、4,660赞、4,220收藏、1,480转发和113条评论",
            caption: "小红书 · 17.5万观看 · 4,220收藏 · 1,480转发",
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
    metricsNote:
      "前两个案例的数据来自2026年7月的平台页面与截图；第三个采集于2026年11月9日，发布不到两周。各平台统计口径不同。",
    appearancesEyebrow: "节目做客",
    appearancesTitle: "从AI与技术组织，到职业选择与创作者商业。",
    appearancesIntro: `这里优先保留有辨识度的节目与重复邀请。完整${guestAppearances.length}期做客记录仍在页面后面，制作人可以随时核对题目、形式与成片。`,
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
    appearancesArchive: `展开全部${guestAppearances.length}期做客记录`,
    appearancesArchiveDetail:
      "完整的做客记录保留在这里，方便制作人核对过往话题、节目形式和成片。",
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
      { label: "语言", value: "中文或英文" },
      {
        label: "形式",
        value: "远程；西雅图也可以线下",
      },
      {
        label: "时长",
        value: "通常聊60–120分钟，按你的节目调整",
      },
      {
        label: "常驻",
        value: "西雅图 · 美国太平洋时间",
      },
    ],
    kitEyebrow: "嘉宾资料",
    kitTitle: "做节目介绍需要的资料，都在这里。",
    kitIntro: "短版、长版，你按节目需要选。经历和数据都附了链接，方便核对。",
    pdfCta: "下载七页播客与视频访谈资料（PDF）",
    shortBioLabel: "短介绍",
    shortBio:
      "孙煜征（课代表立正），康奈尔大学经济学博士、超线性学院（Superlinear Academy）创始人。曾任Amazon经济学家、Meta数据科学家、腾讯IEG副总监，也是Statsig早期成员；Statsig后被OpenAI收购。他长期研究AI改变工作以后，什么能力和作品反而更重要。",
    longBioLabel: "长介绍",
    longBio:
      `孙煜征（课代表立正）毕业于康奈尔大学，获经济学博士学位，现居西雅图。他曾任Amazon经济学家、Meta数据科学家、腾讯IEG数据与AI副总监；在腾讯带过30人的数据与AI团队，连续两个周期获得最高绩效。他也是Statsig早期成员，Statsig后被OpenAI收购。他从大厂管理岗位进入早期创业公司，后来全职创办超线性学院（Superlinear Academy）；AI Builders课程与Stay Superlinear会员都在这个母体下。截至${membersAsOf("zh")}，他教过3,000多名付费学员，主持或参与了200多场公开对谈，并建立了一个拥有${membersWan()}成员、${PROJECTS_ZH}个真实项目分享的免费社区。他著有《真本事》和英文书《Feels Like Progress》，合著英文书《Growth Data Analytics Playbook》。`,
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
    contactEyebrow: "一起做节目",
    contactTitle: "有想聊的话题？我们一起录一期。",
    contactDetail:
      "发来你的节目或频道、想聊的话题，以及大概的形式和时间。我们一起商量怎么聊、怎么录，后续素材怎么用。",
    businessContact: "商务负责人：喵老师｜微信：FM13870617",
    contactButton: "聊聊这期节目",
    back: "回到全部合作入口",
  },
};

function buildCreatorMailto(lang: "en" | "zh") {
  const subject =
    lang === "en"
      ? "Podcast or creator invitation for Yuzheng Sun"
      : "聊聊节目合作｜课代表立正";
  const body =
    lang === "en"
      ? "Show or channel:\n\nCore question:\n\nWhy this matters to your audience:\n\nFormat and language:\n\nRough recording window:\n"
      : "节目或频道链接：\n\n想聊的话题：\n\n想怎么合作（做客、串台或共同策划）：\n\n大概时间：\n";
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

  const KIT = "/collab/podcast-kit-zh.pdf";
  const mailto = buildCreatorMailto(lang);

  return (
    <div
      className={lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="collab" />

      <main>
        {/* On the forest: what the invitation is, the room it comes from, and four plain facts. */}
        <section className="forest-head grain">
          <div className="wrap">
            <nav className="crumb" aria-label={lang === "en" ? "Breadcrumb" : "位置"}>
              <Link href={withLanguage("/collab", lang)}>
                {lang === "en" ? "Collaborate" : "合作"}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">
                {lang === "en" ? "Podcasts & creators" : "播客与视频"}
              </span>
            </nav>
            <div className="cols2 top">
              <div>
                <div className="eyebrow">{t.eyebrow}</div>
                <h1 className={lang === "zh" ? undefined : "long"}>
                  {lang === "zh"
                    ? t.h1.split("\n").map(line => (
                        <span key={line} className="line">
                          {line}
                        </span>
                      ))
                    : t.h1}
                </h1>
                {t.intro.map((paragraph, index) => (
                  <p key={paragraph} className={index === 0 ? "lede" : "aside"}>
                    {paragraph}
                  </p>
                ))}
                <div className="cta-row">
                  {lang === "zh" && (
                    <a className="btn btn-ivory" href="#contact">
                      聊聊节目合作
                    </a>
                  )}
                  <a
                    className={lang === "zh" ? "btn btn-line" : "btn btn-ivory"}
                    href="#conversations"
                  >
                    {t.questionCta}
                  </a>
                  {lang === "en" ? (
                    <a className="btn btn-line" href={KIT} {...EXTERNAL}>
                      {t.kitCta}
                    </a>
                  ) : (
                    <a className="lz-link" href={KIT} {...EXTERNAL}>
                      {t.kitCta} <i aria-hidden="true">→</i>
                    </a>
                  )}
                </div>
              </div>
              <figure>
                <img
                  src="/hero/acquired-behind-scenes-desktop.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired"
                      : "课代表立正与Acquired的两位主播（Ben Gilbert、David Rosenthal）对谈"
                  }
                  width={2400}
                  height={1600}
                />
                <figcaption>
                  {lang === "en"
                    ? "With Ben Gilbert and David Rosenthal of Acquired · Significance Summit"
                    : "Significance Summit现场，与Acquired的两位主播Ben Gilbert、David Rosenthal对谈"}
                </figcaption>
              </figure>
            </div>
            <dl className="facts-band">
              {t.heroProofs.map(proof => (
                <div key={proof.label}>
                  <dt>{proof.label}</dt>
                  <dd>
                    <Dotted text={proof.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Two collaborations in full: the episode, what it reached, what a listener said, and the
            platform screenshots behind the figures. */}
        <section id="conversations" className="sec">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.conversationsEyebrow}</div>
                <h2>
                  <Phrases text={t.conversationsTitle} />
                </h2>
              </div>
              <p>{t.conversationsIntro}</p>
            </div>
            <div className="cases">
              {leadConversations.map(conversation => (
                <article key={conversation.name} className="case">
                  <a
                    className="shot"
                    href={conversation.href}
                    aria-label={conversation.linkLabel}
                    {...EXTERNAL}
                  >
                    <img
                      src={conversation.image}
                      alt={conversation.role}
                      loading="lazy"
                      width={1280}
                      height={720}
                    />
                  </a>
                  <div className="body">
                    <div className="t">{conversation.label}</div>
                    <h3>
                      <Phrases text={conversation.name} />
                    </h3>
                    <p className="role">{conversation.role}</p>
                    <ul className="metrics">
                      {conversation.metrics.map(metric => (
                        <li key={`${conversation.name}-${metric.label}`}>
                          <b>{metric.value}</b>
                          <span>{metric.label}</span>
                          {metric.signal && <small>{metric.signal}</small>}
                        </li>
                      ))}
                    </ul>
                    <p className="note">{conversation.note}</p>
                    {conversation.proofNote && (
                      <p className="fine">{conversation.proofNote}</p>
                    )}
                    {conversation.quote && (
                      <blockquote>
                        <Quoted text={conversation.quote} />
                      </blockquote>
                    )}
                    <a className="lz-link" href={conversation.href} {...EXTERNAL}>
                      {conversation.linkLabel} <i aria-hidden="true">→</i>
                    </a>
                  </div>
                  {conversation.evidenceImages.length > 0 && (
                    <details className="shots">
                      <summary>{conversation.evidenceLabel}</summary>
                      <div
                        className={
                          conversation.evidenceImages.length === 1
                            ? "grid one"
                            : "grid"
                        }
                      >
                        {conversation.evidenceImages.map(evidence => (
                          <figure key={evidence.src}>
                            <a href={evidence.src} {...EXTERNAL}>
                              <img
                                src={evidence.src}
                                alt={evidence.alt}
                                loading="lazy"
                              />
                            </a>
                            <figcaption>
                              <span>{evidence.caption}</span>
                              <a href={evidence.src} {...EXTERNAL}>
                                {lang === "zh"
                                  ? "打开完整截图"
                                  : "Open full screenshot"}
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
            <p className="fine">{t.metricsNote}</p>
          </div>
        </section>

        <section id="questions" className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.questionsEyebrow}</div>
                <h2>
                  <Phrases text={t.questionsTitle} />
                </h2>
                <p className="say">{t.questionsIntro}</p>
              </div>
              <div>
                <ul className="points">
                  {t.questions.map(question => (
                    <li key={question.title}>
                      <h3>
                        <Phrases text={question.title} />
                      </h3>
                      <p>{question.detail}</p>
                      <p className="tag">{question.proof}</p>
                    </li>
                  ))}
                </ul>
                <p className="after-list">{t.otherDirections}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="head solo">
              <div>
                <div className="eyebrow">{t.formatsEyebrow}</div>
                <h2>
                  <Phrases text={t.formatsTitle} />
                </h2>
              </div>
            </div>
            <div className="cols">
              {t.formats.map(format => (
                <article key={format.number}>
                  <h3>{format.title}</h3>
                  <p>{format.detail}</p>
                  <p className="fit">{format.proof}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">{t.appearancesEyebrow}</div>
                <h2>
                  <Phrases text={t.appearancesTitle} />
                </h2>
              </div>
              <p>{t.appearancesIntro}</p>
            </div>
            <ul className="programs">
              {t.programs.map(program => (
                <li key={program.href}>
                  <a href={program.href} {...EXTERNAL}>
                    <b>{program.show}</b>
                    <span>{program.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The invitation itself, on the forest: the page's one loud stop. */}
        <section id="contact" className="sec band grain">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.contactEyebrow}</div>
                <h2>
                  <Phrases text={t.contactTitle} />
                </h2>
              </div>
              <div>
                <p className="say first">{t.contactDetail}</p>
                <div className="cta-row">
                  <a className="btn btn-ivory" href={mailto}>
                    {t.contactButton}
                  </a>
                </div>
                <p className="mail">yz@superlinear.academy</p>
                <p className="mail">{t.businessContact}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">{t.agreementsEyebrow}</div>
                <h2>
                  <Phrases text={t.agreementsTitle} />
                </h2>
                {hostConversation && (
                  <a
                    className="host-ref"
                    href={hostConversation.href}
                    {...EXTERNAL}
                  >
                    <img
                      src={hostConversation.image}
                      alt={hostConversation.role}
                      loading="lazy"
                      width={1280}
                      height={720}
                    />
                    <span className="t">{hostConversation.label}</span>
                    <b>{hostConversation.name}</b>
                    <span className="note">{hostConversation.note}</span>
                    <span className="lz-link">
                      {hostConversation.linkLabel} <i aria-hidden="true">→</i>
                    </span>
                  </a>
                )}
              </div>
              <div>
                <ul className="points">
                  {t.agreements.map(agreement => (
                    <li key={agreement.title}>
                      <h3>
                        <Phrases text={agreement.title} />
                      </h3>
                      <p>{agreement.detail}</p>
                    </li>
                  ))}
                </ul>
                <p className="after-list">{t.coproduction}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="chap">
              <div>
                <div className="eyebrow">{t.logisticsEyebrow}</div>
                <h2>{t.logisticsTitle}</h2>
              </div>
              <dl className="facts-grid">
                {t.logistics.map(item => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Every past appearance, for a producer who wants to check: closed until asked for. */}
            <details className="archive">
              <summary>
                <span className="t">
                  {lang === "en" ? "Complete archive" : "完整做客档案"}
                </span>
                <b>{t.appearancesArchive}</b>
                <span className="note">{t.appearancesArchiveDetail}</span>
              </summary>
              <ul className="archive-list">
                {guestAppearances.map(appearance => (
                  <AppearanceRow
                    key={appearance.href}
                    appearance={appearance}
                    lang={lang}
                    panelLabel={t.panelLabel}
                  />
                ))}
              </ul>
            </details>
          </div>
        </section>

        <section id="host-kit" className="sec ruled">
          <div className="wrap">
            <div className="kit">
              <div>
                <div className="eyebrow">{t.kitEyebrow}</div>
                <h2>
                  <Phrases text={t.kitTitle} />
                </h2>
                <p className="say">{t.kitIntro}</p>
                <div className="cta-row">
                  <a className="btn btn-green" href={KIT} {...EXTERNAL}>
                    {t.pdfCta}
                  </a>
                </div>
                <figure className="headshot">
                  <img
                    src="/yuzheng-sun-headshot.jpg"
                    alt={lang === "en" ? "Yuzheng Sun" : "孙煜征（课代表立正）"}
                    width={1200}
                    height={1200}
                    loading="lazy"
                  />
                  <figcaption>
                    <span>{t.headshotLabel}</span>
                    <a
                      className="lz-link"
                      href="/yuzheng-sun-headshot.jpg"
                      download="yuzheng-sun-headshot.jpg"
                    >
                      {t.headshotCta} <i aria-hidden="true">→</i>
                    </a>
                  </figcaption>
                </figure>
              </div>
              <div className="kit-rows">
                <div>
                  <div className="t">{t.shortBioLabel}</div>
                  <p>{t.shortBio}</p>
                </div>
                <details>
                  <summary>
                    {lang === "en" ? "View full bio" : "展开长介绍"}
                  </summary>
                  <p>{t.longBio}</p>
                </details>
                <div>
                  <div className="t">{t.brandLineLabel}</div>
                  <p className="line">{t.brandLine}</p>
                </div>
                <div>
                  <div className="t">{t.factsTitle}</div>
                  <ul className="link-list">
                    {t.facts.map(fact => (
                      <li key={fact.label}>
                        <a
                          className="lz-link"
                          href={withLanguage(fact.href, lang)}
                          {...(fact.href.startsWith("http") ? EXTERNAL : {})}
                        >
                          {fact.label} <i aria-hidden="true">→</i>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <p className="back">
              <Link className="lz-link" href={withLanguage("/collab", lang)}>
                {t.back} <i aria-hidden="true">→</i>
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
