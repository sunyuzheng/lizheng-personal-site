import LanguageToggle from "@/components/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Github,
  Handshake,
  Linkedin,
  Mail,
  Menu,
  Rss,
  ShoppingBag,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { HOME_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildHomeStructuredData } from "@shared/structured-data";

const brandLayers = {
  en: [
    {
      number: "01",
      title: "Build capability that remains yours.",
      label: "REAL CAPABILITY",
      detail:
        "Strip away the credential, title, company, and fashionable tool. What can you still see, decide, and make happen?",
    },
    {
      number: "02",
      title: "Make something reality can answer.",
      label: "REAL WORK",
      detail:
        "Strip away the manager, presentation, and internal scorecard. Does anyone still need it—and can they use, reject, or improve it?",
    },
    {
      number: "03",
      title: "Make what lasts.",
      label: "THE HORIZON",
      detail:
        "Then ask one question further: after the first release, does the work keep creating value—and keep carrying the maker's judgment?",
    },
  ],
  zh: [
    {
      number: "01",
      title: "学点真本事。",
      label: "能力",
      detail:
        "拿掉学历、title、公司和眼下最热的工具，什么判断和手艺还真正属于你？",
    },
    {
      number: "02",
      title: "做点真东西。",
      label: "现实",
      detail:
        "拿掉老板、汇报和内部评分，做出来的东西还有没有人需要，能不能被使用、拒绝和改进？",
    },
    {
      number: "03",
      title: "MAKE WHAT LASTS.",
      label: "时间",
      detail:
        "再往前一步：第一次发布以后，它还会不会继续创造价值；人们还能不能从中看见做出它的人的判断？",
    },
  ],
};

const recentWriting = {
  en: [
    {
      label: "WORK & ORGANIZATIONS",
      title: "How to identify and eliminate fake work",
      detail:
        "Knowledge work is hard to measure and outcomes are hard to attribute. Visible activity can therefore become a substitute for value. Does AI move people closer to results—or simply manufacture more evidence of progress?",
      href: "https://www.superlinear.academy/c/ai-resources/fake-work",
      cta: "Read the essay",
    },
    {
      label: "AI-NATIVE TALENT",
      title: "What actually makes someone AI native?",
      detail:
        "AI-native talent starts with the outcome: see which costs and capabilities AI changed, redesign the work, and remain responsible for the result.",
      href: "https://www.superlinear.academy/c/ai-resources/ai-native",
      cta: "Read the essay",
    },
    {
      label: "NOUNS & VERBS",
      title: "Everyone learns the nouns. The verbs set people apart.",
      detail:
        "LangChain, RAG, and fine-tuning come with names, docs, and clean checkpoints. Real projects depend on verbs: decompose, judge, route, diagnose, and iterate. Nouns give you parts; verbs give you the ability to assemble them.",
      href: "https://www.superlinear.academy/c/ai-resources/verb",
      cta: "Read the essay in Chinese",
    },
  ],
  zh: [
    {
      label: "工作与组织",
      title: "如何识别与消灭fake work",
      detail:
        "知识工作的价值难衡量，结果也难归因，于是可见动作很容易代替价值。AI究竟在缩短人与结果的距离，还是只会更快地生产“正在推进”的证据？",
      href: "https://www.superlinear.academy/c/ai-resources/fake-work",
      cta: "读文章",
    },
    {
      label: "AI NATIVE人才",
      title: "到底什么才算AI Native人才？",
      detail:
        "AI Native人才从结果出发：看清AI改写了哪些成本与能力，重新设计工作，并继续对结果负责。",
      href: "https://www.superlinear.academy/c/ai-resources/ai-native",
      cta: "读文章",
    },
    {
      label: "名词与动词",
      title: "为什么所有人都在学名词，但真正拉开差距的是动词",
      detail:
        "LangChain、RAG和fine-tune都有清楚的名字、边界与教程；真实项目却更依赖分解、判断、路由、诊断和迭代。名词给你零件，动词给你组装能力。",
      href: "https://www.superlinear.academy/c/ai-resources/verb",
      cta: "读文章",
    },
  ],
};

const careerChapters = {
  en: [
    {
      marker: "CORNELL · AMAZON · META",
      title: "See the structure beneath the visible result.",
      detail:
        "Economics trained me to ask about causes, choices, incentives, and constraints. Building products forced those explanations to face a harder test: did they change real decisions for real users?",
    },
    {
      marker: "TENCENT · 30-PERSON DATA & AI TEAM",
      title: "Turn judgment into organizational results.",
      detail:
        "Leading a team taught me that one person seeing clearly was not enough. Priorities, incentives, standards, and ownership had to hold together before a judgment became something a team could actually deliver.",
    },
    {
      marker: "2022 · STATSIG",
      title: "Move closer to the consequence.",
      detail:
        "After leading Tencent's 30-person Data & AI team and repeatedly earning its highest performance rating, I left a clear management path, returned to the U.S., and joined an early startup as an individual contributor—closer to customers, experiments, and consequences.",
    },
    {
      marker: "SUPERLINEAR · FULL TIME",
      title: "Devote my best years to work of my own.",
      detail:
        "I eventually left my job to build Superlinear full time. Courses, community, books, tools, and public work now have to answer the question that titles and performance reviews cannot: do people use them, choose them again, and become able to do something they could not do before?",
    },
  ],
  zh: [
    {
      marker: "康奈尔 · AMAZON · META",
      title: "看见结果背后的结构。",
      detail:
        "经济学训练我追问因果、选择、激励与约束；做产品又逼我面对一个更硬的问题：这些解释，最后有没有改变真实用户的选择？",
    },
    {
      marker: "腾讯 · 30人数据与AI团队",
      title: "让判断变成组织里的结果。",
      detail:
        "带团队让我明白，一个人想清楚远远不够。优先级、激励、标准与责任必须彼此咬合，一个判断才会变成团队真正做出来的结果。",
    },
    {
      marker: "2022年 · STATSIG",
      title: "离结果再近一点。",
      detail:
        "在腾讯带领30人数据与AI团队、连续获得最高绩效以后，我离开清晰的管理晋升路径，回美国加入早期创业公司，从IC重新开始，让自己的判断离客户、实验和后果更近。",
    },
    {
      marker: "SUPERLINEAR · 全职投入",
      title: "把最好的时间，押在自己的长期作品上。",
      detail:
        "后来我辞掉工作，全职做Superlinear。课程、社区、书、工具和公开内容，都要回答学历、title和绩效无法替我回答的问题：有没有人用，会不会再来，又让人多做成了什么？",
    },
  ],
};

