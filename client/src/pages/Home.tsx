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

const horizon = {
  en: {
    title:
      "I admire people whose work and lives became impossible to separate.",
    detail:
      "I think of the products of Steve Jobs and Zhang Xiaolong, Lionel Messi's football, Christopher Nolan's films, the judgments Geoffrey Hinton and Warren Buffett held through years of disagreement, and Tsunekazu Nishioka giving ancient timber another thousand years of life. Different fields and temperaments; in each case, the maker is unmistakable in the work.",
    structure:
      "People shape work, and work shapes people. A defining work is not conceived correctly in one stroke. It takes shape version by version, as materials, masters, users, markets, and time keep correcting it.",
  },
  zh: {
    title: "我敬佩的，是作品与人最终变得无法分开。",
    detail:
      "乔布斯与张小龙的产品，梅西的足球，诺兰的电影，Hinton和巴菲特那些经得起争议与时间的判断，还有西冈常一让千年木材再活一千年的手艺。领域不同，性格不同；作品里都无法抹掉做出它的人。",
    structure:
      "人塑造作品，作品也反过来塑造人。代表作不是一开始就能想对的。它要经过一个个版本，让材料、高手、用户、市场和时间不断校正，才慢慢成立。",
  },
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
      marker: "2022 · A DIFFERENT BET",
      title: "Leave a path I already knew how to win.",
      detail:
        "After leading Tencent's 30-person Data & AI team and repeatedly earning its highest performance rating, I left a clear management path and returned to the U.S. as an individual contributor. From there, I began turning work I had built outside my day job into something I was willing to carry for the long term.",
    },
    {
      marker: "STATSIG · SUPERLINEAR",
      title: "Make every bet answer to reality.",
      detail:
        "At Statsig, experiments made revising a judgment part of the product workflow. At Superlinear, courses, community, books, tools, and public work must answer the same question: are they still useful after the first release?",
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
      marker: "2022年 · 换一种下注",
      title: "离开一条我已经知道怎样赢的路。",
      detail:
        "在腾讯带领30人数据与AI团队、连续获得最高绩效之后，我离开了清晰的管理晋升路径，回美国从IC重新开始。也从那时起，我把原本做在主业之外的内容和事业，变成自己愿意长期负责的工作。",
    },
    {
      marker: "STATSIG · SUPERLINEAR",
      title: "让每一次下注，都接受现实检验。",
      detail:
        "在Statsig，实验让更新判断成为产品工作流的一部分。到了Superlinear，课程、社区、书、工具和公开内容，也都要回答同一个问题：第一次发布以后，它们还会不会继续有用？",
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
        "More than 20,000 people using AI to do serious work share projects, failures, progress, and postmortems here. You can see how others make decisions and get things done—and put unfinished work in front of feedback, users, peers, and opportunity earlier.",
      proof:
        "20,000+ members · 700+ public project posts · 8,000+ project comments",
      href: "https://www.superlinear.academy",
      cta: "Join for free",
    },
    {
      number: "02",
      label: "STRUCTURED LEARNING",
      title: "AI Builders",
      detail:
        "I teach it with Yage (Wang Yan), a Columbia electrical engineering PhD and AI researcher with nearly 40 papers, including work at CVPR, NeurIPS, and KDD. The goal is independent judgment after the tutorial ends: when the problem is new, you can still decide what to build and make it reliable.",
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
      title: "Enterprise AI programs",
      detail:
        "We work with teams to put AI into real workflows, then add the evaluation, ownership, and coordination it needs to become a way of working people can trust.",
      proof: "Tencent · Xiaohongshu · Meituan · DoorDash",
      href: "https://corp-training.ai-builders.com",
      cta: "Explore enterprise work",
    },
  ],
  zh: [
    {
      number: "01",
      label: "免费开放",
      title: "免费社区",
      detail:
        "2万+认真用AI做事的人，把项目、失败、进展和复盘留在这里。你能看见别人怎样判断、怎样把事情做成，也能让还没完成的作品尽早遇到反馈、用户、同行与机会。",
      proof: "20,000+名成员 · 700+项目帖 · 8,000+条项目评论",
      href: "https://www.superlinear.academy",
      cta: "免费加入",
    },
    {
      number: "02",
      label: "系统训练",
      title: "AI Builders",
      detail:
        "我和鸭哥（王言）共同授课。鸭哥是哥伦比亚大学电子工程博士、AI研究者，发表近40篇论文，研究见于CVPR、NeurIPS、KDD等顶会。目标是学完教程以后，仍然能独立判断：遇到没有现成答案的新问题，也知道该做什么、怎样做得可靠。",
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
      title: "企业AI项目",
      detail:
        "我们和团队一起，把AI放进真实工作流，补齐评估、责任与组织协作，让一次实验变成可以长期使用的工作方式。",
      proof: "腾讯 · 小红书 · 美团 · DoorDash",
      href: "https://corp-training.ai-builders.com",
      cta: "了解企业合作",
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
              {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
            </div>
            <div className="text-xs text-zinc-500">
              {lang === "en" ? "课代表立正" : "孙煜征 · Yuzheng Sun"}
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
                {lang === "en"
                  ? "YUZHENG SUN · 课代表立正"
                  : "课代表立正 · 孙煜征"}
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
                    <span className="block whitespace-nowrap">学点真本事，</span>
                    <span className="block whitespace-nowrap">做点真东西。</span>
                  </>
                )}
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
                {lang === "en"
                  ? "I moved from big-tech leadership into an early startup, then into building Superlinear full time. The throughline is simple: put judgment in front of reality. Do people want it, use it, and choose it again? Superlinear Academy is the answer I am building."
                  : "我从大厂带团队，走到早期创业公司，再全职做Superlinear。一路上，我把判断交给现实：有没有人要，有没有人用，做出来的东西能不能留下来。Superlinear Academy是我正在做的答案。"}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("superlinear")}
                  className="gap-1.5 bg-superlinear text-white hover:bg-superlinear-deep"
                >
                  {lang === "en" ? "What I'm building" : "我在做什么"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                  <a
                    href="https://www.superlinear.academy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {lang === "en" ? "Join the free community" : "免费加入社区"}
                  </a>
                </Button>
              </div>
              <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-500">
                {lang === "en"
                  ? "Cornell Economics PhD · Amazon, Meta & Tencent · Early Statsig team, later acquired by OpenAI"
                  : "康奈尔经济学博士 · Amazon、Meta、腾讯经历 · OpenAI收购团队早期成员 · 创始人、作者、访谈者"}
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
                  {lang === "en" ? "WHAT I BELIEVE" : "我相信"}
                </SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.1] [text-wrap:balance] md:text-5xl">
                  {lang === "en"
                    ? "You can be capable all your life—and still leave no work that truly carries your judgment or name."
                    : "一个人可以一生都很能干，最后却没有一件作品真正带着自己的判断和名字。"}
                </h2>
              </div>
              <div className="space-y-5 text-base leading-8 text-[#48443B] md:text-lg md:leading-9">
                <p>
                  {lang === "en"
                    ? "Many capable people become excellent at completing tasks and advancing within organizations. But tasks reset and roles move on. Once the titles are stripped away, what exists because you were here? I want to leave work that would not have taken the same form in someone else's hands."
                    : "许多人很会完成任务，也一路升职。可任务会重置，职位会移交。拿掉这些标签，什么东西仍然因为你而存在？我想留下的，是那种换一个人来做，就不会是这个样子的作品。"}
                </p>
                <p>
                  {lang === "en"
                    ? "AI is making first drafts cheap—and making similar output abundant. The problems you choose, the standards you set, and the work you are willing to put your name behind now distinguish you more clearly. At the same time, one person or a small team can attempt what used to be out of reach."
                    : "AI让第一版越来越便宜，也让相似的东西越来越多。于是，选什么题、用什么标准、愿意为什么作品署名负责，反而更能区分一个人。与此同时，一个人或一个小团队，也终于有机会完成过去根本够不到的东西。"}
                </p>
              </div>
            </div>

            <div className="mt-14 border-y border-[#D4D0C7]">
              <div className="grid gap-8 py-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14 lg:py-10">
                <div>
                  <p
                    className={cn(
                      "font-mono text-[11px] leading-5 text-superlinear-deep",
                      lang === "en"
                        ? "uppercase tracking-[0.18em]"
                        : "tracking-[0.1em]"
                    )}
                  >
                    {lang === "en" ? "THE HORIZON" : "我敬佩的作品"}
                  </p>
                  <h3 className="mt-4 max-w-md text-2xl font-semibold leading-9 md:text-3xl md:leading-10">
                    {lang === "en"
                      ? "The standard is visible in the work."
                      : "标准，就在作品里。"}
                  </h3>
                </div>
                <div>
                  <h4 className="text-2xl font-semibold leading-9">
                    {horizon[lang].title}
                  </h4>
                  <p className="mt-4 max-w-4xl text-base leading-8 text-[#5E584E]">
                    {horizon[lang].detail}
                  </p>
                </div>
              </div>

              <div className="grid border-t border-[#D4D0C7] py-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
                <p
                  className={cn(
                    "font-mono text-[11px] leading-5 text-superlinear-deep",
                    lang === "en"
                      ? "uppercase tracking-[0.18em]"
                      : "tracking-[0.1em]"
                  )}
                >
                  {lang === "en" ? "WHAT LASTS" : "作品怎样成立"}
                </p>
                <p className="max-w-4xl text-base leading-8 text-[#5E584E]">
                  {horizon[lang].structure}
                </p>
              </div>
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
                  {lang === "en"
                    ? "Being good at the game did not answer whose work my life was building."
                    : "很会赢，并不能回答我的生命究竟在为谁的作品积累。"}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
                {lang === "en"
                  ? "I learned to do well in schools and companies. The harder move was to put my best time and ability behind problems, standards, and work I had chosen—and be responsible for the result."
                  : "我曾经很擅长在学校和公司里取得好结果。更难的是，把最好的时间和能力押在自己选择的问题、标准与作品上，并为结果负责。"}
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
                    ? "I want to build a real academy."
                    : "我想做一所真正的学院。"}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-[#5C574D] md:text-lg">
                <p>
                  {lang === "en"
                    ? "I want people with professional depth to come here and turn their judgment into work, products, and ventures of their own. Superlinear is the most important long-term bet I have chosen, and it is nowhere near finished."
                    : "我希望有专业积累的人来到这里，把自己的判断做成作品、产品和事业。Superlinear是我最重要的长期选择，也还远没有做完。"}
                </p>
                <p>
                  {lang === "en"
                    ? "The free community, AI Builders, the membership, and enterprise programs each serve a different need. Start wherever fits."
                    : "免费社区、AI Builders、会员与企业项目各做一件不同的事。你可以从最适合自己的地方进入。"}
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
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-superlinear-deep transition hover:text-superlinear"
                    >
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </a>
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
                    ? "Growth Data Analytics Playbook covers product-market fit, metrics, and experimentation. 真本事 examines how work becomes capability, leverage, and income of your own. Different subjects, same job: put judgment into a form someone else can still use when the author is not in the room."
                    : "《Growth Data Analytics Playbook》讨论产品市场匹配、指标和实验；《真本事》讨论怎样把工作变成自己的能力、杠杆和收入。主题不同，做的却是同一件事：把判断写成作者不在场时，别人仍然能用的东西。"}
                </p>
                <Button
                  asChild
                  className="mt-6 bg-[#191712] text-white hover:bg-[#302C25]"
                >
                  <Link href={withLanguage("/book", lang)}>
                    <BookOpen className="h-4 w-4" />
                    {lang === "en" ? "Explore both books" : "查看两本书"}
                  </Link>
                </Button>
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
                    ? "You do not need to have everything figured out before you begin. See what people here are making, or bring an unfinished question or work of your own. Find peers, get feedback, and test it in the world sooner."
                    : "你不必想清楚一切才开始。先看看这里的人正在做什么；也可以带着还没完成的问题和作品进来，找到同行，得到反馈，拿到现实里试一试。"}
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
              Yuzheng Sun · 课代表立正
            </div>
            <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              {lang === "en"
                ? "Cornell Economics PhD, author, and founder of Superlinear Academy. Make what lasts."
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
