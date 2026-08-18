import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  RotateCcw,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { chapters, guests, proof, workItems } from "./HomeExperiment";

if (typeof window !== "undefined") {
  void import("./home-experiment-emil.css");
}

const emilCopy = {
  en: {
    study: "Emil Kowalski / animations.dev study · Independent experiment",
    name: "Yuzheng Sun · 课代表立正",
    nav: [
      ["#idea", "The idea"],
      ["#record", "The record"],
      ["#work", "The work"],
    ],
    language: "Language",
    intro:
      "AI makes building easier. I am interested in the harder part: choosing what deserves to exist, then staying long enough to make it unmistakably yours.",
    sub: "I am building Superlinear Academy around that question, and putting my own work under the same standard.",
    explore: "Enter the work",
    community: "Join the free community",
    stageLabel: "A work becomes itself through revision",
    revisionLabel: "Revision",
    restart: "Return to the first version",
    ideaEyebrow: "One idea, allowed to move",
    ideaTitle: "The first version is an opening, not an identity.",
    ideaBody:
      "AI can get almost anyone to plausible. What remains scarce is judgment: what to make, what to refuse, what reality is teaching you, and which standard should survive the revision.",
    choosePrompt: "Move through the making loop",
    recordEyebrow: "A career is also a sequence of revisions",
    recordTitle: "The path changed when winning stopped being enough.",
    recordBody:
      "Each chapter added a different constraint: explain clearly, take responsibility, leave the known game, and keep consequential beliefs answerable to evidence.",
    selectChapter: "Select a chapter",
    publicJudgment: "A judgment left in public",
    publicJudgmentTitle:
      "Before GPT-4, I argued that AI had begun to break the old paradigm’s ceiling.",
    publicJudgmentBody:
      "The original probabilities remain public. So do the two major errors I added later.",
    publicJudgmentCta: "Read the original argument and review",
    workEyebrow: "The long-term wager",
    workTitle:
      "Superlinear is not one product. It is one question in four forms.",
    workBody:
      "How do people with real professional depth turn judgment into work, products, and ventures of their own?",
    selectWork: "Choose a part of Superlinear",
    conversationsEyebrow: "Work that keeps moving",
    conversationsTitle:
      "Conversations and books carry judgment beyond the room.",
    conversationsBody:
      "More than 200 public conversations and two books keep doing useful work after the recording, class, or launch is over.",
    browse: "Browse all conversations",
    books: "Explore both books",
    closingEyebrow: "Your next version",
    closingTitle: "Your defining work will not arrive finished.",
    closingBody:
      "Start before the identity feels settled. Let peers, users, materials, and reality answer back. Keep the standard; change the answer.",
    join: "Join Superlinear Academy",
    collab: "Collaborate with me",
  },
  zh: {
    study: "Emil Kowalski / animations.dev原生实验·独立试验页",
    name: "课代表立正·孙煜征",
    nav: [
      ["#idea", "主张"],
      ["#record", "经历"],
      ["#work", "作品"],
    ],
    language: "语言",
    intro:
      "AI让做东西变得更容易。我更在意后面那个难得多的问题：什么值得被做出来，又怎样在一次次修改里，最终变成只有你能做出的东西。",
    sub: "我正在围绕这个问题建设Superlinear Academy，也把自己的作品放在同一套标准下。",
    explore: "进入这件作品",
    community: "免费加入社区",
    stageLabel: "作品在修改里慢慢成为自己",
    revisionLabel: "版本",
    restart: "回到第一版",
    ideaEyebrow: "一个会继续变化的主张",
    ideaTitle: "第一版只是开头，不是作品的身份。",
    ideaBody:
      "AI可以让几乎所有人迅速做到“像那么回事”。真正稀缺的仍然是判断：做什么、不做什么、现实究竟在告诉你什么，以及哪一个标准不该在修改中丢掉。",
    choosePrompt: "走一遍作品成立的过程",
    recordEyebrow: "职业也是一连串版本",
    recordTitle: "当“赢”不再足够，这条路才真正开始改变。",
    recordBody:
      "每一段经历都增加了一种约束：把结构讲清楚，承担组织责任，离开熟悉的游戏，并让重要判断一直面对证据。",
    selectChapter: "选择一段经历",
    publicJudgment: "一条公开留下的判断",
    publicJudgmentTitle: "GPT-4发布前，我判断AI已经开始突破旧范式的能力上限。",
    publicJudgmentBody:
      "当时给出的概率至今公开，后来复盘的两处重大错误也仍然留在原文里。",
    publicJudgmentCta: "阅读原文与后续复盘",
    workEyebrow: "一场长期下注",
    workTitle: "Superlinear不是一个产品，而是同一个问题的四种形态。",
    workBody: "有真实专业积累的人，怎样把自己的判断变成作品、产品和事业？",
    selectWork: "选择Superlinear的一部分",
    conversationsEyebrow: "离开现场以后",
    conversationsTitle: "对话和书，让判断在现场之外继续流动。",
    conversationsBody:
      "200+场公开对话和两本书，在录制、课程与发布结束以后，依然可以被别人使用。",
    browse: "查看全部嘉宾访谈",
    books: "查看两本书",
    closingEyebrow: "你的下一个版本",
    closingTitle: "你的代表作，不会一开始就是代表作。",
    closingBody:
      "不必等身份完全确定再开始。让同行、用户、材料和现实回答你；守住标准，也允许答案改变。",
    join: "免费加入Superlinear Academy",
    collab: "与我合作",
  },
};

