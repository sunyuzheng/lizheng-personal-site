import type { SiteLang } from "./page-meta.ts";

export type DeckCollection = "enterprise" | "public";

export type DeckCategory =
  | "data-decision"
  | "strategy-knowledge"
  | "engineering-organization"
  | "builder-work"
  | "product-delivery";

export type DeckLanguage = "zh" | "en";
export type DeckLinkKind = "deck" | "replay" | "pending";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface DeckEntry {
  id: string;
  collection: DeckCollection;
  category: DeckCategory;
  organization: string;
  occasion?: LocalizedText;
  title: string;
  shortTitle?: string;
  date: string;
  language: DeckLanguage;
  audience: LocalizedText;
  takeaway: LocalizedText;
  href?: string;
  linkKind: DeckLinkKind;
  secondaryHref?: string;
  secondaryLinkKind?: Exclude<DeckLinkKind, "pending">;
  sourceHref?: string;
  featured?: boolean;
  accent: string;
  keywords: string[];
}

export interface DeckCategoryDefinition {
  id: DeckCategory;
  label: LocalizedText;
  description: LocalizedText;
}

export const DECK_CATEGORIES: DeckCategoryDefinition[] = [
  {
    id: "data-decision",
    label: { en: "Data & decisions", zh: "数据与决策" },
    description: {
      en: "How AI changes the value of analysis, experimentation, and professional judgment.",
      zh: "当分析本身越来越便宜，数据团队的价值该往哪里走。",
    },
  },
  {
    id: "strategy-knowledge",
    label: { en: "Strategy & knowledge work", zh: "战略与知识工作" },
    description: {
      en: "Turn judgment, context, and repeated research into systems that compound.",
      zh: "把判断、上下文和反复发生的研究，做成能够复利的系统。",
    },
  },
  {
    id: "engineering-organization",
    label: { en: "Engineering & organization", zh: "研发与组织转型" },
    description: {
      en: "Move beyond adoption metrics and redesign how teams build, evaluate, and learn.",
      zh: "不只统计工具采用率，而是重做团队构建、评估和学习的方式。",
    },
  },
  {
    id: "builder-work",
    label: { en: "From user to builder", zh: "从User到Builder" },
    description: {
      en: "Help non-engineering teams move from isolated prompts to end-to-end work.",
      zh: "让非研发团队从零散提问，走向可以交付结果的完整工作流。",
    },
  },
  {
    id: "product-delivery",
    label: { en: "Product & enterprise delivery", zh: "产品与大客户交付" },
    description: {
      en: "Use the customer frontier to improve both enterprise delivery and the product behind it.",
      zh: "让客户现场不只产生一次交付，也反过来推动产品和组织继续学习。",
    },
  },
];