const featuredJudgment = {
  en: {
    title:
      "In 2021, I explained why the previous AI paradigm had a ceiling. In February 2023, before GPT-4, I argued that ChatGPT was breaking it.",
    detail:
      "Two videos in 2021 traced the limit to the mechanism: systems learned mappings from labeled data and worked well in narrow settings, but lacked general understanding. ChatGPT's instruction following, in-context learning, and signs of reasoning forced me to revise that view. I then projected cheaper inference, tool use, persistent memory, direct result delivery, and ChatGPT-native systems. The original probabilities remain on the page, along with two major mistakes added later.",
    cta: "Read the original argument and later review",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
    timeline: [
      {
        date: "APRIL 2021",
        label: "Explain why the previous AI paradigm could not generalize",
        links: [
          {
            label: "Why the Turing Test misses intelligence",
            href: "https://youtu.be/M2Yv3D8NDHY",
          },
          {
            label: "Which machine-learning systems actually work",
            href: "https://youtu.be/sNJ09NOqBXk",
          },
        ],
      },
      {
        date: "FEBRUARY 2023 · BEFORE GPT-4",
        label: "Explain what ChatGPT changed—and project what came next",
        links: [
          {
            label: "Open the pre-GPT-4 public snapshot",
            href: "https://www.huxiu.com/article/812076.html",
          },
        ],
      },
    ],
  },
  zh: {
    title:
      "2021年，我解释了上一代AI为什么有天花板。2023年2月、GPT-4发布前，我判断这道天花板正在被打破。",
    detail:
      "2021年的两期视频，从机制上解释了上一代AI的边界：它擅长从标注数据中学习对应关系，适合自动化窄场景，却缺少通用理解。ChatGPT出现后，指令遵循、in-context learning与推理能力的新迹象，迫使我更新判断。我继续推演推理成本下降、工具调用、长期记忆、直接交付结果与ChatGPT Native系统。原文中的概率没有删，后来判断错的两处也留在页面上。",
    cta: "阅读原文与后续复盘",
    href: "https://www.superlinear.academy/c/ai-resources/chatgpt",
    timeline: [
      {
        date: "2021年4月",
        label: "解释上一代AI为什么难以通用",
        links: [
          {
            label: "为什么图灵测试不能检测人工智能？",
            href: "https://youtu.be/M2Yv3D8NDHY",
          },
          {
            label: "什么样的机器学习真正有效？",
            href: "https://youtu.be/sNJ09NOqBXk",
          },
        ],
      },
      {
        date: "2023年2月 · GPT-4发布前",
        label: "说明ChatGPT改变了什么，并继续推演下一步",
        links: [
          {
            label: "查看GPT-4前公开版本",
            href: "https://www.huxiu.com/article/812076.html",
          },
        ],
      },
    ],
  },
};

const work = {
  en: [
    {
      number: "01",
      label: "OPEN, PUBLIC VALUE",
      title: "The free community",
      detail:
        "More than 20,000 people using AI to do serious work share projects, failures, progress, and postmortems here. Good understanding becomes public work; unfinished work meets users, peers, feedback, and opportunity earlier.",
      proof:
        "20,000+ members · 700+ public project posts · 8,000+ project comments",
      href: "https://www.superlinear.academy",
      cta: "Join free and put AI to real use",
    },
    {
      number: "02",
      label: "STRUCTURED LEARNING",
      title: "AI Builders",
      detail:
        "Principles, engineering reliability, product judgment, and practice belong in one system. The goal is independent judgment after the tutorial ends: when the problem is new, you can still decide what to build and make it reliable.",
      proof: "3,000+ paying learners · 5.0/5 on Maven",
      href: "https://ai-builders.com",
      cta: "Explore AI Builders",
    },
    {
      number: "03",
      label: "YEAR-ROUND MEMBERSHIP",
      title: "Stay Superlinear membership",
      detail:
        "Deep analysis, guest masterclasses, monthly Q&A, three core courses, selected Skills, and recordings—updated throughout the year, so an important question does not have to start from zero.",
      proof:
        "12+ masterclasses · monthly Q&A · 3 core courses · selected Skills",
      href: "https://stay.superlinear.academy",
      cta: "Explore the membership",
    },
    {
      number: "04",
      label: "ORGANIZATIONAL PRACTICE",
      title: "Enterprise AI training and custom programs",
      detail:
        "From team enrollment in a mature course to a full program redesigned around real roles, workflows, and evaluation. We begin by asking whether the existing course is enough; only a different problem warrants work from scratch.",
      proof: "By the seat · Private cohort · Fully custom from $100,000",
      href: "/collab/enterprise",
      cta: "See training and custom formats",
    },
  ],
  zh: [
    {
      number: "01",
      label: "免费开放",
      title: "免费社区",
      detail:
        "2万+认真用AI做事的人，把项目、失败、进展和复盘留在这里。好的理解变成公开作品，没做完的东西也能尽早遇到用户、同行、反馈与机会。",
      proof: "20,000+名成员 · 700+项目帖 · 8,000+条项目评论",
      href: "https://www.superlinear.academy",
      cta: "免费加入，把AI真正用起来",
    },
    {
      number: "02",
      label: "系统训练",
      title: "AI Builders",
      detail:
        "把AI原理、工程可靠性、产品判断和真实练习放进同一套系统。目标是学完教程以后，遇到没有现成答案的新问题，仍然知道该做什么、怎样做得可靠。",
      proof: "3,000+付费学员 · Maven 5.0/5",
      href: "https://ai-builders.com",
      cta: "了解AI Builders",
    },
    {
      number: "03",
      label: "全年会员",
      title: "Stay Superlinear会员",
      detail:
        "全年持续更新深度解析、闭门大师课、每月答疑、三门核心课、精选Skills与活动回放。遇到重要问题时，不必每次从零开始。",
      proof: "12+场闭门大师课 · 每月深度答疑 · 三门核心课 · 精选Skills",
      href: "https://stay.superlinear.academy",
      cta: "了解会员",
    },
    {
      number: "04",
      label: "组织实践",
      title: "企业AI培训与定制",
      detail:
        "从成熟课程的团队采购，到围绕真实岗位、工作流与评估重新设计的完整项目。我们先判断现成课程是否够用；只有问题本身不同，才从头定制。",
      proof: "按席位采购 · 专属班 · 完整定制$100,000起",
      href: "/collab/enterprise",
      cta: "查看企业培训与定制方式",
    },
  ],
};