const revisions = {
  en: [
    {
      label: "The first version",
      title: "Make the thought tangible.",
      body: "A draft creates something reality can finally answer.",
    },
    {
      label: "Reality answers",
      title: "Notice what resists.",
      body: "Users, materials, constraints, and disagreement reveal the actual problem.",
    },
    {
      label: "The next version",
      title: "Change the answer, not the standard.",
      body: "Revision is where judgment becomes visible and the work begins to carry its maker.",
    },
    {
      label: "What lasts",
      title: "Keep earning another life.",
      body: "The work remains useful, keeps meeting new contexts, and continues to represent its maker.",
    },
  ],
  zh: [
    {
      label: "第一版",
      title: "先把想法变成看得见的东西。",
      body: "只有做出来，现实才终于有机会回答你。",
    },
    {
      label: "现实回答",
      title: "看见那些不肯配合你的地方。",
      body: "用户、材料、约束与分歧，会把真正的问题慢慢暴露出来。",
    },
    {
      label: "下一个版本",
      title: "改变答案，但不轻易放弃标准。",
      body: "判断在修改里变得可见，作品也开始真正带上做出它的人。",
    },
    {
      label: "经得起时间",
      title: "继续为自己的下一次生命赢得理由。",
      body: "作品仍然有用，仍然能进入新的语境，也仍然代表那个做出它的人。",
    },
  ],
};

const makingSteps = {
  en: [
    ["Choose", "A problem worth your years."],
    ["Make", "A version reality can touch."],
    ["Listen", "To users, constraints, and disagreement."],
    ["Revise", "The answer without abandoning the standard."],
  ],
  zh: [
    ["选择", "一个值得投入很多年的问题。"],
    ["做出", "一个现实终于可以触碰的版本。"],
    ["听见", "用户、约束与分歧的回答。"],
    ["修改", "改变答案，但不轻易放弃标准。"],
  ],
};

function EmilLanguageSwitch() {
  const { lang, setLang } = useLanguage();
  const [location] = useLocation();

  return (
    <div
      className="emil-language"
      role="group"
      aria-label={emilCopy[lang].language}
    >
      <Link
        href={withLanguage(location, "en")}
        hrefLang="en"
        aria-current={lang === "en" ? "page" : undefined}
        onClick={() => setLang("en")}
      >
        EN
      </Link>
      <Link
        href={withLanguage(location, "zh")}
        hrefLang="zh-CN"
        aria-current={lang === "zh" ? "page" : undefined}
        onClick={() => setLang("zh")}
      >
        中文
      </Link>
    </div>
  );
}