export const DECK_LIBRARY: DeckEntry[] = [
  {
    id: "binance-data-analytics-ai",
    collection: "enterprise",
    category: "data-decision",
    organization: "Binance",
    occasion: {
      en: "Data Analytics team session",
      zh: "Data Analytics团队分享",
    },
    title: "AI时代，Data Analytics要重新定义自己",
    date: "2026-07-31",
    language: "zh",
    audience: {
      en: "Data analysts and analytics leaders",
      zh: "数据分析师与分析负责人",
    },
    takeaway: {
      en: "When AI can produce analysis directly, the durable advantage moves from output volume to problem framing, evidence, and decision quality.",
      zh: "当AI能直接完成分析，数据团队的价值要从产出数量，转向问题定义、证据和决策质量。",
    },
    href: "https://binance-data-analytics-ai.vercel.app",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/binance-data-analytics-ai",
    featured: true,
    accent: "#D7FF64",
    keywords: ["data analytics", "decision", "judgment", "binance", "数据分析"],
  },
  {
    id: "pinterest-data-science",
    collection: "enterprise",
    category: "data-decision",
    organization: "Pinterest",
    occasion: {
      en: "Data Science team session",
      zh: "Data Science团队分享",
    },
    title: "Augmenting Data Science in the AI Era",
    date: "2026-01-16",
    language: "en",
    audience: { en: "Data scientists", zh: "数据科学家" },
    takeaway: {
      en: "AI should expand the questions a data scientist can answer—not merely shorten the time to the next query.",
      zh: "AI不只把下一条查询写得更快，更应该扩大数据科学家能够回答的问题。",
    },
    href: "https://www.superlinear.academy/c/public/sections/900177/lessons/3409683",
    linkKind: "replay",
    accent: "#FF6B78",
    keywords: ["pinterest", "data science", "augmentation", "数据科学"],
  },
  {
    id: "tencent-judgment-engineering",
    collection: "enterprise",
    category: "strategy-knowledge",
    organization: "Tencent IEG",
    occasion: {
      en: "Delivered · Judgment Engineering strategy briefing",
      zh: "已交付 · Judgment Engineering战略汇报",
    },
    title: "什么是好的战略分析？",
    date: "2026-07-09",
    language: "zh",
    audience: {
      en: "Strategy, business analysis, and AI leaders",
      zh: "战略、商业分析与AI负责人",
    },
    takeaway: {
      en: "A strong strategic analysis challenges the starting view, clarifies what is tangled, and turns judgment into action. AI can build the 60-point factual base; people must push the judgment to 90.",
      zh: "好的战略分析，不只是把信息写得更完整。它要颠覆原有判断、讲清混乱，再把判断推到行动。AI把事实底座做到60分，人负责把判断推到90分。",
    },
    linkKind: "pending",
    featured: true,
    accent: "#FFB15C",
    keywords: [
      "tencent",
      "judgment engineering",
      "strategy",
      "strategic analysis",
      "AI native",
      "腾讯",
      "什么是好的战略分析",
      "战略分析",
    ],
  },
  {
    id: "dymon-investment-research",
    collection: "enterprise",
    category: "strategy-knowledge",
    organization: "Dymon Asia",
    occasion: {
      en: "PM AI fluency briefing",
      zh: "投资经理AI能力briefing",
    },
    title: "The Third Interface for Investment Research",
    date: "2026-05-06",
    language: "en",
    audience: {
      en: "Portfolio managers and senior investors",
      zh: "投资经理与资深投资人",
    },
    takeaway: {
      en: "Natural language is becoming a dispatch layer for compute, tools, and context around investment judgment.",
      zh: "自然语言正在成为新的调度层，让投资判断可以调用计算、工具和上下文。",
    },
    href: "https://dymon-asia-ai-enablement.vercel.app",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/dymon-asia-ai-enablement",
    featured: true,
    accent: "#67E8F9",
    keywords: [
      "dymon",
      "investment",
      "portfolio manager",
      "research",
      "context",
    ],
  },
  {
    id: "tencent-game-strategy",
    collection: "enterprise",
    category: "strategy-knowledge",
    organization: "腾讯游戏战略",
    occasion: {
      en: "May 2026 session edition",
      zh: "2026年5月现场版",
    },
    title: "战略研究的第三界面",
    date: "2026-05-07",
    language: "zh",
    audience: {
      en: "Strategy researchers and leaders",
      zh: "战略研究者与负责人",
    },
    takeaway: {
      en: "Strategy teams do not lack information. The scarce work is turning information into organizational judgment—and preserving the context so the next cycle starts further ahead.",
      zh: "战略研究不缺信息；真正稀缺的是把信息变成组织判断，并让每一轮研究留下可以继续复利的上下文。",
    },
    href: "https://tencent-game-strategy-ai-enablement.vercel.app",
    linkKind: "deck",
    accent: "#FB923C",
    keywords: [
      "tencent",
      "game",
      "strategy",
      "research",
      "context",
      "腾讯游戏",
      "战略研究",
    ],
  },
  {
    id: "linkedin-engineering-ai",
    collection: "enterprise",
    category: "engineering-organization",
    organization: "LinkedIn",
    occasion: {
      en: "Engineering leadership briefing",
      zh: "研发管理者分享",
    },
    title: "Common Misconceptions in AI Transformation for Engineering Teams",
    shortTitle: "AI Transformation for Engineering Teams",
    date: "2026-05-26",
    language: "en",
    audience: {
      en: "Engineering and technical leaders",
      zh: "研发与技术负责人",
    },
    takeaway: {
      en: "AI adoption is not transformation. The real work is changing how a team builds, evaluates, and learns.",
      zh: "工具用起来，不等于组织完成了转型。真正要变的是团队构建、评估和学习的方式。",
    },
    href: "https://linkedin-engineering-ai.vercel.app",
    linkKind: "deck",
    featured: true,
    accent: "#76A7FF",
    keywords: [
      "linkedin",
      "engineering",
      "transformation",
      "AI native",
      "研发",
    ],
  },
  {
    id: "tencent-academy-engineering",
    collection: "enterprise",
    category: "engineering-organization",
    organization: "腾讯学堂",
    occasion: {
      en: "Delivered enterprise session for engineering leaders",
      zh: "已交付 · 研发管理者企业培训",
    },
    title: "研发团队AI转型的常见误区与正确坐标系",
    date: "2026-05-27",
    language: "zh",
    audience: {
      en: "Engineering teams and leaders",
      zh: "研发团队与技术管理者",
    },
    takeaway: {
      en: "A useful transformation coordinate system separates tool usage, workflow redesign, and new organizational capability.",
      zh: "把工具使用、工作流重做和组织能力放进同一张坐标系，才能知道团队到底走到了哪一步。",
    },
    href: "https://html-deck-beta.vercel.app",
    linkKind: "deck",
    secondaryHref:
      "https://www.superlinear.academy/c/public/sections/900177/lessons/3964350",
    secondaryLinkKind: "replay",
    featured: true,
    accent: "#5EEAD4",
    keywords: [
      "tencent",
      "engineering",
      "transformation",
      "enterprise training",
      "研发",
      "腾讯学堂",
      "企业培训",
      "已交付",
    ],
  },
  {
    id: "amazon-stop-chatting",
    collection: "enterprise",
    category: "engineering-organization",
    organization: "Amazon",
    occasion: {
      en: "AI agent workshop",
      zh: "AI Agent工作坊",
    },
    title: "Stop Chatting, Start Scaling",
    date: "2026-04-22",
    language: "en",
    audience: {
      en: "Technical and non-technical builders",
      zh: "技术与非技术Builder",
    },
    takeaway: {
      en: "Move from one-off chats to agentic loops with context, evaluation, and standards that survive the first request.",
      zh: "从一次性聊天走向有上下文、有评估、有标准，而且第二次还能继续工作的Agent系统。",
    },
    href: "https://deck-pi-three.vercel.app",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/stop-chatting-start-scaling",
    accent: "#A7F3D0",
    keywords: ["amazon", "agent", "coding", "context", "evaluation"],
  },
  {
    id: "meituan-user-to-builder",
    collection: "enterprise",
    category: "builder-work",
    organization: "美团",
    occasion: {
      en: "Company-wide AI session",
      zh: "全员AI分享",
    },
    title: "从User到Builder：AI时代的个人进化指南",
    date: "2026-06-10",
    language: "zh",
    audience: {
      en: "Company-wide, cross-functional teams",
      zh: "全员，以非研发团队为主",
    },
    takeaway: {
      en: "When non-engineers can build, the ceiling moves from using a tool well to redesigning an entire workflow.",
      zh: "当非研发同学也能build，能力上限就从用好一个工具，变成重做一整段工作流。",
    },
    href: "https://www.superlinear.academy/c/public/sections/900177/lessons/4030640",
    linkKind: "replay",
    accent: "#FFD84D",
    keywords: ["meituan", "builder", "workflow", "美团", "非研发"],
  },
  {
    id: "xiaohongshu-productivity",
    collection: "enterprise",
    category: "builder-work",
    organization: "小红书",
    occasion: {
      en: "Company-wide productivity session",
      zh: "公司级生产力分享",
    },
    title: "从30%到x10：AI时代的个人生产力跃迁",
    date: "2026-06-02",
    language: "zh",
    audience: {
      en: "Content, product, operations, and business teams",
      zh: "内容、产品、运营与商业团队",
    },
    takeaway: {
      en: "When production gets cheaper, judgment, context, trust, and coordination become more valuable.",
      zh: "当生产变便宜，判断、上下文、信任和协作会变得更贵。",
    },
    href: "https://www.superlinear.academy/c/public/sections/900177/lessons/3990267",
    linkKind: "replay",
    featured: true,
    accent: "#FF788A",
    keywords: ["xiaohongshu", "productivity", "content", "小红书", "生产力"],
  },
  {
    id: "sisi-ai-value",
    collection: "enterprise",
    category: "builder-work",
    organization: "斯斯·小私董",
    occasion: {
      en: "AI internal workshop",
      zh: "AI内训",
    },
    title: "从“会用AI”到“用AI创造价值”",
    date: "2026-03-21",
    language: "zh",
    audience: {
      en: "Creators and small-business operators",
      zh: "内容创业者与小企业经营者",
    },
    takeaway: {
      en: "The gap between using AI and creating value with it is a better problem, a complete workflow, and a reusable asset.",
      zh: "会用AI和用AI创造价值之间，差的是一个更好的问题、一条完整工作流和一份可复用资产。",
    },
    href: "https://sisi-internal-training-deck.ai-builders.space",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/sisi-internal-training-deck",
    accent: "#F9A8D4",
    keywords: ["creator", "small business", "AI value", "内训", "私董"],
  },
  {
    id: "tencent-ieg-intensive-bootcamp",
    collection: "enterprise",
    category: "product-delivery",
    organization: "腾讯游戏IEG",
    occasion: {
      en: "Three-track custom training proposal · public-safe edition",
      zh: "三方向定制培训方案 · 脱敏公开版",
    },
    title: "腾讯游戏AI Intensive Bootcamp",
    date: "2026-03-16",
    language: "zh",
    audience: {
      en: "Game development teams and learning leaders",
      zh: "游戏开发团队与人才发展负责人",
    },
    takeaway: {
      en: "Enterprise AI training should start with real role-level constraints, then connect capability progression, project practice, and reusable organizational assets.",
      zh: "企业AI培训不该从通用工具清单开始，而要从真实岗位瓶颈出发，把能力进阶、项目实践和组织沉淀设计在一起。",
    },
    href: "https://ai-coding-app-deck.ai-builders.space/assets/Superlinear_x_IEG_Desensitized.pdf",
    linkKind: "deck",
    featured: true,
    accent: "#6EE7B7",
    keywords: [
      "tencent",
      "IEG",
      "bootcamp",
      "enterprise training",
      "context",
      "agent",
      "腾讯游戏",
      "企业培训",
      "定制课程",
    ],
  },
  {
    id: "ai-side-income-career-capital",
    collection: "public",
    category: "builder-work",
    organization: "课代表立正",
    occasion: {
      en: "Public talk deck · Career capital edition",
      zh: "AI副业公开演讲·职业复利版",
    },
    title: "AI副业，别越做越不值钱",
    date: "2026-08-21",
    language: "zh",
    audience: {
      en: "Programmers and AI builders exploring side projects",
      zh: "正在考虑AI副业、独立产品或一人公司的技术从业者",
    },
    takeaway: {
      en: "A side project is not only an income bet; it allocates time, reputation, and career capital. Use three ledgers—cash, commercial evidence, and durable assets—to decide when to stop, pivot, or double down.",
      zh: "AI副业表面上是找项目，实质上是在配置时间、信誉与职业资本。用现金、商业证据和竞争力三本账，决定何时停止、转向或加码。",
    },
    href: "https://www.lizheng.ai/decks/ai-side-income-career-capital",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/ai-side-income-2026",
    featured: true,
    accent: "#238343",
    keywords: [
      "AI side income",
      "side project",
      "growth",
      "indie hacker",
      "AI副业",
      "独立开发",
      "增长",
      "一人公司",
      "职业资本",
      "商业证据",
    ],
  },
  {
    id: "ai-side-income-commercial-gates",
    collection: "public",
    category: "builder-work",
    organization: "课代表立正",
    occasion: {
      en: "Public talk deck · Commercial gates edition",
      zh: "AI副业公开演讲·商业门槛版",
    },
    title: "AI副业，从做出来到持续赚钱",
    date: "2026-08-21",
    language: "zh",
    audience: {
      en: "Programmers and AI builders exploring side projects",
      zh: "正在考虑AI副业、独立产品或一人公司的技术从业者",
    },
    takeaway: {
      en: "AI makes building cheaper, but durable income still depends on demand, distribution, trust, retention, margin, and the willingness to keep taking responsibility.",
      zh: "AI降低了构建成本，却没有替你完成需求、分发、信任、留存、毛利和长期责任。",
    },
    href: "https://www.lizheng.ai/decks/ai-side-income-commercial-gates",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/ai-side-income-2026",
    featured: true,
    accent: "#155D30",
    keywords: [
      "AI side income",
      "side project",
      "business model",
      "distribution",
      "retention",
      "AI副业",
      "独立开发",
      "持续赚钱",
      "商业门槛",
    ],
  },
  {
    id: "tsvc-netease-ai-learning",
    collection: "public",
    category: "builder-work",
    organization: "TSVC×网易新闻",
    occasion: {
      en: "Joint public online session",
      zh: "联合线上公开分享",
    },
    title: "普通人应该怎么学AI",
    date: "2026-06-26",
    language: "zh",
    audience: {
      en: "Professionals and investors without a technical background",
      zh: "非技术背景的职场人与投资者",
    },
    takeaway: {
      en: "The useful leap is not from one chatbot to another. It is from isolated conversations to a personal AI work system that compounds.",
      zh: "真正有用的跨越，不是从一个聊天工具换到另一个，而是从零散对话走向能够复利的个人AI工作系统。",
    },
    linkKind: "pending",
    accent: "#FDE68A",
    keywords: [
      "TSVC",
      "NetEase News",
      "AI learning",
      "网易新闻",
      "普通人学AI",
      "个人AI系统",
    ],
  },
  {
    id: "fde-enterprise-engineering",
    collection: "public",
    category: "product-delivery",
    organization: "Superlinear Academy",
    occasion: {
      en: "Public product and organization talk",
      zh: "产品与组织公开分享",
    },
    title: "FDE模式：从Statsig Enterprise Engineering看产品化的大客户交付",
    date: "2026-06-06",
    language: "zh",
    audience: { en: "Founders and product leaders", zh: "创始人与产品负责人" },
    takeaway: {
      en: "FDE is not merely onsite delivery. Done well, it turns the customer frontier into a high-speed product learning loop.",
      zh: "FDE不只是驻场交付；做对了，它会把客户现场变成高速的产品学习回路。",
    },
    href: "https://fde-enterprise-engineering-statsig.vercel.app",
    linkKind: "deck",
    accent: "#C4B5FD",
    keywords: ["fde", "statsig", "enterprise engineering", "product", "大客户"],
  },
  {
    id: "opc-ai-leverage",
    collection: "public",
    category: "builder-work",
    organization: "XWZ OPC Founder Alliance",
    occasion: {
      en: "Founder workshop and live demo",
      zh: "创业者分享与现场Demo",
    },
    title: "用AI提效30%VS提效10倍，本质差别到底在哪儿？",
    date: "2026-05-21",
    language: "zh",
    audience: { en: "One-person-company founders", zh: "一人公司创业者" },
    takeaway: {
      en: "A 10x outcome rarely comes from a better prompt. It comes from changing the operating system around the work.",
      zh: "10倍提效很少来自一条更好的prompt，更多来自把工作背后的系统一起改掉。",
    },
    href: "https://opc-founder-alliance-ai-demo.vercel.app/deck/",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/xwz-opc-ai-demo-kit",
    accent: "#C4B5FD",
    keywords: ["opc", "founder", "leverage", "workflow", "一人公司"],
  },
  {
    id: "seattle-ai-startup-summit",
    collection: "public",
    category: "builder-work",
    organization: "Seattle (AI) Startup Summit",
    occasion: {
      en: "Hands-on workshop",
      zh: "现场工作坊",
    },
    title: "Learning to Code When AI Does the Heavy Lifting",
    date: "2026-04-01",
    language: "en",
    audience: {
      en: "Founders and first-time builders",
      zh: "创业者与第一次build的人",
    },
    takeaway: {
      en: "When AI writes much of the code, beginners should learn to specify, inspect, debug, and own the result.",
      zh: "当AI写掉大部分代码，初学者更该学会定义、检查、调试，并对结果负责。",
    },
    href: "https://workshop-cursor-deck.ai-builders.space",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/workshop-cursor-deck",
    accent: "#C4B5FD",
    keywords: ["seattle", "coding", "cursor", "workshop", "startup"],
  },
  {
    id: "acemode-cursor",
    collection: "public",
    category: "builder-work",
    organization: "Superlinear × AceMode",
    occasion: {
      en: "Public online session",
      zh: "线上公开分享",
    },
    title: "从ChatGPT到Cursor：普通人如何抓住AI实战红利",
    date: "2026-03-27",
    language: "zh",
    audience: {
      en: "Knowledge workers and new builders",
      zh: "知识工作者与新Builder",
    },
    takeaway: {
      en: "The important move is not from one tool to another, but from asking for answers to building work that can be inspected and reused.",
      zh: "真正重要的不是从一个工具换到另一个工具，而是从要答案，走到做出能检查、能复用的东西。",
    },
    href: "https://acemode-deck.ai-builders.space",
    linkKind: "deck",
    sourceHref: "https://github.com/sunyuzheng/acemode-deck",
    accent: "#C4B5FD",
    keywords: ["acemode", "cursor", "chatgpt", "builder", "实战"],
  },
];

export function localized(text: LocalizedText, lang: SiteLang) {
  return text[lang];
}

export function categoryDefinition(category: DeckCategory) {
  const definition = DECK_CATEGORIES.find(item => item.id === category);
  if (!definition) throw new Error(`Unknown deck category: ${category}`);
  return definition;
}

export const ENTERPRISE_DECKS = DECK_LIBRARY.filter(
  deck => deck.collection === "enterprise"
);

export const PUBLIC_TALK_DECKS = DECK_LIBRARY.filter(
  deck => deck.collection === "public"
);
