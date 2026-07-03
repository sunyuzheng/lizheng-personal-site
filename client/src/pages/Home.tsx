import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage, pick } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "wouter";
import {
  Youtube,
  Linkedin,
  Mail,
  Users,
  TrendingUp,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  Play,
  Building2,
  Rss,
  Zap,
  Wrench,
  Rocket,
  Landmark,
  Brain,
  Compass,
  BarChart2,
  MapPin,
  Smartphone,
  Apple,
} from "lucide-react";

const throughline = {
  en: [
    {
      era: "Cornell",
      role: "PhD in Economics",
      title:
        "Economics trained me to look for incentives and hidden constraints.",
      detail:
        "The useful question is rarely whether an idea sounds right. It is what would have to be true for it to work, and what evidence would change my mind.",
    },
    {
      era: "Amazon",
      role: "Economist",
      title: "Business decisions taught me to respect operational reality.",
      detail:
        "Models only matter when they survive deadlines, messy inputs, stakeholder tradeoffs, and weekly business reviews.",
    },
    {
      era: "Meta",
      role: "Data Scientist",
      title: "Growth and A/B testing became my favorite way to learn.",
      detail:
        "Experimentation turns opinions into reality checks. It is how product judgment, statistics, and user psychology compound together.",
    },
    {
      era: "Tencent IEG",
      role: "Vice Director, Data & AI",
      title: "Leadership made the system larger than any single analysis.",
      detail:
        "Running data and AI teams made me think harder about talent density, communication bandwidth, incentives, and the cost of unclear direction.",
    },
    {
      era: "Statsig",
      role: "Principal Data Scientist · Sole Evangelist",
      title: "Experimentation infrastructure met the AI frontier.",
      detail:
        "As an early Statsig team member and sole evangelist, I saw how better tools change the speed at which companies update their beliefs.",
    },
    {
      era: "Superlinear",
      role: "Founder & CEO",
      title: "Now I build learning systems for AI-era builders.",
      detail:
        "Courses, community, interviews, company sessions, and learning loops all serve the same goal: helping people build, not merely use.",
    },
  ],
  zh: [
    {
      era: "Cornell",
      role: "经济学博士",
      title: "经济学训练我先看激励、约束和隐藏的系统结构。",
      detail:
        "真正有用的问题通常是：它成立需要哪些前提？什么证据会让我改变判断？",
    },
    {
      era: "Amazon",
      role: "经济学家",
      title: "商业决策让我尊重运营现实。",
      detail:
        "模型只有在截止时间、脏数据、利益相关方和 WBR 里还能站住，才是真的有用。",
    },
    {
      era: "Meta",
      role: "数据科学家",
      title: "增长和 A/B testing 成为我最喜欢的学习方式。",
      detail:
        "实验把观点变成现实检验。它让产品判断、统计能力和用户心理在同一个系统里复利。",
    },
    {
      era: "腾讯 IEG",
      role: "数据与 AI 副总监",
      title: "管理经历让我看到分析之外的系统。",
      detail:
        "带数据与 AI 团队以后，我更在意人才密度、沟通带宽、组织激励，以及方向不清晰本身的成本。",
    },
    {
      era: "Statsig",
      role: "首席数据科学家 · 唯一布道师",
      title: "实验基础设施和 AI 前沿在这里交汇。",
      detail:
        "作为 Statsig 早期成员和唯一布道师，我亲眼看到更好的工具如何改变一家公司的认知更新速度。",
    },
    {
      era: "Superlinear",
      role: "Founder & CEO",
      title: "现在我在为 AI 时代的 builders 搭建学习系统。",
      detail:
        "课程、社群、访谈、企业培训和学习闭环，服务的是同一个目标：帮助更多人把工具使用推进到真实构建。",
    },
  ],
};

const principles = {
  en: [
    {
      title: "Better world models compound.",
      detail:
        "A person’s ceiling is constrained by the quality of their model of reality. The work is to test that model against the world often enough that it keeps updating.",
      linkLabel: "Video: World Model",
      href: "https://www.youtube.com/watch?v=r0nsW3nIFgk",
    },
    {
      title: "Strong opinions should invite stronger counterarguments.",
      detail:
        "Conviction is useful only when it stays testable. I try to make the argument sharp enough that other people can actually hit it.",
      linkLabel: "Video: Strong Opinions, Weakly Held",
      href: "https://www.youtube.com/watch?v=vYOogCGsIog",
    },
    {
      title: "Experiment beats thinking. Action beats knowledge.",
      detail:
        "Thinking matters, but only when it has contact with reality. In growth, A/B testing, and AI work, I want ideas to become first-hand feedback quickly.",
      linkLabel: "Note: Learning AI by Doing",
      href: "https://www.superlinear.academy/c/ai-resources/ai-tutorial",
    },
    {
      title: "The AI era belongs to builders, not passive users.",
      detail:
        "The meaningful gap is whether someone can turn AI into a reliable workflow, product, asset, or system.",
      linkLabel: "Note: AI User vs. AI Builder",
      href: "https://www.superlinear.academy/c/ai-resources/ai-mastery",
    },
    {
      title: "Cheap code raises the price of taste.",
      detail:
        "When execution becomes abundant, the scarce ability is knowing what is good: standards, architecture, interaction, and the taste to reject almost-right work.",
      linkLabel: "Note: Quality and AI",
      href: "https://www.superlinear.academy/c/ai-resources/quality",
    },
  ],
  zh: [
    {
      title: "更好的世界模型会复利。",
      detail:
        "一个人的天花板，往往受限于他对真实世界建模的质量。关键在于让这个模型更频繁地和真实世界对账。",
      linkLabel: "视频：世界模型",
      href: "https://www.youtube.com/watch?v=r0nsW3nIFgk",
    },
    {
      title: "强观点要经得起更强的反驳。",
      detail:
        "观点要足够清晰，才有被检验的价值；讨论的价值在于把关键假设暴露出来，让事情往前走。",
      linkLabel: "视频：如何坚持观点",
      href: "https://www.youtube.com/watch?v=vYOogCGsIog",
    },
    {
      title: "实验胜过思考，行动大于知识。",
      detail:
        "思考当然重要，但它必须尽快接触现实。从增长、A/B testing 到 AI 学习，我都更相信第一手反馈。",
      linkLabel: "文章：学 AI 的两大误区",
      href: "https://www.superlinear.academy/c/ai-resources/ai-tutorial",
    },
    {
      title: "AI 时代奖励能把工具变成系统的人。",
      detail:
        "真正拉开差距的，是能否把 AI 变成稳定的工作流、产品、资产和系统。",
      linkLabel: "文章：AI User 与 AI Builder 的差距",
      href: "https://www.superlinear.academy/c/ai-resources/ai-mastery",
    },
    {
      title: "代码变便宜，审美变昂贵。",
      detail:
        "当执行和生成都变得便宜，真正稀缺的是知道什么是好：标准、架构、交互，以及拒绝“差不多”的能力。",
      linkLabel: "文章：良质与 AI",
      href: "https://www.superlinear.academy/c/ai-resources/quality",
    },
  ],
};