export default function HomeExperimentEmil() {
  const { lang } = useLanguage();
  const copy = emilCopy[lang];
  const [activeRevision, setActiveRevision] = useState(0);
  const [activeIdea, setActiveIdea] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeWork, setActiveWork] = useState(0);

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
        ? "Emil Motion Study · Yuzheng Sun"
        : "Emil动效原生实验 · 课代表立正";
    robots.content = "noindex, nofollow";
    theme.content = "#f3f1ec";

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

  const revision = revisions[lang][activeRevision];
  const chapter = chapters[lang][activeChapter];
  const work = workItems[lang][activeWork];
  const idea = makingSteps[lang][activeIdea];

  return (
    <div className="emil-page">
      <a className="emil-skip" href="#emil-main">
        {lang === "en" ? "Skip to content" : "跳到正文"}
      </a>

      <div className="emil-study-bar">
        <span>{copy.study}</span>
        <Link href={withLanguage("/experiment/vercel", lang)}>
          {lang === "en" ? "Compare the Vercel study" : "对比Vercel版"}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <header className="emil-header">
        <Link href={withLanguage("/", lang)} className="emil-brand">
          <span className="emil-brand-dot" aria-hidden="true" />
          {copy.name}
        </Link>
        <nav
          aria-label={lang === "en" ? "Experiment navigation" : "实验版导航"}
        >
          {copy.nav.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <EmilLanguageSwitch />
      </header>

      <main id="emil-main">
        <section className="emil-hero" aria-labelledby="emil-title">
          <div className="emil-hero-copy">
            <p className="emil-kicker">{copy.name}</p>
            <h1 id="emil-title">
              {lang === "en" ? (
                <>
                  <span>Make what</span>
                  <span className="emil-hand-mark">lasts.</span>
                </>
              ) : (
                <>
                  <span>做出你的</span>
                  <span className="emil-hand-mark">代表作。</span>
                </>
              )}
            </h1>
            <p className="emil-hero-intro">{copy.intro}</p>
            <p className="emil-hero-sub">{copy.sub}</p>
            <div className="emil-actions">
              <a className="emil-button emil-button-dark" href="#work">
                {copy.explore}
                <ArrowDown aria-hidden="true" />
              </a>
              <a
                className="emil-button emil-button-light"
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.community}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="emil-stage">
            <figure>
              <img
                src="/hero/acquired-behind-scenes-desktop.webp"
                alt={
                  lang === "en"
                    ? "Yuzheng Sun in conversation with Ben Gilbert and David Rosenthal of Acquired"
                    : "孙煜征与Acquired的Ben Gilbert、David Rosenthal对谈"
                }
                width={2400}
                height={1600}
              />
              <figcaption>
                {lang === "en"
                  ? "With Ben Gilbert and David Rosenthal of Acquired"
                  : "与Acquired的Ben Gilbert、David Rosenthal对谈"}
              </figcaption>
            </figure>

            <div className="emil-revision-card" aria-live="polite">
              <div className="emil-card-topline">
                <span>{copy.revisionLabel}</span>
                <span>{String(activeRevision + 1).padStart(2, "0")} / 04</span>
              </div>
              <div
                className="emil-revision-content"
                key={`${lang}-${activeRevision}`}
              >
                <p>{revision.label}</p>
                <h2>{revision.title}</h2>
                <span>{revision.body}</span>
              </div>
              <div className="emil-revision-controls">
                {revisions[lang].map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={`${copy.revisionLabel} ${index + 1}: ${item.label}`}
                    aria-pressed={activeRevision === index}
                    onClick={() => setActiveRevision(index)}
                  >
                    <span />
                  </button>
                ))}
                <button
                  className="emil-reset"
                  type="button"
                  aria-label={copy.restart}
                  onClick={() => setActiveRevision(0)}
                >
                  <RotateCcw aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="emil-proof-row"
            aria-label={lang === "en" ? "Selected proof" : "关键事实"}
          >
            {proof[lang].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section
          id="idea"
          className="emil-section emil-idea"
          aria-labelledby="emil-idea-title"
        >
          <div className="emil-section-heading">
            <p>{copy.ideaEyebrow}</p>
            <h2 id="emil-idea-title">{copy.ideaTitle}</h2>
            <span>{copy.ideaBody}</span>
          </div>

          <div className="emil-idea-player">
            <p>{copy.choosePrompt}</p>
            <div
              className="emil-step-tabs"
              role="group"
              aria-label={copy.choosePrompt}
            >
              {makingSteps[lang].map(([title], index) => (
                <button
                  key={title}
                  type="button"
                  aria-pressed={activeIdea === index}
                  onClick={() => setActiveIdea(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {title}
                </button>
              ))}
            </div>
            <div className="emil-idea-panel" key={`${lang}-${activeIdea}`}>
              <span>{String(activeIdea + 1).padStart(2, "0")}</span>
              <h3>{idea[0]}</h3>
              <p>{idea[1]}</p>
              <div className="emil-idea-line" aria-hidden="true">
                <i style={{ width: `${((activeIdea + 1) / 4) * 100}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section
          id="record"
          className="emil-section emil-record"
          aria-labelledby="emil-record-title"
        >
          <div className="emil-section-heading emil-section-heading-light">
            <p>{copy.recordEyebrow}</p>
            <h2 id="emil-record-title">{copy.recordTitle}</h2>
            <span>{copy.recordBody}</span>
          </div>

          <div className="emil-record-player">
            <p>{copy.selectChapter}</p>
            <div
              className="emil-chapter-tabs"
              role="group"
              aria-label={copy.selectChapter}
            >
              {chapters[lang].map(([marker], index) => (
                <button
                  key={marker}
                  type="button"
                  aria-pressed={activeChapter === index}
                  onClick={() => setActiveChapter(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {marker}
                </button>
              ))}
            </div>
            <article
              className="emil-chapter-panel"
              key={`${lang}-${activeChapter}`}
            >
              <div>
                <span>{chapter[0]}</span>
                <span>
                  {activeChapter + 1} / {chapters[lang].length}
                </span>
              </div>
              <h3>{chapter[1]}</h3>
              <p>{chapter[2]}</p>
            </article>
          </div>

          <article className="emil-public-judgment">
            <div className="emil-judgment-icon" aria-hidden="true">
              <Check />
            </div>
            <div>
              <p>{copy.publicJudgment}</p>
              <h3>{copy.publicJudgmentTitle}</h3>
              <span>{copy.publicJudgmentBody}</span>
            </div>
            <a
              href="https://www.superlinear.academy/c/ai-resources/chatgpt"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.publicJudgmentCta}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </article>
        </section>

        <section
          id="work"
          className="emil-section emil-work"
          aria-labelledby="emil-work-title"
        >
          <div className="emil-section-heading">
            <p>{copy.workEyebrow}</p>
            <h2 id="emil-work-title">{copy.workTitle}</h2>
            <span>{copy.workBody}</span>
          </div>

          <div className="emil-work-player">
            <p>{copy.selectWork}</p>
            <div
              className="emil-work-tabs"
              role="tablist"
              aria-label={copy.selectWork}
            >
              {workItems[lang].map(([number, title], index) => (
                <button
                  key={number}
                  type="button"
                  role="tab"
                  aria-selected={activeWork === index}
                  aria-controls="emil-work-panel"
                  onClick={() => setActiveWork(index)}
                >
                  <span>{number}</span>
                  {title}
                </button>
              ))}
            </div>
            <article
              id="emil-work-panel"
              className="emil-work-panel"
              role="tabpanel"
              key={`${lang}-${activeWork}`}
            >
              <div className="emil-work-number">{work[0]}</div>
              <div>
                <p>{work[2]}</p>
                <h3>{work[1]}</h3>
                <span>{work[3]}</span>
              </div>
              <a href={work[4]} target="_blank" rel="noopener noreferrer">
                {work[5]}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </article>
          </div>

          <div className="emil-work-photos">
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
              <figcaption>
                {lang === "en"
                  ? "Building AI Builders with Yage"
                  : "与鸭哥共同建设AI Builders"}
              </figcaption>
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
              <figcaption>
                {lang === "en"
                  ? "DoorDash team training · Seattle"
                  : "DoorDash团队培训·西雅图"}
              </figcaption>
            </figure>
          </div>
        </section>

        <section
          className="emil-section emil-archive"
          aria-labelledby="emil-archive-title"
        >
          <div className="emil-section-heading">
            <p>{copy.conversationsEyebrow}</p>
            <h2 id="emil-archive-title">{copy.conversationsTitle}</h2>
            <span>{copy.conversationsBody}</span>
          </div>

          <div className="emil-guest-row">
            {guests[lang].map(([name, role, image, href], index) => (
              <Link
                key={name}
                href={withLanguage(href, lang)}
                style={
                  {
                    "--emil-tilt": `${(index - 1.5) * 0.35}deg`,
                  } as CSSProperties
                }
              >
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
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="emil-archive-actions">
            <Link href={withLanguage("/guests", lang)}>
              {copy.browse}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={withLanguage("/book", lang)}>
              <BookOpen aria-hidden="true" />
              {copy.books}
            </Link>
          </div>
        </section>

        <section className="emil-closing" aria-labelledby="emil-closing-title">
          <p>{copy.closingEyebrow}</p>
          <h2 id="emil-closing-title">{copy.closingTitle}</h2>
          <span>{copy.closingBody}</span>
          <div className="emil-actions">
            <a
              className="emil-button emil-button-dark"
              href="https://www.superlinear.academy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.join}
              <ArrowUpRight aria-hidden="true" />
            </a>
            <Link
              className="emil-button emil-button-light"
              href={withLanguage("/collab", lang)}
            >
              {copy.collab}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="emil-footer">
        <strong>Yuzheng Sun·课代表立正</strong>
        <span>
          {lang === "en"
            ? "Cornell Economics PhD · Founder of Superlinear Academy"
            : "康奈尔大学经济学博士·Superlinear Academy创始人"}
        </span>
        <a href="#emil-main">{lang === "en" ? "Back to top" : "回到顶部"}</a>
      </footer>
    </div>
  );
}
