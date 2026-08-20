import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import {
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Github,
  Handshake,
  Linkedin,
  Rss,
  Youtube,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

if (typeof window !== "undefined") {
  void import("./home-experiment.css");
}

export const heroCopy = {
  en: {
    study: "Vercel design.md study · Independent experiment",
    name: "Yuzheng Sun · 课代表立正",
    intro:
      "AI makes the first version easier. The harder question is what deserves your years, and what can still carry your judgment after you leave the room.",
    building:
      "I am building Superlinear Academy as my answer: a place for serious people to turn judgment into work that earns a longer life.",
    primary: "See the work",
    secondary: "Join the free community",
    credentials:
      "Cornell Economics PhD · Amazon, Meta & Tencent · Early Statsig team, later acquired by OpenAI · Founder, author & interviewer",
    imageAlt:
      "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired",
    caption: "With Ben Gilbert & David Rosenthal of Acquired",
    location: "SIGNIFICANCE SUMMIT",
    version: "A long-term wager",
    language: "Language",
  },
  zh: {
    study: "Vercel design.md原生实验·独立试验页",
    name: "课代表立正·孙煜征",
    intro:
      "AI让第一版越来越容易。更难的问题是：什么值得你投入很多年，又有什么在你离开现场以后，依然带着你的判断？",
    building:
      "Superlinear Academy是我的回答：让认真做事的人，把自己的判断变成经得起使用、变化与时间的作品。",
    primary: "看我正在做什么",
    secondary: "免费加入社区",
    credentials:
      "康奈尔经济学博士·Amazon、Meta、腾讯经历·OpenAI收购团队早期成员·创始人、作者、访谈者",
    imageAlt: "孙煜征与Acquired的Ben Gilbert、David Rosenthal对谈",
    caption: "与Acquired的Ben Gilbert、David Rosenthal对谈",
    location: "SIGNIFICANCE SUMMIT",
    version: "一场长期下注",
    language: "语言",
  },
};

export const proof = {
  en: [
    ["Model", "Cornell Economics PhD"],
    ["Operate", "Led a 30-person Data & AI team"],
    ["Build", "20,000+ people in the open community"],
    ["Learn", "200+ public conversations"],
  ],
  zh: [
    ["理解", "康奈尔大学经济学博士"],
    ["负责", "带领30人数据与AI团队"],
    ["建造", "20,000+人的开放社区"],
    ["求证", "200+场公开对话"],
  ],
};

export const pageCopy = {
  en: {
    nav: { thesis: "Thesis", record: "Record", work: "Work", more: "More" },
    thesisLabel: "Why this matters now",
    thesisTitle:
      "You can be capable all your life and still leave no work that truly carries your judgment or name.",
    thesisBody: [
      "Many capable people learn, rise, manage, and deliver. Then the task resets, the title moves on, and it becomes hard to say what their best attention added to the world.",
      "AI is making the first version cheap. That makes choosing well, holding a standard, revising in public, and staying with a consequential problem more valuable, not less.",
    ],
    thesisStatement:
      "A defining work is not something you think right once. It becomes real through version after version, as materials, masters, users, markets, and time answer back.",
    horizonLabel: "The horizon",
    horizonTitle: "The standard is visible in the work.",
    horizonBody:
      "The products of Steve Jobs and Zhang Xiaolong. Lionel Messi’s football. Christopher Nolan’s films. Geoffrey Hinton’s and Warren Buffett’s convictions surviving decades of disagreement. Tsunekazu Nishioka’s craft, giving ancient timber another thousand years of life. Different fields and temperaments; the same unmistakable result: the work carries the maker.",
    recordLabel: "The record",
    recordTitle:
      "Being good at the game did not answer whose work my life was building.",
    recordIntro:
      "I learned how to succeed inside schools and companies. The harder change was to put my best attention behind problems, standards, and work I had chosen, and accept responsibility for what happened next.",
    judgmentLabel: "Judgment on the record",
    judgmentTitle:
      "In 2021, I laid out the limits of the dominant AI paradigm. In February 2023, before GPT-4, I argued that AI had begun to break that ceiling.",
    judgmentBody:
      "I reasoned forward to falling inference costs, tool-connected workflows, persistent memory, direct result delivery, and ChatGPT-native systems. The original probabilities remain on the page. So do the two major errors I added later.",
    judgmentCta: "Read the argument and later review",
    workLabel: "Superlinear Academy",
    workTitle: "I want to build a real academy.",
    workBody: [
      "Not merely a course, and not merely a community. I want people with professional depth to turn their judgment into products, work, and ventures.",
      "Superlinear is the most important long-term work I have chosen. It is already useful to many people, and it is still far from finished.",
    ],
    yageCaption:
      "With Yage (Wang Yan), Columbia electrical engineering PhD, AI researcher, and my long-term teaching partner.",
    doorDashCaption: "DoorDash team AI training · Seattle",
    quote:
      "Yuzheng distills years of product growth wisdom into actionable insight, helping data scientists surface decisive signals, PMs turn numbers into strategy, and founders find a repeatable path to compounding PMF.",
    quoteBy: "Vijaye Raji · Founder, Statsig · CTO of Applications, OpenAI",
    residueLabel: "Work that leaves the room",
    residueTitle:
      "The work should keep helping after the conversation, class, or launch is over.",
    conversationsTitle: "200+ public conversations",
    conversationsBody:
      "I return to people whose work changed what others thought possible: what they saw, why they were willing to bet, and how reality rewrote the answer.",
    conversationsCta: "Browse all conversations",
    booksTitle: "Two books",
    booksBody:
      "Growth Data Analytics Playbook covers product-market fit, metrics, and experimentation. 真本事 asks how work becomes capability, leverage, and income of your own. Different subjects, same attempt: preserve judgment in a form another person can use.",
    booksCta: "Explore both books",
    closingLabel: "Your work",
    closingTitle: "Your defining work will not arrive finished.",
    closingBody:
      "You do not need a complete answer before you begin. Bring an unfinished question into contact with knowledge, peers, users, and reality.",
    join: "Join Superlinear Academy for free",
    builders: "Explore AI Builders",
    collaborate: "Collaborate with me",
    footer:
      "Cornell Economics PhD, author, and founder of Superlinear Academy and AI Builders.",
  },
  zh: {
    nav: { thesis: "主张", record: "经历", work: "作品", more: "目录" },
    thesisLabel: "为什么现在更重要",
    thesisTitle:
      "一个人可以一生都很能干，最后却没有一件作品真正带着自己的判断和名字。",
    thesisBody: [
      "许多有能力的人不断学习、升级、管理和交付。任务却会重置，职位会移交；当这些标签拿走以后，很难回答自己最好的注意力究竟为世界增加了什么。",
      "AI正在让第一版变得廉价。也因此，选对问题、坚持标准、接受现实的修改，并在一件重要的事上长期积累，反而变得更有价值。",
    ],
    thesisStatement:
      "真正的代表作不是一次想对的。它在一个个版本里，经过材料、高手、用户、市场和时间的回答，才慢慢成立。",
    horizonLabel: "我敬佩的作品",
    horizonTitle: "标准，就在作品里。",
    horizonBody:
      "乔布斯与张小龙的产品，梅西的足球，诺兰的电影，Hinton与巴菲特经受时间的非共识，以及西冈常一让千年木材再活一千年的手艺。领域不同，性格不同；作品里都无法抹掉那个做出它的人。",
    recordLabel: "这条路",
    recordTitle: "很会赢，并不能回答我的生命究竟在为谁的作品积累。",
    recordIntro:
      "我曾经很擅长在学校和公司里取得好结果。更难的变化，是把最好的注意力放到自己选择的问题、标准与作品上，并承担接下来发生的一切。",
    judgmentLabel: "公开留下的判断",
    judgmentTitle:
      "2021年，我解释了旧AI的能力上限。2023年2月、GPT-4发布前，我判断AI已经开始突破那道上限。",
    judgmentBody:
      "我由此推演推理成本、工具连接、长期记忆、直接交付结果与ChatGPT Native系统。原文里的概率仍在，后来复盘的两处错误也仍在。",
    judgmentCta: "阅读原文与后续复盘",
    workLabel: "Superlinear Academy",
    workTitle: "我想认真做一所真正的学院。",
    workBody: [
      "它不是一门课，也不只是一个社区。我希望有专业积累的人来到这里以后，能把自己的判断变成作品、产品和事业。",
      "Superlinear是我选择长期做的、最重要的作品。它已经对许多人有用，也还远没有做完。",
    ],
    yageCaption:
      "与鸭哥（王言）。哥伦比亚大学电子工程博士、AI研究者，也是我长期共同授课的伙伴。",
    doorDashCaption: "DoorDash团队线下AI培训·西雅图",
    quote:
      "立正把多年产品增长经验提炼成可执行的洞察：帮助数据科学家找到决定性信号、产品经理把数字变成策略，也帮助创始人找到能够持续复利的PMF路径。",
    quoteBy: "Vijaye Raji·Statsig创始人·OpenAI CTO of Applications",
    residueLabel: "离开现场以后",
    residueTitle: "对话、课程或发布结束以后，作品还应该继续帮助别人。",
    conversationsTitle: "200+场公开对话",
    conversationsBody:
      "我一直回到那些真正改变了“什么是可能”的人：他们看见了什么，为什么愿意下注，现实又怎样改写答案。",
    conversationsCta: "查看全部嘉宾访谈",
    booksTitle: "两本书",
    booksBody:
      "《Growth Data Analytics Playbook》讨论产品市场匹配、指标和实验；《真本事》讨论怎样把工作变成自己的能力、杠杆和收入。主题不同，做的是同一件事：把判断留下来，变成别人也可以使用的作品。",
    booksCta: "查看两本书",
    closingLabel: "轮到你的作品",
    closingTitle: "你的代表作，不会一开始就是代表作。",
    closingBody:
      "你不必先拥有完整答案。把还没做完的问题和作品带进来，让它早点遇到知识、同行、用户和现实。",
    join: "免费加入Superlinear Academy",
    builders: "了解AI Builders",
    collaborate: "与我合作",
    footer:
      "康奈尔大学经济学博士、作者，Superlinear Academy与AI Builders创始人。",
  },
};

export const chapters = {
  en: [
    [
      "Cornell · Amazon · Meta",
      "See the structure beneath the visible result.",
      "Economics trained me to ask about causes, choices, incentives, and constraints. Product work made those explanations answer to real users and real decisions.",
    ],
    [
      "Tencent · 30-person Data & AI team",
      "Make judgment travel through people and responsibility.",
      "Leading a team taught me that one person seeing clearly was not enough. Priorities, standards, incentives, and ownership had to hold together.",
    ],
    [
      "2022 · A different bet",
      "Leave a path I already knew how to win.",
      "After repeatedly earning Tencent’s highest performance rating, I left a clear management path, returned to the U.S. as an individual contributor, and began carrying my own work for the long term.",
    ],
    [
      "Statsig · Superlinear",
      "Keep the wager answerable to reality.",
      "At Statsig, experiments made belief revision part of the product workflow. At Superlinear, every release still faces the same question: is it genuinely useful after the first moment?",
    ],
  ],
  zh: [
    [
      "康奈尔·Amazon·Meta",
      "看见结果背后的结构。",
      "经济学训练我追问因果、选择、激励与约束；产品工作又让这些解释面对真实用户和真实决定。",
    ],
    [
      "腾讯·30人数据与AI团队",
      "让判断穿过人、组织与责任。",
      "带团队让我明白，一个人想清楚远远不够。优先级、标准、激励与责任必须彼此咬合。",
    ],
    [
      "2022年·换一种下注",
      "离开一条我已经知道怎样赢的路。",
      "在腾讯连续获得最高绩效之后，我离开清晰的管理晋升路径，回美国从IC重新开始，也开始长期承担自己的作品。",
    ],
    [
      "Statsig·Superlinear",
      "让下注持续面对现实。",
      "在Statsig，实验把更新判断变成产品工作流；到了Superlinear，每次发布以后仍要回答同一个问题：它是否真的继续有用？",
    ],
  ],
};

export const workItems = {
  en: [
    [
      "01",
      "The free community",
      "20,000+ members · 700+ public project posts · 8,000+ project comments",
      "Unfinished work meets analysis, real projects, first-hand experience, complementary people, collaboration, and opportunity.",
      "https://www.superlinear.academy",
      "Join for free",
    ],
    [
      "02",
      "AI Builders",
      "3,000+ paying learners · 5.0/5 on Maven",
      "A structured learning system for understanding AI deeply enough to make reliable choices and build beyond a tutorial.",
      "https://ai-builders.com",
      "Explore AI Builders",
    ],
    [
      "03",
      "Stay Superlinear membership",
      "12+ masterclasses · monthly Q&A · 3 core courses · selected Skills",
      "A year-round source of deep analysis, masterclasses, Q&A, courses, Skills, recordings, and practitioner context.",
      "https://stay.superlinear.academy",
      "Explore the membership",
    ],
    [
      "04",
      "Enterprise AI programs",
      "Tencent · Xiaohongshu · Meituan · DoorDash",
      "We bring new AI capability into real workflows, evaluation, ownership, and organizational constraints.",
      "https://www.lizheng.ai/decks",
      "Explore enterprise work",
    ],
  ],
  zh: [
    [
      "01",
      "免费社区",
      "20,000+名成员·700+项目帖·8,000+条项目评论",
      "让还没完成的作品，尽早遇到深度解析、真实项目、一手经验、互补的人、合作与机会。",
      "https://www.superlinear.academy",
      "免费加入",
    ],
    [
      "02",
      "AI Builders",
      "3,000+付费学员·Maven 5.0/5",
      "把AI理解到足以做出可靠判断，面对没有教程的新问题，也能独立做成可靠的东西。",
      "https://ai-builders.com",
      "了解AI Builders",
    ],
    [
      "03",
      "Stay Superlinear会员",
      "12+场闭门大师课·每月答疑·三门核心课·精选Skills",
      "全年持续更新深度解析、闭门大师课、答疑、课程、Skills、回放与一线实践语境。",
      "https://stay.superlinear.academy",
      "了解会员",
    ],
    [
      "04",
      "企业AI项目",
      "腾讯·小红书·美团·DoorDash",
      "把新的AI能力放进团队的真实工作流、评估、责任与组织约束里。",
      "https://www.lizheng.ai/decks",
      "查看企业项目",
    ],
  ],
};

export const guests = {
  en: [
    [
      "Yangqing Jia",
      "Co-lead, PyTorch 1.0 · Founder, Lepton AI",
      "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
      "/guests/yangqing-jia",
    ],
    [
      "Shuchao Bi",
      "Head of Post-Training · Multimodal, OpenAI",
      "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
      "/guests/shuchao-bi",
    ],
    [
      "Reynold Xin",
      "Co-founder, Databricks",
      "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
      "/guests/reynold-xin",
    ],
    [
      "Ryo Lu",
      "Head of Design, Cursor",
      "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
      "/guests/ryo-lu",
    ],
  ],
  zh: [
    [
      "贾扬清",
      "PyTorch 1.0共同负责人·Lepton AI创始人",
      "https://img.youtube.com/vi/Lt-lVe957hc/hqdefault.jpg",
      "/guests/yangqing-jia",
    ],
    [
      "毕书超",
      "OpenAI Head of Post-Training·Multimodal",
      "https://img.youtube.com/vi/7ej2r7XysKc/hqdefault.jpg",
      "/guests/shuchao-bi",
    ],
    [
      "Reynold Xin",
      "Databricks联合创始人",
      "https://img.youtube.com/vi/GIv0I-34aaI/hqdefault.jpg",
      "/guests/reynold-xin",
    ],
    [
      "Ryo Lu",
      "Cursor Head of Design",
      "https://img.youtube.com/vi/BnL5qaBzmR0/maxresdefault.jpg",
      "/guests/ryo-lu",
    ],
  ],
};

function ExperimentLanguageSwitch() {
  const { lang, setLang } = useLanguage();
  const [location] = useLocation();

  return (
    <div
      className="exp-language"
      role="group"
      aria-label={heroCopy[lang].language}
    >
      <Link
        href={withLanguage(location, "en")}
        onClick={() => setLang("en")}
        aria-current={lang === "en" ? "page" : undefined}
        hrefLang="en"
      >
        EN
      </Link>
      <Link
        href={withLanguage(location, "zh")}
        onClick={() => setLang("zh")}
        aria-current={lang === "zh" ? "page" : undefined}
        hrefLang="zh-CN"
      >
        中文
      </Link>
    </div>
  );
}

export default function HomeExperiment() {
  const { lang } = useLanguage();
  const copy = heroCopy[lang];
  const page = pageCopy[lang];

  useEffect(() => {
    const previousTitle = document.title;
    const previousTheme = document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.getAttribute("content");
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const createdRobots = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previousRobots = robots.getAttribute("content");
    let theme = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    const createdTheme = !theme;
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }

    document.title =
      lang === "en"
        ? "Vercel Design Study · Yuzheng Sun"
        : "Vercel设计原生实验 · 课代表立正";
    robots.content = "noindex, nofollow";
    theme.content = "#08090a";

    return () => {
      document.title = previousTitle;
      if (createdRobots) robots?.remove();
      else if (previousRobots === null) robots?.removeAttribute("content");
      else if (robots) robots.content = previousRobots;
      if (createdTheme) theme?.remove();
      else if (theme) {
        if (previousTheme === null) theme.removeAttribute("content");
        else if (previousTheme !== undefined) theme.content = previousTheme;
      }
    };
  }, [lang]);

  return (
    <div className="exp-page exp-page-vercel">
      <a className="exp-skip" href="#experiment-main">
        {lang === "en" ? "Skip to content" : "跳到正文"}
      </a>

      <div className="exp-study-bar">
        <span>{copy.study}</span>
        <div className="exp-study-links">
          <Link href={withLanguage("/experiment/emil", lang)}>
            {lang === "en" ? "Compare the Emil study" : "对比Emil版"}
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <span aria-hidden="true">2026.08.17</span>
        </div>
      </div>

      <header className="exp-header">
        <Link href={withLanguage("/", lang)} className="exp-brand">
          <span>YS</span>
          <span>{lang === "en" ? "Yuzheng Sun" : "课代表立正"}</span>
        </Link>
        <nav
          aria-label={lang === "en" ? "Experiment navigation" : "实验版导航"}
        >
          <a href="#thesis">{page.nav.thesis}</a>
          <a href="#record">{page.nav.record}</a>
          <a href="#work">{page.nav.work}</a>
        </nav>
        <details className="exp-mobile-nav">
          <summary>{page.nav.more}</summary>
          <div>
            <a href="#thesis">{page.nav.thesis}</a>
            <a href="#record">{page.nav.record}</a>
            <a href="#work">{page.nav.work}</a>
          </div>
        </details>
        <ExperimentLanguageSwitch />
      </header>

      <main id="experiment-main">
        <section className="exp-hero" aria-labelledby="experiment-title">
          <p className="exp-kicker">{copy.name}</p>

          <h1 id="experiment-title" className="exp-title">
            {lang === "en" ? (
              <>
                <span>MAKE</span>
                <span>WHAT</span>
                <span className="exp-title-mark">LASTS.</span>
              </>
            ) : (
              <>
                <span>做出你的</span>
                <span className="exp-title-mark">代表作。</span>
              </>
            )}
          </h1>

          <div className="exp-hero-copy">
            <p className="exp-intro">{copy.intro}</p>
            <p>{copy.building}</p>
            <div className="exp-actions">
              <a className="exp-button exp-button-primary" href="#work">
                {copy.primary}
                <ArrowDown aria-hidden="true" />
              </a>
              <a
                className="exp-button exp-button-secondary"
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.secondary}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
            <p className="exp-credentials">{copy.credentials}</p>
          </div>

          <figure className="exp-hero-figure">
            <div className="exp-image-shell">
              <img
                src="/hero/acquired-behind-scenes-desktop.webp"
                alt={copy.imageAlt}
                width={2400}
                height={1600}
              />
              <span className="exp-figure-index">001</span>
              <span className="exp-figure-version">{copy.version}</span>
            </div>
            <figcaption>
              <span>{copy.caption}</span>
              <span>{copy.location}</span>
            </figcaption>
          </figure>

          <div
            className="exp-social"
            aria-label={lang === "en" ? "Social links" : "社交链接"}
          >
            {[
              ["YouTube", "https://www.youtube.com/@kedaibiao", Youtube],
              ["LinkedIn", "https://www.linkedin.com/in/yuzhengsun/", Linkedin],
              ["Substack", "https://yuzheng.substack.com/", Rss],
              ["GitHub", "https://github.com/sunyuzheng", Github],
            ].map(([label, href, Icon]) => (
              <a
                key={label as string}
                href={href as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label as string}
              >
                <Icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section
          className="exp-proof"
          aria-label={lang === "en" ? "Selected proof" : "关键事实"}
        >
          {proof[lang].map(([label, value]) => (
            <div key={label} className="exp-proof-item">
              <p>
                <strong>{label}</strong>
                {value}
              </p>
            </div>
          ))}
        </section>

        <section
          id="thesis"
          className="exp-section exp-thesis"
          aria-labelledby="thesis-title"
        >
          <div className="exp-section-head">
            <p className="exp-section-label">{page.thesisLabel}</p>
            <h2 id="thesis-title">{page.thesisTitle}</h2>
          </div>
          <div className="exp-section-body exp-thesis-body">
            {page.thesisBody.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div
            className="exp-making-loop"
            aria-label={
              lang === "en"
                ? "How defining work becomes real"
                : "代表作怎样慢慢成立"
            }
          >
            {(lang === "en"
              ? ["Judgment", "Work", "Reality", "Revision", "Time"]
              : ["判断", "作品", "现实", "修改", "时间"]
            ).map((step, index, all) => (
              <div key={step} className="exp-making-step">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
                {index < all.length - 1 && <ArrowRight aria-hidden="true" />}
              </div>
            ))}
          </div>
          <p className="exp-thesis-statement">{page.thesisStatement}</p>

          <div className="exp-horizon">
            <div>
              <p className="exp-section-label">{page.horizonLabel}</p>
              <h3>{page.horizonTitle}</h3>
            </div>
            <p>{page.horizonBody}</p>
          </div>
        </section>

        <section
          id="record"
          className="exp-section exp-record"
          aria-labelledby="record-title"
        >
          <div className="exp-section-head">
            <p className="exp-section-label">{page.recordLabel}</p>
            <h2 id="record-title">{page.recordTitle}</h2>
          </div>
          <p className="exp-record-intro">{page.recordIntro}</p>

          <div className="exp-chapters">
            {chapters[lang].map(([marker, title, detail], index) => (
              <article key={marker}>
                <span className="exp-row-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="exp-row-marker">{marker}</p>
                <h3>{title}</h3>
                <p className="exp-row-detail">{detail}</p>
              </article>
            ))}
          </div>

          <article className="exp-judgment">
            <div className="exp-judgment-timeline">
              <p className="exp-section-label">{page.judgmentLabel}</p>
              <ol>
                <li>
                  <span>{lang === "en" ? "April 2021" : "2021年4月"}</span>
                  <strong>
                    {lang === "en"
                      ? "Define the old paradigm’s limits"
                      : "解释旧AI范式的能力边界"}
                  </strong>
                </li>
                <li>
                  <span>{lang === "en" ? "February 2023" : "2023年2月"}</span>
                  <strong>
                    {lang === "en"
                      ? "Explain what had changed before GPT-4"
                      : "在GPT-4前说明哪一层上限已被打破"}
                  </strong>
                </li>
                <li>
                  <span>{lang === "en" ? "Still public" : "至今公开"}</span>
                  <strong>
                    {lang === "en"
                      ? "Keep the probabilities and errors visible"
                      : "保留当时的概率与后来发现的错误"}
                  </strong>
                </li>
              </ol>
            </div>
            <div className="exp-judgment-copy">
              <h3>{page.judgmentTitle}</h3>
              <p>{page.judgmentBody}</p>
              <a
                href="https://www.superlinear.academy/c/ai-resources/chatgpt"
                target="_blank"
                rel="noopener noreferrer"
              >
                {page.judgmentCta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </article>
        </section>

        <section
          id="work"
          className="exp-section exp-work"
          aria-labelledby="work-title"
        >
          <div className="exp-work-intro">
            <div className="exp-section-head">
              <p className="exp-section-label">{page.workLabel}</p>
              <h2 id="work-title">{page.workTitle}</h2>
            </div>
            <div className="exp-section-body">
              {page.workBody.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="exp-work-images">
            <figure>
              <img
                src="/superlinear/yuzheng-yage-conversation.webp"
                alt={
                  lang === "en"
                    ? "Yuzheng Sun and Yage discussing AI Builders"
                    : "立正与鸭哥讨论AI Builders"
                }
                width={1672}
                height={941}
                loading="lazy"
              />
              <figcaption>{page.yageCaption}</figcaption>
            </figure>
            <figure>
              <img
                src="/english-network/doordash-ai-training.webp"
                alt={
                  lang === "en"
                    ? "Yuzheng Sun leading an AI training session for DoorDash"
                    : "孙煜征为DoorDash团队做AI培训"
                }
                width={1280}
                height={720}
                loading="lazy"
              />
              <figcaption>{page.doorDashCaption}</figcaption>
            </figure>
          </div>

          <div className="exp-work-list">
            {workItems[lang].map(
              ([number, title, evidence, detail, href, cta]) => (
                <article key={number}>
                  <span className="exp-row-index">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p className="exp-work-evidence">{evidence}</p>
                  </div>
                  <p className="exp-row-detail">{detail}</p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cta}: ${title}`}
                  >
                    {cta}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </article>
              )
            )}
          </div>

          <blockquote className="exp-quote">
            <img
              src="/avatars/vijaye-raji.jpg"
              alt="Vijaye Raji"
              width={160}
              height={160}
              loading="lazy"
            />
            <div>
              <p>“{page.quote}”</p>
              <footer>{page.quoteBy}</footer>
            </div>
          </blockquote>
        </section>

        <section
          className="exp-section exp-residue"
          aria-labelledby="residue-title"
        >
          <div className="exp-section-head">
            <p className="exp-section-label">{page.residueLabel}</p>
            <h2 id="residue-title">{page.residueTitle}</h2>
          </div>

          <article className="exp-conversations">
            <div className="exp-residue-copy">
              <p className="exp-residue-index">01</p>
              <h3>{page.conversationsTitle}</h3>
              <p>{page.conversationsBody}</p>
              <Link href={withLanguage("/guests", lang)}>
                {page.conversationsCta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="exp-guest-strip">
              {guests[lang].map(([name, role, image, href]) => (
                <Link key={name} href={withLanguage(href, lang)}>
                  <img
                    src={image}
                    alt=""
                    width={480}
                    height={270}
                    loading="lazy"
                  />
                  <span>
                    <strong>{name}</strong>
                    <small>{role}</small>
                  </span>
                </Link>
              ))}
            </div>
          </article>

          <article className="exp-books">
            <figure>
              <img
                src="/book/growth-data-launch.webp"
                alt={
                  lang === "en"
                    ? "Yuzheng Sun and collaborators at the Growth Data Analytics Playbook launch"
                    : "孙煜征与共同作者在《Growth Data Analytics Playbook》发布现场"
                }
                width={2400}
                height={1597}
                loading="lazy"
              />
              <figcaption>
                {lang === "en"
                  ? "Growth Data Analytics Playbook launch · Featured in a 2025 WSJ CIO Journal reading list"
                  : "《Growth Data Analytics Playbook》发布活动·入选《华尔街日报》CIO Journal 2025年书单"}
              </figcaption>
            </figure>
            <div className="exp-residue-copy">
              <p className="exp-residue-index">02</p>
              <h3>{page.booksTitle}</h3>
              <p>{page.booksBody}</p>
              <Link href={withLanguage("/book", lang)}>
                <BookOpen aria-hidden="true" />
                {page.booksCta}
              </Link>
            </div>
          </article>
        </section>

        <section className="exp-closing" aria-labelledby="closing-title">
          <p className="exp-section-label">{page.closingLabel}</p>
          <h2 id="closing-title">{page.closingTitle}</h2>
          <p>{page.closingBody}</p>
          <div className="exp-actions">
            <a
              className="exp-button exp-button-primary"
              href="https://www.superlinear.academy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {page.join}
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              className="exp-button exp-button-secondary"
              href="https://ai-builders.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {page.builders}
              <ArrowUpRight aria-hidden="true" />
            </a>
            <Link
              className="exp-text-link"
              href={withLanguage("/collab", lang)}
            >
              <Handshake aria-hidden="true" />
              {page.collaborate}
            </Link>
          </div>
        </section>
      </main>

      <footer className="exp-footer">
        <div>
          <strong>Yuzheng Sun·课代表立正</strong>
          <p>{page.footer}</p>
        </div>
        <div className="exp-footer-links">
          <Link href={withLanguage("/about", lang)}>
            {lang === "en" ? "About" : "关于"}
          </Link>
          <Link href={withLanguage("/en/decks", lang)}>
            {lang === "en" ? "Decks" : "课件"}
          </Link>
          <a href="mailto:sunyuzheng@gmail.com">Email</a>
          <a href="#experiment-main">
            {lang === "en" ? "Back to top" : "回到顶部"}
          </a>
        </div>
      </footer>
    </div>
  );
}