const predictions = {
  en: [
    {
      date: "2023.03",
      title: "Generative AI is a paradigm shift — with probabilities attached",
      detail:
        "From “The Five Most Important Questions About ChatGPT”: a digital apprentice for everyone (75%), 10x coding productivity (70%), AI that works for me (50%) — and “the marginal cost of distributing intelligence goes to zero.”",
      links: [
        {
          label: "Essay",
          href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
        },
      ],
    },
    {
      date: "2024.12",
      title: "Agentic AI: from “ask me anything” to “do it for me”",
      detail:
        "Explained why this was the most important shift underway, then put a precise window on it: 10–18 months. The agentic wave landed inside that window.",
      links: [
        {
          label: "Essay",
          href: "https://www.superlinear.academy/c/ai-resources/agentic-ai-agentic-ai",
        },
        { label: "Video", href: "https://youtu.be/FzbkAy0DcQk" },
      ],
    },
    {
      date: "2025.03",
      title: "MCP: the business game behind a unified tool protocol",
      detail:
        "Framed the protocol race as a standards-and-ecosystem play, not a technical one — then publicly revisited the call in October: “OpenAI’s Apps SDK support is a crisis for MCP.”",
      links: [
        {
          label: "Essay",
          href: "https://www.superlinear.academy/c/ai-resources/mcp",
        },
        { label: "Video", href: "https://youtu.be/kwwjR6HHJPM" },
      ],
    },
    {
      date: "2026.02",
      title: "OpenClaw: why it took off — and why it would cool",
      detail:
        "Published before the hype peak. Named the mechanism (bringing what a niche already enjoyed to a much larger audience) and the ceiling: “Tools fade. Understanding why they work doesn’t.”",
      links: [
        {
          label: "Essay",
          href: "https://www.superlinear.academy/c/ai-resources/openclaw",
        },
        { label: "Video", href: "https://youtu.be/h_yCYBRzbVw" },
      ],
    },
  ],
  zh: [
    {
      date: "2023.03",
      title: "生成式 AI 是范式突破——判断带着概率",
      detail:
        "《关于ChatGPT最重要的五个问题》：每个人的数字学徒（75%）、编程提效十倍（70%）、替我打工（50%）——以及「智力分发的边际成本降为 0」。",
      links: [
        {
          label: "原文",
          href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
        },
      ],
    },
    {
      date: "2024.12",
      title: "Agentic AI：从「我问你答」到「我问你做」",
      detail:
        "讲清了为什么这是最重要的变化；随后的视频给出精确的机会窗口：10–18 个月——之后 agentic 产品的全面爆发落在这个窗口里。",
      links: [
        {
          label: "原文",
          href: "https://www.superlinear.academy/c/ai-resources/agentic-ai-agentic-ai",
        },
        { label: "视频", href: "https://youtu.be/FzbkAy0DcQk" },
      ],
    },
    {
      date: "2025.03",
      title: "MCP：统一工具协议背后的商业与技术博弈",
      detail:
        "把协议之争讲成标准与生态之争；同年 10 月公开复盘「OpenAI Apps SDK 对 MCP 反而是危机」。",
      links: [
        {
          label: "原文",
          href: "https://www.superlinear.academy/c/ai-resources/mcp",
        },
        { label: "视频", href: "https://youtu.be/kwwjR6HHJPM" },
      ],
    },
    {
      date: "2026.02",
      title: "OpenClaw（小龙虾）：为什么是它火，以及它为什么会凉",
      detail:
        "热度顶峰前发布。讲清了火的机制——把一小撮人已经享受的能力，推到更大的用户群面前；也点破了天花板：「工具会过气，对工具本质的理解不会」。",
      links: [
        {
          label: "原文",
          href: "https://www.superlinear.academy/c/ai-resources/openclaw",
        },
        { label: "视频", href: "https://youtu.be/h_yCYBRzbVw" },
      ],
    },
  ],
};

const practicePaths = {
  en: [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "For individuals",
      title: "AI-Builders",
      detail:
        "A course and community for professionals who want to build reliable AI workflows beyond prompt tricks.",
      proof: "3,000+ paying students · 4.9/5 Maven rating",
      href: "https://ai-builders.com",
      cta: "View curriculum",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: "For organizations",
      title: "Enterprise AI training",
      detail:
        "Custom sessions for teams at Tencent, DoorDash, Pinterest, 1Password, Amazon, and more, centered on context architecture and real workflows.",
      proof:
        "AI transformation as an operating habit, with workshop time tied to real workflows",
      href: "https://corp-training.ai-builders.com",
      cta: "Enterprise inquiry",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "For builders",
      title: "Superlinear Academy",
      detail:
        "A community where builders trade notes, test ideas, and stay close to real work.",
      proof: '"Good design happens in chunks." - Paul Graham',
      href: "https://www.superlinear.academy",
      cta: "Join community",
    },
  ],
  zh: [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "面向个体",
      title: "AI-Builders",
      detail:
        "面向专业人士的系统课程和社群，帮助学员把 AI 放进稳定的工作流和产出里。",
      proof: "3000+ 付费学员 · Maven 4.9/5 评分",
      href: "https://ai-builders.com",
      cta: "查看课程",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: "面向组织",
      title: "企业 AI 培训",
      detail:
        "为腾讯、DoorDash、Pinterest、1Password、Amazon 等团队做定制训练，核心是上下文架构和真实工作流。",
      proof: "把培训时间接回真实工作流，让 AI 转型进入组织习惯",
      href: "https://corp-training.ai-builders.com",
      cta: "企业合作",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "面向 builders",
      title: "Superlinear Academy",
      detail:
        "一个面向 builders 的社群，用来交换经验、测试想法，并把讨论留在真实工作附近。",
      proof: '"Good design happens in chunks." - Paul Graham',
      href: "https://www.superlinear.academy",
      cta: "加入社群",
    },
  ],
};