const selectedGuests = {
  en: [
    {
      name: "Yangqing Jia",
      role: "Co-lead, PyTorch 1.0 · Founder, Lepton AI",
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
      name: "Reynold Xin",
      role: "Co-founder, Databricks",
      href: "/guests/reynold-xin",
      image: "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
    },
    {
      name: "Vijaye Raji",
      role: "Founder, Statsig · CTO of Applications, OpenAI",
      href: "/guests/vijaye-raji",
      image: "https://img.youtube.com/vi/iw2QYZeVlOQ/hqdefault.jpg",
    },
    {
      name: "Ryo Lu",
      role: "Head of Design, Cursor",
      href: "/guests/ryo-lu",
      image: "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
    },
    {
      name: "Gergely Orosz",
      role: "Founder, The Pragmatic Engineer",
      href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
      image: "/english-network/gergely-orosz.webp",
    },
  ],
  zh: [
    {
      name: "贾扬清（Yangqing Jia）",
      role: "PyTorch 1.0共同负责人 · Lepton AI创始人",
      href: "/guests/yangqing-jia",
      image: "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
    },
    {
      name: "毕书超（Shuchao Bi）",
      role: "OpenAI Head of Post-Training · Multimodal",
      href: "/guests/shuchao-bi",
      image: "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
    },
    {
      name: "Reynold Xin",
      role: "Databricks联合创始人",
      href: "/guests/reynold-xin",
      image: "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
    },
    {
      name: "Vijaye Raji",
      role: "Statsig创始人 · OpenAI CTO of Applications",
      href: "/guests/vijaye-raji",
      image: "https://img.youtube.com/vi/iw2QYZeVlOQ/hqdefault.jpg",
    },
    {
      name: "Ryo Lu",
      role: "Cursor Head of Design",
      href: "/guests/ryo-lu",
      image: "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
    },
    {
      name: "Gergely Orosz",
      role: "The Pragmatic Engineer创始人",
      href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
      image: "/english-network/gergely-orosz.webp",
    },
  ],
};

const endorsements = {
  en: [
    {
      quote:
        "Yuzheng distills years of product growth wisdom into actionable insight—helping data scientists surface decisive signals, PMs turn numbers into strategy, and founders find a repeatable path to compounding PMF.",
      name: "Vijaye Raji",
      role: "Founder, Statsig · CTO of Applications, OpenAI",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
    {
      quote:
        "Yuzheng has built an AI education community that is carefully curated, practical, and unusually useful for people doing real work.",
      name: "Wei Manfredi",
      role: "Senior Vice President, AI & Architecture · IHG Hotels & Resorts",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "Yuzheng shares more than tools. He teaches a philosophy of thinking—the rarest and most valuable thing in the AI era. Even as a scientist, I found his course deeply illuminating.",
      name: "Liu Jia",
      role: "Chair Professor, Tsinghua University · Cognitive neuroscientist",
      avatar: "/avatars/liu-jia.jpg",
      initials: "LJ",
    },
  ],
  zh: [
    {
      quote:
        "立正把多年产品增长经验提炼成可执行的洞察：帮助数据科学家找到决定性信号、产品经理把数字变成策略，也帮助创始人找到能够持续复利的PMF路径。",
      name: "Vijaye Raji",
      role: "Statsig创始人 · OpenAI CTO of Applications",
      avatar: "/avatars/vijaye-raji.jpg",
      initials: "VR",
    },
    {
      quote:
        "立正做的AI教育社群很少见：内容筛选认真，实战密度高，也确实贴近工作里的问题。",
      name: "Wei Manfredi",
      role: "IHG Hotels & Resorts AI与架构高级副总裁",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "立正分享的不只是工具，而是思维哲学——这才是AI时代最稀缺、最有价值的东西。他的课程让我这个科学家也深受启发。",
      name: "刘嘉",
      role: "清华大学讲席教授 ·《最强大脑》总科学顾问",
      avatar: "/avatars/liu-jia.jpg",
      initials: "刘嘉",
    },
  ],
};

function SectionLabel({
  children,
  dark = false,
}: {
  children: string;
  dark?: boolean;
}) {
  const { lang } = useLanguage();

  return (
    <p
      className={cn(
        "font-mono text-xs leading-5",
        lang === "en" ? "uppercase tracking-[0.2em]" : "tracking-[0.1em]",
        dark ? "text-superlinear-light" : "text-superlinear-deep"
      )}
    >
      {children}
    </p>
  );
}

function scrollToSection(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const meta = HOME_PAGE_META[lang];
    return applyPageSeo({
      ...meta,
      type: "profile",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      alternates: languageAlternates(
        HOME_PAGE_META.en.canonical,
        HOME_PAGE_META.zh.canonical
      ),
      jsonLd: buildHomeStructuredData(lang, meta.canonical),
    });
  }, [lang]);

  const nav = pick(lang, {
    en: {
      belief: "Belief",
      story: "Story",
      work: "Superlinear",
      conversations: "Conversations",
      decks: "Decks",
      books: "Books",
      shop: "Shop",
      collaborate: "Collaborate",
      community: "Free community",
    },
    zh: {
      belief: "主张",
      story: "经历",
      work: "Superlinear",
      conversations: "对话",
      decks: "Decks",
      books: "书",
      shop: "周边店",
      collaborate: "合作",
      community: "免费社区",
    },
  });

  const closeAndScroll = (id: string) => {
    setMobileMenuOpen(false);
    window.setTimeout(() => scrollToSection(id), 0);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/90 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between">
          <button onClick={() => scrollToSection("hero")} className="text-left">
            <div className="text-base font-semibold text-white">
              {lang === "en" ? "Yuzheng Sun" : "立正"}
            </div>
            <div className="text-xs text-zinc-500">
              {lang === "en" ? "立正 · 课代表立正" : "孙煜征 · 课代表立正"}
            </div>
          </button>

          <div className="hidden items-center gap-4 xl:flex">
            {[
              ["belief", nav.belief],
              ["story", nav.story],
              ["superlinear", nav.work],
              ["conversations", nav.conversations],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {label}
              </button>
            ))}
            <Link
              href={withLanguage("/decks", lang)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.decks}
            </Link>
            <Link
              href={withLanguage("/book", lang)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.books}
            </Link>
            <a
              href="https://shop.lizheng.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.shop}
            </a>
            <Link
              href={withLanguage("/collab", lang)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {nav.collaborate}
            </Link>
            <LanguageToggle size="sm" tone="superlinear" />
            <Button
              asChild
              size="sm"
              className="h-7 gap-1.5 bg-superlinear px-2.5 text-xs text-white hover:bg-superlinear-deep has-[>svg]:px-2.5"
            >
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Users className="h-3.5 w-3.5" />
                {nav.community}
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <LanguageToggle size="sm" tone="superlinear" />
            <button
              onClick={() => setMobileMenuOpen(value => !value)}
              className="p-1 text-zinc-300"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
          <div className="container border-t border-white/10 py-4 xl:hidden">
            <div className="grid gap-3 text-sm">
              {[
                ["belief", nav.belief],
                ["story", nav.story],
                ["superlinear", nav.work],
                ["conversations", nav.conversations],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => closeAndScroll(id)}
                  className="text-left text-zinc-300"
                >
                  {label}
                </button>
              ))}
              <Link
                href={withLanguage("/decks", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-300"
              >
                {nav.decks}
              </Link>
              <Link
                href={withLanguage("/book", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-300"
              >
                {nav.books}
              </Link>
              <a
                href="https://shop.lizheng.ai/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-300"
              >
                {nav.shop}
              </a>
              <Link
                href={withLanguage("/collab", lang)}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-300"
              >
                {nav.collaborate}
              </Link>
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-superlinear-light"
              >
                {nav.community} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section
          id="hero"
          className="scroll-mt-[72px] border-b border-white/10 bg-[#070A12]"
        >
          <div className="container grid gap-10 py-12 md:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
            <div className="max-w-2xl">
              <p
                className={cn(
                  "font-mono text-xs leading-5 text-superlinear-light",
                  lang === "en"
                    ? "uppercase tracking-[0.2em]"
                    : "tracking-[0.1em]"
                )}
              >
                {lang === "en" ? "YUZHENG SUN · 立正" : "立正 · 孙煜征"}
              </p>
              <h1
                className={cn(
                  "mt-6 font-semibold text-white [text-wrap:balance]",
                  lang === "en"
                    ? "text-[3.1rem] leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-[4.35rem] xl:text-[5.15rem]"
                    : "text-[2.85rem] leading-[1.08] tracking-[-0.02em] sm:text-[3.25rem] lg:text-[3.4rem] xl:text-[3.75rem]"
                )}
              >
                {lang === "en" ? (
                  "MAKE WHAT LASTS."
                ) : (
                  <>
                    <span className="block whitespace-nowrap">
                      学点真本事，
                    </span>
                    <span className="block whitespace-nowrap">
                      做点真东西。
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
                {lang === "en"
                  ? "AI makes building easier. My focus is studying what's worth building—and how hard-won judgment becomes work people actually use, trust, and keep choosing. Superlinear Academy is the work I have chosen to build for the long term."
                  : "AI让“做出来”越来越容易。我更关心什么值得做，以及怎样把一个人的判断和本事，做成人们真正会用、也愿意继续选择的东西。Superlinear Academy，是我决定花很多年做好的那件事。"}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("superlinear")}
                  className="gap-1.5 bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  {lang === "en" ? "See what I'm building" : "看我在做什么"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("thinking")}
                  className="border-white/25 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  {lang === "en" ? "Read recent thinking" : "最近在想什么"}
                </Button>
              </div>
              <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-500">
                {lang === "en"
                  ? "PhD in Economics from Cornell · Amazon, Meta & Tencent · Early Statsig team, later acquired by OpenAI"
                  : "康奈尔经济学博士 · Amazon、Meta、腾讯经历 · OpenAI收购团队早期成员 · Superlinear Academy创始人"}
              </p>
            </div>

            <figure>
              <div className="overflow-hidden border border-white/10 bg-black">
                <img
                  src="/hero/acquired-behind-scenes-desktop.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired"
                      : "孙煜征与Acquired的Ben Gilbert、David Rosenthal对谈"
                  }
                  className="h-auto w-full"
                  width={2400}
                  height={1600}
                  loading="eager"
                />
              </div>
              <figcaption className="mt-3 flex items-start justify-between gap-4 text-xs leading-5 text-zinc-500">
                <span>
                  {lang === "en"
                    ? "In conversation with Ben Gilbert and David Rosenthal of Acquired"
                    : "与Acquired的Ben Gilbert、David Rosenthal对谈"}
                </span>
                <span className="shrink-0">Significance Summit</span>
              </figcaption>
              <div className="mt-5 flex gap-4 border-t border-white/10 pt-4">
                <a
                  href="https://www.youtube.com/@kedaibiao"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yuzhengsun/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://yuzheng.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Substack"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Rss className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/sunyuzheng"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </figure>
          </div>
        </section>

        <section
          id="belief"
          className="scroll-mt-[72px] bg-[#F2F0EA] py-16 text-[#191712] md:py-24"
        >
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <SectionLabel>
                  {lang === "en" ? "THE QUESTION" : "我关心的问题"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {lang === "en" ? (
                    "AI can make real work easier. It can also amplify fake work a hundredfold."
                  ) : (
                    <>
                      AI让真东西更容易做出来，也能把
                      <span className="whitespace-nowrap">fake work</span>
                      放大一百倍。
                    </>
                  )}
                </h2>
              </div>
              <div className="space-y-5 text-base leading-8 text-[#48443B] md:text-lg md:leading-9">
                <p>
                  {lang === "en"
                    ? "Fake work substitutes visible activity for hard-to-measure value. A report, model, meeting, or launch can move the result—or merely produce evidence that someone is busy."
                    : "Fake work用可见动作代替难以衡量的价值。一份报告、一个模型、一场会议、一次上线，都可能推动结果，也可能只在生产“我们正在推进”的证据。"}
                </p>
                <p>
                  {lang === "en"
                    ? "So I keep returning to one question: what changed after the work was done? It is the question I use most often when I think about careers, products, organizations, and AI."
                    : "所以我会一直追问：这件事做完以后，到底改变了什么？这也是我看职业、产品、组织与AI时，最常用的一把尺子。"}
                </p>
              </div>
            </div>

            <div className="mt-14 grid border-y border-[#D4D0C7] md:grid-cols-3">
              {brandLayers[lang].map((item, index) => (
                <article
                  key={item.number}
                  className={cn(
                    "py-8 md:px-7 md:py-10",
                    index > 0 &&
                      "border-t border-[#D4D0C7] md:border-l md:border-t-0"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs text-superlinear-deep">
                      {item.number}
                    </span>
                    <p
                      className={cn(
                        "font-mono text-[11px] leading-5 text-superlinear-deep",
                        lang === "en"
                          ? "uppercase tracking-[0.18em]"
                          : "tracking-[0.1em]"
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold leading-9">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5E584E]">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-10 grid gap-5 border-l-2 border-superlinear pl-5 md:grid-cols-[0.88fr_1.12fr] md:gap-12 md:pl-7">
              <h3 className="max-w-lg text-2xl font-semibold leading-9 md:text-3xl md:leading-10">
                {lang === "en"
                  ? "I admire people whose work and lives became impossible to separate."
                  : "我敬佩的，是作品与人最终变得无法分开。"}
              </h3>
              <div className="space-y-3 text-sm leading-7 text-[#5E584E] md:text-base md:leading-8">
                <p>
                  {lang === "en"
                    ? "I think of the products of Steve Jobs and Zhang Xiaolong, Lionel Messi's football, Christopher Nolan's films, the judgments Geoffrey Hinton and Warren Buffett held through years of disagreement, and Tsunekazu Nishioka's temple craft. Different fields; in each case, the maker is unmistakable in the work."
                    : "乔布斯和张小龙的产品，梅西的足球，诺兰的电影，Hinton和巴菲特那些经得起争议与时间的判断，还有西冈常一的手艺。领域不同，作品里都抹不掉做出它的人。"}
                </p>
                <p>
                  {lang === "en"
                    ? "People shape work, and work shapes people. A defining work takes form version by version as materials, masters, users, markets, and time keep correcting it."
                    : "人塑造作品，作品也反过来塑造人。代表作不是一开始就能想对的；它要经过一个个版本，让材料、高手、用户、市场和时间不断校正，才慢慢成立。"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="thinking"
          className="scroll-mt-[72px] bg-[#173C2A] py-16 md:py-20"
        >
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-20">
              <div>
                <p
                  className={cn(
                    "font-mono text-xs leading-5 text-[#A4D9B5]",
                    lang === "en"
                      ? "uppercase tracking-[0.2em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {lang === "en" ? "LATEST THINKING" : "最近在写"}
                </p>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "As AI makes building easier, what becomes more valuable?"
                    : "AI让很多事变容易以后，什么反而更重要？"}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                {lang === "en"
                  ? "Three recent essays look at the question from different angles: why organizations mistake activity for value, how work should be redesigned when AI changes the economics, and why knowing the tools is not the same as knowing how to build."
                  : "最近三篇文章都在回答这个问题：组织为什么会把忙碌当成价值；AI改变成本以后，一项工作该怎样重做；为什么会工具，还远远不等于会把东西做成。"}
              </p>
            </div>

            <div className="mt-10 grid border-t border-white/20 lg:grid-cols-3">
              {recentWriting[lang].map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group block border-b border-white/20 py-7 transition hover:bg-white/[0.05] lg:px-7 lg:py-8",
                    index > 0 && "lg:border-l"
                  )}
                >
                  <p
                    className={cn(
                      "font-mono text-[11px] leading-5 text-[#A4D9B5]",
                      lang === "en"
                        ? "uppercase tracking-[0.16em]"
                        : "tracking-[0.08em]"
                    )}
                  >
                    {item.label}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-8 text-white md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    {item.detail}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A4D9B5] transition group-hover:text-white">
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section
          id="story"
          className="scroll-mt-[72px] bg-[#0B0F1A] py-16 md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "THE STORY" : "这条路"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en" ? (
                    "I traded a clear management path for work closer to the result."
                  ) : (
                    <>
                      我把一条清晰的
                      <span className="whitespace-nowrap">晋升路径</span>
                      ，换成了离结果更近的工作。
                    </>
                  )}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
                {lang === "en"
                  ? "At Tencent I led a 30-person Data & AI team and repeatedly earned its highest performance rating. I returned to the U.S. as an individual contributor at an early-stage startup, then left my job to build Superlinear full time. Each step moved me closer to users, markets, and consequences—and put more of my time and judgment into work I was willing to carry for the long term."
                  : "在腾讯带领30人数据与AI团队、连续获得最高绩效以后，我回到美国，从早期创业公司的IC重新开始；后来又辞掉工作，全职建设Superlinear。每一步，都让我离用户、市场与后果更近，也把更多时间和判断投进自己愿意长期负责的作品。"}
              </p>
            </div>

            <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-2">
              {careerChapters[lang].map(item => (
                <article key={item.marker} className="bg-[#101521] p-6 md:p-8">
                  <p
                    className={cn(
                      "font-mono text-[11px] leading-5 text-superlinear-light",
                      lang === "en"
                        ? "uppercase tracking-[0.18em]"
                        : "tracking-[0.1em]"
                    )}
                  >
                    {item.marker}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-8 text-white md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>

            <article
              id="judgment"
              className="mt-12 scroll-mt-[88px] border-y border-superlinear/30 py-8 md:grid md:grid-cols-[0.72fr_1.28fr] md:gap-14 md:py-10"
            >
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "JUDGMENT ON THE RECORD" : "公开留下的判断"}
                </SectionLabel>
                <div className="mt-5 space-y-5 border-l border-superlinear/30 pl-4">
                  {featuredJudgment[lang].timeline.map(item => (
                    <div key={item.date}>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        {item.date}
                      </p>
                      <p className="mt-1.5 max-w-xs text-sm font-medium leading-6 text-zinc-300">
                        {item.label}
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {item.links.map(link => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-fit items-start gap-1.5 text-xs leading-5 text-zinc-500 transition hover:text-superlinear-light"
                          >
                            <ExternalLink className="mt-1 h-3 w-3 shrink-0" />
                            <span>{link.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <h3 className="max-w-3xl text-2xl font-semibold leading-9 text-white md:text-3xl md:leading-10">
                  {featuredJudgment[lang].title}
                </h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
                  {featuredJudgment[lang].detail}
                </p>
                <a
                  href={featuredJudgment[lang].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-light transition hover:text-white"
                >
                  {featuredJudgment[lang].cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </section>

        <section
          id="superlinear"
          className="scroll-mt-[72px] bg-white py-16 text-[#171611] md:py-24"
        >
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel>SUPERLINEAR ACADEMY</SectionLabel>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "I am building an academy around this work."
                    : "我正在把这件事，做成一所学院。"}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-[#5C574D] md:text-lg">
                <p>
                  {lang === "en"
                    ? "Courses turn principles and expert judgment into capabilities people can practice. Community and projects put them to use early, in front of peers, users, companies, and markets. Superlinear does not get to declare the work real. Reality answers."
                    : "课程把原理和高手判断变成能练的本事；社区和项目让这些本事真正用起来，尽早见到同行、用户、企业与市场。什么算真东西，Superlinear说了不算，现实会回答。"}
                </p>
                <p>
                  {lang === "en"
                    ? "The free community, AI Builders, the Stay Superlinear membership, and enterprise programs each take responsibility for a different part of that work. Start wherever fits."
                    : "免费社区、AI Builders、Stay Superlinear会员与企业项目各承担一部分工作。你可以从最适合自己的地方进入。"}
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-[1.38fr_0.62fr]">
              <figure>
                <div className="overflow-hidden bg-[#E9E4DA]">
                  <img
                    src="/superlinear/yuzheng-yage-conversation.webp"
                    alt={
                      lang === "en"
                        ? "Yuzheng Sun and Yage discussing AI Builders"
                        : "立正与鸭哥讨论AI Builders"
                    }
                    className="aspect-[16/9] w-full object-cover"
                    loading="lazy"
                    width={1672}
                    height={941}
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-5 text-[#777064]">
                  {lang === "en"
                    ? "With Yage (Wang Yan), a Columbia electrical engineering PhD and AI researcher with nearly 40 papers, including work at leading AI conferences such as CVPR, NeurIPS, and KDD—and my long-term teaching partner across AI Builders and the membership."
                    : "与鸭哥（王言）。他是哥伦比亚大学电子工程博士、AI研究者，发表近40篇论文，研究见于CVPR、NeurIPS、KDD等AI顶会；也是AI Builders与会员内容的长期共同建设者。"}
                </figcaption>
              </figure>
              <figure>
                <div className="overflow-hidden bg-[#E9E4DA]">
                  <img
                    src="/english-network/doordash-ai-training.webp"
                    alt={
                      lang === "en"
                        ? "Yuzheng Sun leading an AI training session for DoorDash"
                        : "孙煜征为DoorDash团队做AI培训"
                    }
                    className="aspect-[16/9] w-full object-cover md:aspect-auto md:h-full"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-5 text-[#777064]">
                  {lang === "en"
                    ? "DoorDash team offsite · Seattle"
                    : "DoorDash团队线下AI培训 · 西雅图"}
                </figcaption>
              </figure>
            </div>

            <div className="mt-12 grid border-t border-[#DDD9D0] lg:grid-cols-2">
              {work[lang].map((item, index) => (
                <article
                  key={item.title}
                  className={cn(
                    "grid grid-cols-[2.6rem_1fr] gap-4 border-b border-[#DDD9D0] py-7 lg:px-8",
                    index % 2 === 1 && "lg:border-l"
                  )}
                >
                  <div className="font-mono text-xs text-superlinear-deep">
                    {item.number}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-mono text-[11px] leading-5 text-superlinear-deep",
                        lang === "en"
                          ? "uppercase tracking-[0.18em]"
                          : "tracking-[0.1em]"
                      )}
                    >
                      {item.label}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#5C574D]">
                      {item.detail}
                    </p>
                    <p
                      className={cn(
                        "mt-3 font-mono text-[11px] leading-5 text-[#777064]",
                        lang === "en"
                          ? "uppercase tracking-[0.12em]"
                          : "tracking-[0.05em]"
                      )}
                    >
                      {item.proof}
                    </p>
                    {item.href.startsWith("/") ? (
                      <Link
                        href={withLanguage(item.href, lang)}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-deep transition hover:text-superlinear"
                      >
                        {item.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-deep transition hover:text-superlinear"
                      >
                        {item.cta}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111722] py-12 md:py-16">
          <div className="container grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
            <Avatar className="h-16 w-16 border border-white/15 md:h-20 md:w-20">
              <AvatarImage src="/avatars/vijaye-raji.jpg" alt="Vijaye Raji" />
              <AvatarFallback>VR</AvatarFallback>
            </Avatar>
            <blockquote>
              <p className="max-w-5xl text-xl font-medium leading-8 text-white md:text-2xl md:leading-10">
                “{endorsements[lang][0].quote}”
              </p>
              <footer className="mt-4 text-sm text-zinc-400">
                <span className="font-semibold text-zinc-200">
                  {endorsements[lang][0].name}
                </span>
                <span className="mx-2 text-zinc-600">·</span>
                {endorsements[lang][0].role}
              </footer>
            </blockquote>
          </div>
        </section>

        <section
          id="conversations"
          className="scroll-mt-[72px] bg-[#0B0F1A] py-16 md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel dark>
                  {lang === "en" ? "200+ CONVERSATIONS" : "200+场公开对话"}
                </SectionLabel>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.1] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "I want to know what people who built important things saw—and what they later changed their minds about."
                    : "我想知道，做成过重要事情的人，当初看见了什么，后来又为什么改了主意。"}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-zinc-400">
                <p>
                  {lang === "en"
                    ? "I talk with them about technology, products, and companies, but I care most about the moments that changed an important choice: what they saw, why they were willing to bet, and which judgments reality later forced them to revise. These conversations keep changing my own standard for good work."
                    : "我和他们谈技术、产品和公司，更关心那些改变重要选择的时刻：当时看见了什么，为什么愿意下注，后来又有哪些判断被现实改写。这些对话，也不断改变我对好作品的判断。"}
                </p>
                <p className="text-sm leading-7 text-zinc-500">
                  {lang === "en"
                    ? "The work reaches a 400K+ audience across YouTube, Bilibili, and Xiaohongshu, including engineers, researchers, founders, investors, and operators across China and the U.S."
                    : "这些内容通过YouTube、B站和小红书触达400K+关注者，其中包括大量中美工程师、研究者、创始人、投资人与管理者。"}
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-3">
              {selectedGuests[lang].map(guest => {
                const external = guest.href.startsWith("http");
                const content = (
                  <>
                    <img
                      src={guest.image}
                      alt=""
                      className="aspect-[16/9] w-full object-cover opacity-85 transition duration-300 group-hover:opacity-100"
                      loading="lazy"
                      width={480}
                      height={270}
                    />
                    <div className="min-h-28 bg-[#101521] p-3 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-semibold leading-5 text-white sm:text-lg">
                          {guest.name}
                        </h3>
                        {external ? (
                          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
                        ) : (
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
                        )}
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-zinc-400 sm:text-xs sm:leading-5">
                        {guest.role}
                      </p>
                    </div>
                  </>
                );

                return external ? (
                  <a
                    key={guest.name}
                    href={guest.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-[#0B0F1A]"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={guest.name}
                    href={withLanguage(guest.href, lang)}
                    className="group block bg-[#0B0F1A]"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
              >
                <Link href={withLanguage("/guests", lang)}>
                  {lang === "en"
                    ? "Browse all conversations"
                    : "查看全部嘉宾访谈"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="books"
          className="scroll-mt-[72px] bg-[#F2F0EA] py-16 text-[#191712] md:py-24"
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
              <div>
                <SectionLabel>
                  {lang === "en" ? "BOOKS" : "两本书"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "Some understanding should be able to keep working without its author in the room."
                    : "有些理解，应该能够离开作者继续工作。"}
                </h2>
              </div>
              <div>
                <p className="text-base leading-8 text-[#5C574D] md:text-lg">
                  {lang === "en"
                    ? "Two books turn judgment from different fields into something a reader can use. The new lizheng-open-context repository adds public posts, timestamped video transcripts, sources, and version boundaries. Different forms, same job: let understanding remain usable and inspectable when the author is not in the room."
                    : "两本书把不同领域的判断写成读者可以独立使用的东西；新开放的lizheng-open-context又把公开帖子、视频时间码、出处与判断边界做成可检索的资料库。形式不同，做的是同一件事：作者不在场时，理解仍能被使用、核对和继续开发。"}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="bg-[#191712] text-white hover:bg-[#302C25]"
                  >
                    <Link href={withLanguage("/book", lang)}>
                      <BookOpen className="h-4 w-4" />
                      {lang === "en" ? "Explore both books" : "查看两本书"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#BDB7AB] bg-transparent text-[#191712] hover:bg-[#E9E5DC]"
                  >
                    <a
                      href="https://github.com/sunyuzheng/lizheng-open-context"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      {lang === "en"
                        ? "Open the public context"
                        : "查看公开资料库"}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <figure className="mt-12">
              <div className="overflow-hidden bg-[#DDD8CE]">
                <img
                  src="/book/growth-data-launch.webp"
                  alt={
                    lang === "en"
                      ? "Yuzheng Sun, co-authors Mengying Li and Joe Kumar, and Julie Zhuo at the Growth Data Analytics Playbook launch"
                      : "孙煜征、共同作者李梦颖和Joe Kumar，以及Julie Zhuo在《Growth Data Analytics Playbook》发布活动现场"
                  }
                  className="aspect-[16/10] w-full object-cover object-center md:aspect-[16/8.5]"
                  loading="lazy"
                  width={2400}
                  height={1597}
                />
              </div>
              <figcaption className="mt-3 grid gap-1 text-xs leading-5 text-[#777064] sm:grid-cols-[1fr_auto] sm:gap-6">
                <span>
                  {lang === "en"
                    ? "At the launch of Growth Data Analytics Playbook, with co-authors Mengying Li and Joe Kumar, and Julie Zhuo."
                    : "《Growth Data Analytics Playbook》发布活动，与共同作者李梦颖和Joe Kumar，以及Julie Zhuo。"}
                </span>
                <span>
                  {lang === "en"
                    ? "Featured in a 2025 WSJ CIO Journal reading list"
                    : "入选《华尔街日报》CIO Journal 2025年书单"}
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-[#101521] py-14 md:py-20">
          <div className="container">
            <SectionLabel dark>
              {lang === "en"
                ? "FROM PEOPLE WHO KNOW THE WORK"
                : "来自了解这件事的人"}
            </SectionLabel>
            <div className="mt-8 grid border-t border-white/10 lg:grid-cols-2">
              {endorsements[lang].slice(1).map((item, index) => (
                <blockquote
                  key={item.name}
                  className={cn(
                    "border-b border-white/10 py-8 lg:px-8",
                    index > 0 && "lg:border-l"
                  )}
                >
                  <p className="text-lg leading-8 text-zinc-200">
                    “{item.quote}”
                  </p>
                  <footer className="mt-6 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback>{item.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="mt-0.5 text-xs leading-5 text-zinc-500">
                        {item.role}
                      </div>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0B0F1A] py-16 md:py-24">
          <div className="container border-y border-white/10 py-12 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <p
                  className={cn(
                    "font-mono text-xs leading-5 text-superlinear-light",
                    lang === "en"
                      ? "uppercase tracking-[0.2em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {lang === "en" ? "YOUR WORK" : "轮到你的作品"}
                </p>
                <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-[1.08] text-white [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "Your defining work will not arrive finished."
                    : "你的代表作，不会一开始就是代表作。"}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                  {lang === "en"
                    ? "You do not need to have everything figured out before you begin. Make one small thing whose judgment and consequences you are willing to own—and that someone else is free to reject. Bring the unfinished work here, find peers, and let reality answer sooner."
                    : "你不必想清楚一切才开始。先做一件从判断到结果都由自己负责、也可能被别人拒绝的小事。带着还没完成的问题和作品进来，找到同行，让现实早点回答。"}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  asChild
                  className="bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  <a
                    href="https://www.superlinear.academy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en"
                      ? "Join Superlinear Academy for free"
                      : "免费加入Superlinear Academy"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  <a
                    href="https://ai-builders.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en" ? "Explore AI Builders" : "了解AI Builders"}
                  </a>
                </Button>
                <Link
                  href={withLanguage("/collab", lang)}
                  className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-zinc-500 transition hover:text-white"
                >
                  <Handshake className="h-4 w-4" />
                  {lang === "en" ? "Collaborate with me" : "与我合作"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#080B12] py-10">
        <div className="container flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-base font-semibold text-white">
              Yuzheng Sun · 立正
            </div>
            <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              {lang === "en"
                ? "PhD in Economics from Cornell, author, and founder of Superlinear Academy. Make what lasts."
                : "康奈尔大学经济学博士、作者，Superlinear Academy创始人。学点真本事，做点真东西。"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href={withLanguage("/about", lang)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-superlinear-light transition hover:text-white"
              >
                {lang === "en" ? "Factual profile" : "关于课代表立正"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://shop.lizheng.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-superlinear-light"
              >
                <ShoppingBag className="h-4 w-4" />
                {nav.shop}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-5 text-zinc-500">
            <a
              href="https://www.youtube.com/@kedaibiao"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="transition hover:text-white"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/yuzhengsun/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://yuzheng.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Substack"
              className="transition hover:text-white"
            >
              <Rss className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/sunyuzheng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:yz@superlinear.academy"
              aria-label="Email"
              className="transition hover:text-white"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="container mt-8 border-t border-white/10 pt-6 text-xs text-zinc-600">
          © {new Date().getFullYear()} Yuzheng Sun. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