const endorsements = {
  en: [
    {
      quote:
        "Yuzheng has a rare ability to connect AI, product judgment, and personal growth into a practical learning system.",
      name: "Dai Yusen",
      title: "Partner, ZhenFund",
      subtitle: "真格基金合伙人",
      avatar: "/avatars/dai-yusen.jpg",
      initials: "DY",
    },
    {
      quote:
        "Yuzheng has built an AI education community that is carefully curated, practical, and unusually useful for people doing real work.",
      name: "Wei Manfredi",
      title: "Global CAIO & CTO · McDonald's · Google Cloud · lululemon",
      subtitle: "Top 100 Global AI Leaders · Top AI Leaders in Retail 2026",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "Yuzheng distills years of product growth wisdom into actionable insight — helping data scientists surface decisive signals, PMs turn numbers into strategy, and founders find a repeatable path to compounding PMF.",
      name: "Vijaye Raji",
      title: "Founder & CEO, Statsig",
      subtitle: "CTO of Applications, OpenAI",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
  ],
  zh: [
    {
      quote: "立正很擅长把 AI、产品判断和个人成长连接成一套可实践的学习系统。",
      name: "戴雨森",
      title: "真格基金合伙人",
      subtitle: "ZhenFund Partner",
      avatar: "/avatars/dai-yusen.jpg",
      initials: "雨森",
    },
    {
      quote:
        "立正做的 AI 教育社群很少见：内容筛选认真，实战密度高，也确实贴近工作里的问题。",
      name: "Wei Manfredi",
      title: "全球 CAIO & CTO · McDonald's · Google Cloud · lululemon",
      subtitle: "Top 100 Global AI Leaders · Top AI Leaders in Retail 2026",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "立正能把多年产品增长经验提炼成可执行的洞察，帮助数据科学家、产品经理和创始人更快看清关键问题。",
      name: "Vijaye Raji",
      title: "Statsig 创始人 & CEO",
      subtitle: "OpenAI CTO of Applications",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
  ],
};

const guestCategories = {
  en: [
    {
      label: "AI research & infrastructure",
      title: "People close to the frontier",
      desc: "Researchers and infrastructure builders shaping the systems behind AI, data, and modern software.",
      items: [
        {
          name: "Yangqing Jia",
          role: "PyTorch co-creator · Lepton AI founder",
          href: "/guests/yangqing-jia",
          image: "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
        },
        {
          name: "Shuchao Bi",
          role: "Head of Post-Training · Multimodal, OpenAI",
          href: "/guests/shuchao-bi",
          image: "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
        },
        {
          name: "Yuandong Tian",
          role: "Research Scientist, Meta AI / FAIR",
          href: "/guests/tian-yuandong",
          image: "https://img.youtube.com/vi/dymM40bVIhQ/hqdefault.jpg",
        },
        {
          name: "Reynold Xin",
          role: "Co-founder, Databricks",
          href: "/guests/reynold-xin",
          image: "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
        },
      ],
    },
    {
      label: "Company leaders",
      title: "Operators who have built at scale",
      desc: "Executives and product leaders from companies where product, data, and organization design meet reality.",
      items: [
        {
          name: "Guang",
          role: "Tencent GM · Black Myth: Wukong marketing",
          href: "/guests/guang",
          image: "https://img.youtube.com/vi/apFYcIzJ1jY/hqdefault.jpg",
        },
        {
          name: "Ethan Evans",
          role: "Former VP, Amazon",
          href: "/guests/ethan-evans",
          image: "https://img.youtube.com/vi/RRSMjC_BF8Y/hqdefault.jpg",
        },
        {
          name: "Vijaye Raji",
          role: "Founder & CEO, Statsig · CTO of Applications, OpenAI",
          href: "/guests/vijaye-raji",
          image: "https://img.youtube.com/vi/iw2QYZeVlOQ/hqdefault.jpg",
        },
        {
          name: "Howie Xu",
          role: "Chief AI Officer, Gen Digital",
          href: "/guests/howie-xu",
          image: "https://img.youtube.com/vi/awaZBWTss-4/hqdefault.jpg",
        },
      ],
    },
    {
      label: "Product, data & growth leaders",
      title: "People who turn judgment into products",
      desc: "Leaders whose work sits between product taste, data systems, growth, and organizational execution.",
      items: [
        {
          name: "Ryo Lu",
          role: "Head of Design, Cursor",
          href: "/guests/ryo-lu",
          image: "https://img.youtube.com/vi/BnL5qaBzmR0/hqdefault.jpg",
        },
        {
          name: "Howard Li",
          role: "Data Science Director, Meta",
          href: "/guests/howard-li",
          image: "https://img.youtube.com/vi/ZiARi5uJpco/hqdefault.jpg",
        },
        {
          name: "Angelina Yang",
          role: "Former VP of Data · TwoSetAI founder",
          href: "/guests/angelina-yang",
          image: "https://img.youtube.com/vi/tJXIGeu6wXQ/hqdefault.jpg",
        },
        {
          name: "Mengying Li",
          role: "Angel investor · former Notion / MotherDuck growth DS",
          href: "/guests/mengying-li",
          image: "https://img.youtube.com/vi/NWe92tuQUTA/hqdefault.jpg",
        },
      ],
    },
    {
      label: "Experimentation & AI rooms",
      title: "Where decisions meet real workflows",
      desc: "Experimentation, analytics, and company rooms where AI and data work are tested against operating reality.",
      items: [
        {
          name: "Chris Khawand · John Meakin · Svet Semov",
          role: "Amazon · Meta · Causara",
          href: "https://youtu.be/tneRWgZGWxM?si=jz3LUkMNOukAUAUj",
          image: "/english-network/causal-debate.webp",
        },
        {
          name: "Mike Develin",
          role: "Former Head of Instagram Analytics · Google",
          href: "https://youtu.be/3Nxxg2oX1mo",
          image: "/english-network/mike-develin.webp",
        },
        {
          name: "AI Analytics Panel",
          role: "DoorDash · Gen · Anthropic · OpenAI · Lyft",
          href: "https://www.superlinear.academy/c/public/sections/900178/lessons/3410175",
          image: "/english-network/ai-analytics.webp",
        },
        {
          name: "DoorDash · Pinterest · Amazon",
          role: "Company AI sessions",
          href: "https://corp-training.ai-builders.com",
          image: "/english-network/doordash-ai-training.webp",
        },
      ],
    },
    {
      label: "Capital & founder narratives",
      title: "People who read markets and company building",
      desc: "Investors, founders, and business storytellers who make technology legible as strategy.",
      items: [
        {
          name: "Mike Vernal",
          role: "Conviction · Sequoia · former Facebook VP",
          href: "https://www.youtube.com/watch?v=Ody9st7QDlU",
          image: "/english-network/mike-vernal.webp",
        },
        {
          name: "Dai Yusen",
          role: "Partner, ZhenFund",
          href: "/guests/dai-yusen",
          image: "https://img.youtube.com/vi/3t2I_BMG9gU/hqdefault.jpg",
        },
        {
          name: "Richard Liu",
          role: "Founder, Huma Finance",
          href: "/guests/richard-liu",
          image: "https://img.youtube.com/vi/G_tWnkZoSyc/hqdefault.jpg",
        },
        {
          name: "Indigo",
          role: "Weibo VP · AI investor",
          href: "/guests/indigo",
          image: "https://img.youtube.com/vi/myincnnSj8c/hqdefault.jpg",
        },
      ],
    },
    {
      label: "Practitioner media & creators",
      title: "People who shape how practitioners think",
      desc: "Technical writers, creators, and educators whose audiences are themselves builders.",
      items: [
        {
          name: "Acquired",
          role: "Ben Gilbert & David Rosenthal",
          href: "https://www.youtube.com/watch?v=sP9jqW41uoU",
          image: "/english-network/acquired.webp",
        },
        {
          name: "Gergely Orosz",
          role: "The Pragmatic Engineer",
          href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
          image: "/english-network/gergely-orosz.webp",
        },
        {
          name: "Zach Wilson",
          role: "Data engineering creator · founder",
          href: "https://www.youtube.com/watch?v=zWzLD4gWWGE",
          image: "/english-network/zach-wilson.webp",
        },
        {
          name: "Sundas Khalid",
          role: "Data science creator",
          href: "https://www.youtube.com/watch?v=XtGJhlSpzY4",
          image: "/english-network/creator-meetup.webp",
        },
      ],
    },
  ],
  zh: [
    {
      label: "AI 研究与基础设施",
      title: "靠近技术前沿的人",
      desc: "AI 研究员、基础设施创始人和系统建设者，他们直接塑造 AI 与数据系统的演进方向。",
      items: [
        {
          name: "贾扬清 Yangqing Jia",
          role: "PyTorch 共同创始人 · Lepton AI 创始人",
          href: "/guests/yangqing-jia",
          image: "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
        },
        {
          name: "毕书超 Shuchao Bi",
          role: "OpenAI Head of Post-Training · Multimodal",
          href: "/guests/shuchao-bi",
          image: "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
        },
        {
          name: "田渊栋 Yuandong Tian",
          role: "Meta AI / FAIR Research Scientist",
          href: "/guests/tian-yuandong",
          image: "https://img.youtube.com/vi/dymM40bVIhQ/hqdefault.jpg",
        },
        {
          name: "Reynold Xin",
          role: "Databricks 联合创始人",
          href: "/guests/reynold-xin",
          image: "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
        },
      ],
    },
    {
      label: "企业高管与产品领导者",
      title: "在大规模组织里做过事的人",
      desc: "他们的经验来自真实组织、真实产品和真实约束，离管理口号很远。",
      items: [
        {
          name: "光叔 光芒",
          role: "腾讯 GM · 虚环负责人 ·《黑神话：悟空》宣传策划者",
          href: "/guests/guang",
          image: "https://img.youtube.com/vi/apFYcIzJ1jY/hqdefault.jpg",
        },
        {
          name: "Ethan Evans",
          role: "Amazon 前 VP",
          href: "/guests/ethan-evans",
          image: "https://img.youtube.com/vi/RRSMjC_BF8Y/hqdefault.jpg",
        },
        {
          name: "Vijaye Raji",
          role: "Statsig 创始人 & CEO · OpenAI CTO of Applications",
          href: "/guests/vijaye-raji",
          image: "https://img.youtube.com/vi/iw2QYZeVlOQ/hqdefault.jpg",
        },
        {
          name: "Howie Xu",
          role: "Gen Digital Chief AI Officer",
          href: "/guests/howie-xu",
          image: "https://img.youtube.com/vi/awaZBWTss-4/hqdefault.jpg",
        },
      ],
    },
    {
      label: "产品、数据与增长负责人",
      title: "把判断变成产品的人",
      desc: "他们的工作跨越产品审美、数据系统、增长判断和组织执行。",
      items: [
        {
          name: "Ryo Lu",
          role: "Cursor Head of Design",
          href: "/guests/ryo-lu",
          image: "https://img.youtube.com/vi/BnL5qaBzmR0/hqdefault.jpg",
        },
        {
          name: "Howard Li",
          role: "Meta Data Science Director",
          href: "/guests/howard-li",
          image: "https://img.youtube.com/vi/ZiARi5uJpco/hqdefault.jpg",
        },
        {
          name: "Angelina Yang",
          role: "前 VP of Data · TwoSetAI 创始人",
          href: "/guests/angelina-yang",
          image: "https://img.youtube.com/vi/tJXIGeu6wXQ/hqdefault.jpg",
        },
        {
          name: "李梦颖 Mengying Li",
          role: "天使投资人 · 前 Notion / MotherDuck Growth DS",
          href: "/guests/mengying-li",
          image: "https://img.youtube.com/vi/NWe92tuQUTA/hqdefault.jpg",
        },
      ],
    },
    {
      label: "实验、数据与企业 AI 现场",
      title: "判断进入真实工作流的地方",
      desc: "实验、分析和企业现场，把 AI 与数据工作放回真实组织约束中检验。",
      items: [
        {
          name: "Chris Khawand · John Meakin · Svet Semov",
          role: "Amazon · Meta · Causara",
          href: "https://youtu.be/tneRWgZGWxM?si=jz3LUkMNOukAUAUj",
          image: "/english-network/causal-debate.webp",
        },
        {
          name: "Mike Develin",
          role: "前 Instagram Analytics 负责人 · Google",
          href: "https://youtu.be/3Nxxg2oX1mo",
          image: "/english-network/mike-develin.webp",
        },
        {
          name: "AI Analytics Panel",
          role: "DoorDash · Gen · Anthropic · OpenAI · Lyft",
          href: "https://www.superlinear.academy/c/public/sections/900178/lessons/3410175",
          image: "/english-network/ai-analytics.webp",
        },
        {
          name: "DoorDash · Pinterest · Amazon",
          role: "企业 AI 专场",
          href: "https://corp-training.ai-builders.com",
          image: "/english-network/doordash-ai-training.webp",
        },
      ],
    },
    {
      label: "资本与创始人叙事",
      title: "理解市场和公司建设的人",
      desc: "投资人、创始人和商业叙事者，让技术变化进入战略判断。",
      items: [
        {
          name: "Mike Vernal",
          role: "Conviction · Sequoia · Facebook 早期 VP",
          href: "https://www.youtube.com/watch?v=Ody9st7QDlU",
          image: "/english-network/mike-vernal.webp",
        },
        {
          name: "戴雨森",
          role: "真格基金合伙人",
          href: "/guests/dai-yusen",
          image: "https://img.youtube.com/vi/3t2I_BMG9gU/hqdefault.jpg",
        },
        {
          name: "刘友忠 Richard Liu",
          role: "Huma Finance Founder",
          href: "/guests/richard-liu",
          image: "https://img.youtube.com/vi/G_tWnkZoSyc/hqdefault.jpg",
        },
        {
          name: "Indigo",
          role: "微博 VP · AI 投资人",
          href: "/guests/indigo",
          image: "https://img.youtube.com/vi/myincnnSj8c/hqdefault.jpg",
        },
      ],
    },
    {
      label: "从业者媒体与创作者",
      title: "影响一线从业者如何思考的人",
      desc: "这些嘉宾不只是有头衔，也在持续影响工程师、数据人和 builders 的日常判断。",
      items: [
        {
          name: "Acquired",
          role: "Ben Gilbert & David Rosenthal · Acquired 主播",
          href: "https://www.youtube.com/watch?v=sP9jqW41uoU",
          image: "/english-network/acquired.webp",
        },
        {
          name: "Gergely Orosz",
          role: "The Pragmatic Engineer",
          href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
          image: "/english-network/gergely-orosz.webp",
        },
        {
          name: "Zach Wilson",
          role: "数据工程 Creator · Founder",
          href: "https://www.youtube.com/watch?v=zWzLD4gWWGE",
          image: "/english-network/zach-wilson.webp",
        },
        {
          name: "Sundas Khalid",
          role: "Data science creator",
          href: "https://www.youtube.com/watch?v=XtGJhlSpzY4",
          image: "/english-network/creator-meetup.webp",
        },
      ],
    },
  ],
};

const playlists = {
  en: [
    {
      name: "AI-era opportunities",
      count: 101,
      desc: "AI trends, AGI, and career impact",
      id: "PLO_DkCSmTKMNecQCgUHqTYtmwPWGUvDG_",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      name: "AI tools in practice",
      count: 16,
      desc: "Cursor, vibe coding, workflows",
      id: "PLO_DkCSmTKMPdBSW6bJH_KduR9-kzVTNF",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      name: "Job search & interviews",
      count: 28,
      desc: "Resumes, DS/PM/Eng interview playbooks",
      id: "PLO_DkCSmTKMN5IGvvtiNU9Q1MskoN_RHb",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: "Workplace skills",
      count: 90,
      desc: "Promotions, presenting up, soft skills",
      id: "PLO_DkCSmTKMPS6P2dKYHRethlKqmIQw0h",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Big Tech, up close",
      count: 57,
      desc: "FAANG internals, VP tracks, layoffs",
      id: "PLO_DkCSmTKMMws_nKzRMsIx5nvP5Hl68R",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      name: "Founders & startups",
      count: 115,
      desc: "Founder interviews, fundraising, product growth",
      id: "PLO_DkCSmTKMOPSv4YWDKC7-gr88CyHf_3",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      name: "Wealth & investing",
      count: 41,
      desc: "Financial freedom, strategy, personal finance",
      id: "PLO_DkCSmTKMPrqKZDSrq9scXhcyrcib8E",
      icon: <Landmark className="h-5 w-5" />,
    },
    {
      name: "Thinking & decisions",
      count: 130,
      desc: "Mental models, judgment, decision quality",
      id: "PLO_DkCSmTKMOCP4X8YxHQf5ZZdh0JpgIn",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      name: "Life design",
      count: 120,
      desc: "Big choices, meaning, and living coherently",
      id: "PLO_DkCSmTKMMCWo7yeAyHVKzvy4fTXlju",
      icon: <Compass className="h-5 w-5" />,
    },
    {
      name: "Data science",
      count: 43,
      desc: "DS/ML, A/B testing, analytics",
      id: "PLO_DkCSmTKMPBTVU2zy8JH-I6e6L8lx-l",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "Life in the US",
      count: 43,
      desc: "Culture notes, dating, staying vs. going home",
      id: "PLO_DkCSmTKMNDn0jfOu8pB0mPxqCsr4lU",
      icon: <MapPin className="h-5 w-5" />,
    },
  ],
  zh: [
    {
      name: "AI时代机会",
      count: 101,
      desc: "AI趋势、AGI与职业冲击",
      id: "PLO_DkCSmTKMNecQCgUHqTYtmwPWGUvDG_",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      name: "AI工具实战",
      count: 16,
      desc: "Cursor、Vibe Coding、工作流",
      id: "PLO_DkCSmTKMPdBSW6bJH_KduR9-kzVTNF",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      name: "求职与面试",
      count: 28,
      desc: "简历、DS/PM/Eng面试全攻略",
      id: "PLO_DkCSmTKMN5IGvvtiNU9Q1MskoN_RHb",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: "职场技能",
      count: 90,
      desc: "升职加薪、汇报、情绪价值",
      id: "PLO_DkCSmTKMPS6P2dKYHRethlKqmIQw0h",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "大厂观察",
      count: 57,
      desc: "FAANG内幕、VP路径、裁员",
      id: "PLO_DkCSmTKMMws_nKzRMsIx5nvP5Hl68R",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      name: "创业实战",
      count: 115,
      desc: "创始人访谈、融资、产品增长",
      id: "PLO_DkCSmTKMOPSv4YWDKC7-gr88CyHf_3",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      name: "财富与投资",
      count: 41,
      desc: "财富自由、投资策略、理财",
      id: "PLO_DkCSmTKMPrqKZDSrq9scXhcyrcib8E",
      icon: <Landmark className="h-5 w-5" />,
    },
    {
      name: "思维与决策",
      count: 130,
      desc: "思维模型、判断力、决策质量",
      id: "PLO_DkCSmTKMOCP4X8YxHQf5ZZdh0JpgIn",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      name: "人生设计",
      count: 120,
      desc: "重大选择、意义感、自洽",
      id: "PLO_DkCSmTKMMCWo7yeAyHVKzvy4fTXlju",
      icon: <Compass className="h-5 w-5" />,
    },
    {
      name: "数据科学",
      count: 43,
      desc: "DS/ML技术、AB实验、数据分析",
      id: "PLO_DkCSmTKMPBTVU2zy8JH-I6e6L8lx-l",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "美国生活",
      count: 43,
      desc: "文化观察、约会、回国vs留美",
      id: "PLO_DkCSmTKMNDn0jfOu8pB0mPxqCsr4lU",
      icon: <MapPin className="h-5 w-5" />,
    },
  ],
};

const testimonials = {
  en: [
    {
      quote:
        "Regardless of your background — technical or not — and wherever you are in your AI journey, this course is incredibly valuable. It teaches you how to think about building with AI. I've noticed a real shift in how I approach my work and everyday problems — like putting on a new pair of glasses. It gave me a solid foundation and, more importantly, the confidence and motivation to keep exploring on my own.",
      name: "Julia",
      role: "Strategy Ops Manager",
      company: "TikTok",
      avatar: "/avatars/julia.png",
      initials: "J",
    },
    {
      quote:
        "The content and teaching are both excellent and engaging. It covers the fundamentals along with the cutting edge — agents and the latest products — with a great balance of theory and practice. Even though I use AI tools every day, I still came away with a deeper understanding and a much more effective way to build with AI. The instructor is also remarkably thoughtful and responsive.",
      name: "Chairy",
      role: "UX Manager",
      company: "Google",
      avatar: "/avatars/chairy.png",
      initials: "C",
    },
    {
      quote:
        "There are plenty of courses that teach specific techniques. This one builds the mental model that makes you a more effective self-learner.",
      name: "Shuyang",
      role: "Senior Applied Science Manager",
      company: "Uber",
      avatar: "/avatars/shuyang.jpg",
      initials: "S",
    },
  ],
  zh: [
    {
      quote:
        "无论你的背景如何（技术或非技术），无论你在 AI 学习旅程的哪个阶段，这门课都极具价值——它教的是如何思考用 AI 来构建系统的框架。我注意到自己在工作和日常生活中的思维方式发生了转变，就像用一副全新的视角看世界。这门课给了我一个坚实的起点，让我有信心也有动力继续自主探索。",
      name: "Julia",
      role: "Strategy Ops Manager",
      company: "TikTok",
      avatar: "/avatars/julia.png",
      initials: "J",
    },
    {
      quote:
        "课程内容和教学都非常出色、很吸引人。涵盖了基础知识和最新前沿话题（如 Agent 和行业最新产品），理论与实践的平衡做得很好。尽管每天都在使用 AI 工具，我仍然学到了更深层次的东西，能更有效地利用 AI 来构建解决方案。讲师对问题的回应也非常及时，很受启发。",
      name: "Chairy",
      role: "UX Manager",
      company: "Google",
      avatar: "/avatars/chairy.png",
      initials: "C",
    },
    {
      quote:
        "市面上有很多课程教你具体的技巧，但这门课帮你建立正确的思维方式，让你能更高效地自我学习。",
      name: "Shuyang",
      role: "Senior Applied Science Manager",
      company: "Uber",
      avatar: "/avatars/shuyang.jpg",
      initials: "S",
    },
  ],
};

export default function Home() {
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGuestGroups, setExpandedGuestGroups] = useState<
    Record<number, boolean>
  >({});

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const nav = pick(lang, {
    en: {
      about: "Snapshot",
      background: "Path",
      beliefs: "Beliefs",
      record: "On record",
      work: "Work",
      proof: "Proof",
      guests: "Guests",
      content: "Explore",
      book: "Books",
      newBook: "Books",
      collab: "Collaborate",
      joinCommunity: "Join Community",
      joinArrow: "Join community →",
    },
    zh: {
      about: "速写",
      background: "路径",
      beliefs: "主张",
      record: "判断",
      work: "作品",
      proof: "证据",
      guests: "嘉宾",
      content: "深入",
      book: "书",
      newBook: "两本书",
      collab: "合作",
      joinCommunity: "加入社群",
      joinArrow: "加入社群 →",
    },
  });

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,191,36,0.055)_0%,rgba(11,15,26,0)_18rem)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-amber-300/25" />

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-left"
            >
              <div className="text-lg font-semibold tracking-wide text-amber-300">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
              </div>
              <div className="text-xs text-zinc-400">
                {lang === "en" ? "课代表立正" : "Yuzheng Sun"}
              </div>
            </button>

            <div className="hidden items-center gap-6 lg:flex">
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.about}
              </button>
              <button
                onClick={() => scrollToSection("background")}
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.background}
              </button>
              <button
                onClick={() => scrollToSection("beliefs")}
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.beliefs}
              </button>
              <button
                onClick={() => scrollToSection("record")}
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.record}
              </button>
              <button
                onClick={() => scrollToSection("work")}
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.work}
              </button>
              <button
                onClick={() => scrollToSection("proof")}
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.proof}
              </button>
              <Link
                href="/guests"
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.guests}
              </Link>
              <button
                onClick={() => scrollToSection("playlists")}
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.content}
              </button>
              <Link
                href="/book"
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.book}
              </Link>
              <Link
                href="/collab"
                className="text-sm text-zinc-300 transition hover:text-amber-300"
              >
                {nav.collab}
              </Link>
              <LanguageToggle size="sm" />
              <Button
                asChild
                className="bg-amber-400 text-[#211300] hover:bg-amber-300"
              >
                <a
                  href="https://www.superlinear.academy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {nav.joinCommunity}
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-3 lg:hidden">
              <LanguageToggle size="sm" />
              <button
                className="rounded-md p-1 text-zinc-300 transition hover:text-amber-300"
                onClick={() => setMobileMenuOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 lg:hidden">
              <button
                onClick={() => scrollToSection("about")}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.about}
              </button>
              <button
                onClick={() => scrollToSection("background")}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.background}
              </button>
              <button
                onClick={() => scrollToSection("beliefs")}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.beliefs}
              </button>
              <button
                onClick={() => scrollToSection("record")}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.record}
              </button>
              <button
                onClick={() => scrollToSection("work")}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.work}
              </button>
              <button
                onClick={() => scrollToSection("proof")}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.proof}
              </button>
              <Link
                href="/guests"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.guests}
              </Link>
              <button
                onClick={() => scrollToSection("playlists")}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.content}
              </button>
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.newBook}
              </Link>
              <Link
                href="/collab"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-300 transition hover:text-amber-300"
              >
                {nav.collab}
              </Link>
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-amber-300 transition hover:text-amber-200"
              >
                {nav.joinArrow}
              </a>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        <section
          id="hero"
          className="container scroll-mt-24 py-16 md:py-24 lg:py-28"
        >
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 border-l border-white/20 pl-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                <span>{lang === "en" ? "Yuzheng Sun" : "Yuzheng Sun"}</span>
                <span className="text-zinc-600">/</span>
                <span>{lang === "en" ? "课代表立正" : "课代表立正"}</span>
              </div>

              <h1
                className={cn(
                  "max-w-4xl text-[2rem] font-semibold leading-[1.13] text-white [text-wrap:pretty] md:text-[3.1rem] md:leading-[1.08] lg:text-[3.5rem]",
                  lang === "zh" && "[line-break:strict]"
                )}
              >
                {lang === "en" ? (
                  <>
                    <span className="block [text-wrap:balance]">
                      When execution gets cheaper,
                    </span>
                    <span className="mt-3 block text-zinc-200 [text-wrap:balance]">
                      judgment becomes more expensive.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">当执行越来越便宜，</span>
                    <span className="mt-3 block text-zinc-200">
                      判断会越来越贵。
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl md:leading-9">
                {lang === "en"
                  ? "I work across AI education, company training, and long-form conversations with builders and executives. The common thread is structure: finding where a problem is really stuck, then turning that judgment into output."
                  : "我是孙煜征，课代表立正。我做 AI 教育、企业培训和科技访谈。它们共享同一件事：看清问题卡在哪里，再把判断变成课程、产品、组织方法和真实产出。"}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  lang === "en" ? "Cornell Economics PhD" : "康奈尔经济学博士",
                  lang === "en"
                    ? "Amazon / Meta / Tencent IEG"
                    : "Amazon / Meta / 腾讯 IEG",
                  lang === "en"
                    ? "Statsig, acquired by OpenAI"
                    : "Statsig，被 OpenAI 收购",
                  lang === "en"
                    ? "Founder, Superlinear Academy"
                    : "Superlinear Academy 创始人",
                ].map(item => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] font-normal text-zinc-200"
                  >
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-amber-400 text-[#211300] hover:bg-amber-300"
                  onClick={() => scrollToSection("background")}
                >
                  {lang === "en" ? "Follow the throughline" : "看我的路径"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                  onClick={() => scrollToSection("work")}
                >
                  {lang === "en" ? "See the work" : "看我做的事"}
                </Button>
              </div>

              <div className="mt-8 flex gap-4">
                <a
                  href="https://www.youtube.com/@kedaibiao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 transition hover:text-amber-300"
                  aria-label="YouTube"
                >
                  <Youtube className="h-6 w-6" />
                </a>
                <a
                  href="https://space.bilibili.com/491306902"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 transition hover:text-amber-300"
                  aria-label="Bilibili"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/yuzhengsun/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 transition hover:text-amber-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
                <a
                  href="https://yuzheng.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 transition hover:text-amber-300"
                  aria-label="Substack"
                >
                  <Rss className="h-6 w-6" />
                </a>
                <a
                  href="mailto:yz@superlinear.academy"
                  className="text-zinc-400 transition hover:text-amber-300"
                  aria-label="Email"
                >
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03]">
                <img
                  src="/profile.jpg"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun speaking with the founders of Acquired"
                      : "孙煜征与 Acquired Podcast 两位创始人对谈"
                  }
                  className="aspect-[1.02] w-full object-cover"
                  width={1200}
                  height={1200}
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4">
                {[
                  {
                    value: "300K+",
                    label: lang === "en" ? "content audience" : "内容受众",
                  },
                  {
                    value: "3,000+",
                    label: lang === "en" ? "paying students" : "付费学员",
                  },
                  {
                    value: "200+",
                    label:
                      lang === "en" ? "leader conversations" : "科技领袖对话",
                  },
                  {
                    value: "4.9/5",
                    label: lang === "en" ? "course rating" : "课程评分",
                  },
                ].map(item => (
                  <div key={item.label} className="flex items-baseline gap-1.5">
                    <span className="font-mono text-sm text-zinc-300">
                      {item.value}
                    </span>
                    <span className="text-xs text-zinc-500">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-l border-white/15 pl-4">
                <p className="text-sm leading-6 text-zinc-300">
                  {lang === "en"
                    ? "Current question: building production relationships and workflows native to the AI era."
                    : "当前问题：构建适配AI的全新生产关系和工作流程"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="container scroll-mt-24 py-8 md:py-12">
          <div className="grid gap-8 border-y border-white/10 py-8 md:grid-cols-[0.9fr_1.1fr] md:py-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                {lang === "en" ? "In one line" : "一句话"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                {lang === "en"
                  ? "My work connects decision science, growth, AI, and organizational practice."
                  : "我的工作把决策、增长、AI 和组织实践放在同一个问题里。"}
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-zinc-300">
              <p>
                {lang === "en"
                  ? "The visible forms are courses, interviews, books, company sessions, and a community. The underlying practice is consistent: read the structure, locate the constraint, and bring feedback closer to the work."
                  : "外在形式有课程、访谈、书、企业培训和社群。背后是一条稳定的工作方式：看结构，找约束，把反馈尽快接回行动。"}
              </p>
              <p>
                {lang === "en"
                  ? "That is why growth and A/B testing matter so much to me. They are disciplined ways to ask reality for feedback before a story gets too comfortable."
                  : "所以增长和 A/B testing 对我很重要。它们能在故事变得太顺之前，逼我们先向现实要反馈。"}
              </p>
            </div>
          </div>
        </section>

        <section
          id="background"
          className="scroll-mt-24 border-y border-white/10 bg-black/20 py-14 md:py-20"
        >
          <div className="container">
            <div className="mb-10 max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                {lang === "en" ? "The throughline" : "一条主线"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
                {lang === "en"
                  ? "The path that shaped my work"
                  : "这些经历如何塑造我的工作"}
              </h2>
            </div>

            <div className="relative">
              <div className="absolute bottom-0 left-[1.05rem] top-2 hidden w-px bg-white/10 md:block" />
              <div className="grid gap-4">
                {throughline[lang].map((item, index) => (
                  <div
                    key={item.era}
                    className="relative grid gap-4 rounded-xl border border-white/0 py-2 transition md:grid-cols-[12rem_1fr]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0B0F1A] font-mono text-[11px] text-zinc-400">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="pt-0.5">
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400">
                          {item.era}
                        </p>
                        <p className="mt-1 text-sm font-medium leading-5 text-zinc-300">
                          {item.role}
                        </p>
                      </div>
                    </div>
                    <div className="border-b border-white/10 pb-5 md:pl-3">
                      <h3 className="text-xl font-semibold leading-7 text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="beliefs" className="container scroll-mt-24 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                {lang === "en" ? "Axioms I return to" : "我反复回到的主张"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
                {lang === "en"
                  ? "The ideas behind the work"
                  : "这些事情背后的想法"}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">
                {lang === "en"
                  ? "A résumé lists the sequence. These are the beliefs my writing, teaching, and company work keep returning to."
                  : "履历讲的是经历的先后；这里是我在写作、教学和公司项目里反复回到的判断。"}
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {principles[lang].map((item, index) => (
                <div
                  key={item.title}
                  className="grid gap-4 py-6 sm:grid-cols-[4rem_1fr]"
                >
                  <div className="font-mono text-sm text-zinc-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                      {item.detail}
                    </p>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition hover:text-amber-300"
                    >
                      <span>{item.linkLabel}</span>
                      <ExternalLink className="h-3 w-3 transition group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="record"
          className="container scroll-mt-24 py-14 md:py-20"
        >
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {lang === "en" ? "Judgment, on the record" : "判断留档"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
              {lang === "en"
                ? "Called early, dated, checkable"
                : "带日期的公开判断，随时可对账"}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              {lang === "en"
                ? "Since 2023 I have published my calls with dates attached — the reasoning, the specific numbers, and the deadlines that make them checkable."
                : "从 2023 年起，我把对 AI 的判断带着日期公开写下来、讲出来——有推理、有具体数字、有可以对账的时限。"}
            </p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {predictions[lang].map((item) => (
              <div
                key={item.date}
                className="grid gap-4 py-6 md:grid-cols-[7rem_1fr]"
              >
                <div className="font-mono text-sm text-amber-300/90">
                  {item.date}
                </div>
                <div>
                  <h3 className="text-xl font-semibold leading-7 text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">
                    {item.detail}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-5">
                    {item.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition hover:text-amber-300"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="h-3 w-3 transition group-hover:translate-x-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="work"
          className="scroll-mt-24 border-y border-white/10 bg-black/20 py-14 md:py-20"
        >
          <div className="container">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                  {lang === "en" ? "Where it becomes practice" : "主张落到哪里"}
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
                  {lang === "en"
                    ? "Courses, company work, community, and the tools around them"
                    : "课程、企业项目、社群，以及围绕它们生长出来的工具"}
                </h2>
              </div>
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-2 text-sm text-amber-300 transition hover:text-amber-200"
              >
                {lang === "en" ? "Enter Superlinear" : "进入 Superlinear"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {practicePaths[lang].map(item => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid gap-5 py-7 transition md:grid-cols-[13rem_1fr_12rem] md:items-start"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition group-hover:text-amber-300">
                    {item.icon}
                    {item.label}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                      {item.detail}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                      {item.proof}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-300 md:justify-end">
                    {item.cta}
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0B0F1A] text-zinc-300">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {lang === "en"
                    ? "Superlinear Academy is also on iOS and Android."
                    : "Superlinear Academy 已经上线 iOS 和 Android。"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {lang === "en"
                    ? "Daily discussions, course notes, and curated AI resources stay close to the work."
                    : "每日讨论、课程速览和 AI 资源整理，都跟真实工作保持在同一个节奏里。"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                  asChild
                >
                  <a
                    href="https://apps.apple.com/us/app/superlinear-academy/id6760123187"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Apple className="mr-2 h-4 w-4" />
                    App Store
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                  asChild
                >
                  <a
                    href="https://play.google.com/store/apps/details?id=academy.superlinear.www"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    Google Play
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="container scroll-mt-24 py-14 md:py-20">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {lang === "en"
                ? "Two perspectives from people close to the work"
                : "来自一线的两种视角"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
              {lang === "en"
                ? "How senior peers and students see it"
                : "行业前辈与学员，怎么看这件事"}
            </h2>
          </div>

          <div className="mb-4 flex items-end gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                {lang === "en" ? "01 / Industry insight" : "01 / 行业洞见"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {lang === "en"
                  ? "Senior peers and collaborators"
                  : "行业前辈与合作方"}
              </h3>
            </div>
            <div className="mb-2 h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-[1fr_auto]">
            {endorsements[lang].map(item => (
              <Card
                key={item.name}
                className="relative flex h-full flex-col overflow-hidden border-white/10 bg-white/[0.04] transition-colors hover:border-amber-300/40 lg:grid lg:grid-rows-subgrid lg:row-span-2"
              >
                <CardContent className="flex h-full flex-col pt-7 pb-6 lg:grid lg:grid-rows-subgrid lg:row-span-2">
                  <p className="flex-1 pb-4 text-base leading-8 text-zinc-200">
                    "{item.quote}"
                  </p>
                  <div className="flex items-start gap-3 border-t border-white/10 pt-4">
                    <Avatar className="mt-0.5 h-10 w-10 shrink-0 border border-white/20">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback className="bg-amber-400/20 text-xs font-bold text-amber-300">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="mt-0.5 text-sm text-zinc-300">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 mb-4 flex items-end gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                {lang === "en" ? "02 / Course reviews" : "02 / 学员反馈"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {lang === "en"
                  ? "Students who took the course"
                  : "真正上过课的学员"}
              </h3>
            </div>
            <div className="mb-2 h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials[lang].map(item => (
              <Card key={item.name} className="border-white/10 bg-white/[0.04]">
                <CardContent className="flex h-full flex-col py-6">
                  <p className="flex-1 pb-4 text-sm leading-7 text-zinc-300">
                    "{item.quote}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                    <Avatar className="h-10 w-10 shrink-0 border border-white/20">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback className="bg-amber-400/20 text-xs font-bold text-amber-300">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-xs text-zinc-400">
                        {item.role} ·{" "}
                        <span className="text-zinc-300">{item.company}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            {lang === "en" ? (
              <>
                Course reviews are public on{" "}
                <a
                  href="https://maven.com/superlinear/aibuilders#reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition hover:text-amber-300"
                >
                  Maven
                </a>
                .
              </>
            ) : (
              <>
                课程评价公开来自{" "}
                <a
                  href="https://maven.com/superlinear/aibuilders#reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition hover:text-amber-300"
                >
                  Maven 平台
                </a>
                。
              </>
            )}
          </p>
        </section>

        <section
          id="guests"
          className="scroll-mt-24 border-y border-white/10 bg-black/20 py-14 md:py-20"
        >
          <div className="container">
            <div className="mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white md:text-5xl">
                  {lang === "en"
                    ? "Rooms that keep updating the model"
                    : "这些现场持续更新我的判断"}
                </h2>
                <p className="mt-3 max-w-2xl text-zinc-300">
                  {lang === "en"
                    ? "The best conversations connect research, operators, capital, data, and creator-led communities back into the same learning loop."
                    : "好的对话会把研究、企业、资本、数据和创作者社群，重新接回同一个学习循环。"}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10">
              <div className="mb-8 max-w-3xl">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  {lang === "en" ? "Conversation map" : "嘉宾地图"}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                  {lang === "en"
                    ? "Different circles, one way of learning"
                    : "不同圈层，同一种学习方式"}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {lang === "en"
                    ? "Some are Chinese-language interviews, some are English panels, and some are company rooms. I group them by the kind of judgment they bring into the work."
                    : "这里有中文深访、英文 panel，也有企业内部现场。我按嘉宾带来的判断类型组织它们。"}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {guestCategories[lang].map((category, categoryIndex) => {
                  const isExpanded = !!expandedGuestGroups[categoryIndex];
                  const visibleItems = isExpanded
                    ? category.items
                    : category.items.slice(0, 2);
                  return (
                    <article
                      key={category.label}
                      className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4 md:p-5"
                    >
                      <div className="flex-1 pb-3">
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                          {category.label}
                        </p>
                        <h4 className="mt-3 text-lg font-semibold leading-6 text-white">
                          {category.title}
                        </h4>
                        <p className="mt-2 text-xs leading-6 text-zinc-400">
                          {category.desc}
                        </p>
                      </div>
                      <div className="space-y-2 border-t border-white/10 pt-3">
                        {visibleItems.map(item => (
                          <a
                            key={`${category.label}-${item.name}`}
                            href={item.href}
                            target={
                              item.href.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              item.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="group flex gap-3 rounded-lg border border-white/0 p-2.5 transition hover:border-white/10 hover:bg-white/[0.04]"
                          >
                            {"image" in item && item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                className="h-16 w-24 shrink-0 rounded-md border border-white/10 object-cover opacity-85 transition group-hover:opacity-100"
                                loading="lazy"
                                width={192}
                                height={128}
                              />
                            ) : (
                              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                                {item.name.slice(0, 2)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold leading-5 text-white">
                                  {item.name}
                                </p>
                                {item.href.startsWith("http") ? (
                                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600 transition group-hover:text-amber-300" />
                                ) : (
                                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600 transition group-hover:text-amber-300" />
                                )}
                              </div>
                              <p className="mt-0.5 text-xs leading-5 text-zinc-400">
                                {item.role}
                              </p>
                            </div>
                          </a>
                        ))}
                        {category.items.length > 2 && (
                          <button
                            onClick={() =>
                              setExpandedGuestGroups(prev => ({
                                ...prev,
                                [categoryIndex]: !prev[categoryIndex],
                              }))
                            }
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg p-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition hover:bg-white/[0.04] hover:text-amber-300"
                          >
                            {isExpanded
                              ? lang === "en"
                                ? "Show less"
                                : "收起"
                              : lang === "en"
                                ? `Show all ${category.items.length}`
                                : `展开全部 ${category.items.length} 条`}
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-8 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-5 md:flex md:items-center md:justify-between md:gap-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                    {lang === "en" ? "Full guest index" : "完整嘉宾索引"}
                  </p>
                  <h4 className="mt-2 text-xl font-semibold text-white">
                    {lang === "en"
                      ? "Browse every conversation by guest."
                      : "按嘉宾查看所有对话。"}
                  </h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    {lang === "en"
                      ? "This map is only the front door. The full guest page keeps the longer archive searchable and easier to scan."
                      : "这里是入口地图；完整嘉宾页保留更大的访谈档案，方便继续按人名和背景浏览。"}
                  </p>
                </div>
                <Button
                  asChild
                  className="mt-5 w-full bg-amber-400 text-[#211300] hover:bg-amber-300 md:mt-0 md:w-auto"
                >
                  <Link href="/guests">
                    {lang === "en"
                      ? "See all 128 guests"
                      : "查看全部 128 位嘉宾"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="playlists"
          className="container scroll-mt-24 py-14 md:py-20"
        >
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-5xl">
                {lang === "en" ? "Explore by topic" : "按话题探索"}
              </h2>
              <p className="mt-3 text-zinc-300">
                {lang === "en"
                  ? "700+ videos, organized by theme — jump straight to what you care about."
                  : "700+ 期内容，按主题分类，直达你关心的方向"}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="shrink-0 border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
            >
              <a
                href="https://www.youtube.com/@kedaibiao"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="mr-2 h-4 w-4" />
                {lang === "en" ? "All videos" : "全部视频"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="grid border-t border-white/10 md:grid-cols-2 md:gap-x-10">
            {playlists[lang].map(pl => (
              <a
                key={pl.id}
                href={`https://www.youtube.com/playlist?list=${pl.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border-b border-white/[0.07] py-4 transition hover:border-white/15"
              >
                <div className="shrink-0 text-zinc-600 transition group-hover:text-amber-300">
                  {pl.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="truncate font-medium text-zinc-100 transition group-hover:text-white">
                      {pl.name}
                    </h3>
                    <span className="shrink-0 font-mono text-xs text-zinc-400">
                      {lang === "en" ? `${pl.count} eps` : `${pl.count} 期`}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs leading-5 text-zinc-400">
                    {pl.desc}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-700 transition group-hover:text-amber-300" />
              </a>
            ))}
          </div>
        </section>

        <section className="container py-12 pb-16 md:pb-24">
          <div className="grid gap-6 border-y border-white/10 py-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                {lang === "en" ? "Stay close to the work" : "继续靠近这些工作"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                {lang === "en"
                  ? "Superlinear Academy is where these ideas keep getting tested."
                  : "Superlinear Academy 是这些想法持续接受检验的地方。"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                {lang === "en"
                  ? "The public homepage is the map. The community is the workshop: daily discussions, resources, cohorts, and people building in public."
                  : "个人主页是一张地图；社群更像工作坊：每日讨论、资源整理、cohort，以及一群正在公开构建的人。"}
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-amber-400 text-[#211300] hover:bg-amber-300 md:w-auto"
            >
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {lang === "en" ? "Join the community" : "加入社群"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 py-12">
        <div className="container grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-white">
              {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
            </h3>
            <p className="mt-3 text-sm text-zinc-400">
              {lang === "en"
                ? "Helping more people become effective builders in the AI era."
                : "帮助更多人在 AI 时代成为真正能构建的人。"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {lang === "en" ? "Links" : "链接"}
            </h3>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <a
                href="https://ai-builders.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-amber-300"
              >
                {lang === "en" ? "AI Builders course" : "AI Builders 课程"}
              </a>
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-amber-300"
              >
                Superlinear Academy
              </a>
              <a
                href="https://www.youtube.com/@kedaibiao"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-amber-300"
              >
                {lang === "en" ? "YouTube channel" : "YouTube 频道"}
              </a>
              <a
                href="https://space.bilibili.com/491306902"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-amber-300"
              >
                {lang === "en" ? "Bilibili channel" : "B站频道"}
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {lang === "en" ? "Contact" : "联系方式"}
            </h3>
            <p className="mt-3 text-sm text-zinc-400">yz@superlinear.academy</p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://www.youtube.com/@kedaibiao"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition hover:text-amber-300"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/yuzhengsun/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition hover:text-amber-300"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:yz@superlinear.academy"
                className="text-zinc-400 transition hover:text-amber-300"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="container mt-8 border-t border-white/10 pt-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Yuzheng Sun. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
