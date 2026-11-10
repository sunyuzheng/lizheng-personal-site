import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import {
  Dotted,
  EXTERNAL,
  Phrases,
  SectionLink,
} from "@/components/home/parts";
import { applyPageSeo } from "@/lib/seo";
import { ZHENBENSHI_PAGE_META } from "@shared/page-meta";
import { buildZhenbenshiStructuredData } from "@shared/structured-data";
import { useEffect, useState } from "react";
import { Link } from "wouter";

/*
 * The page of one book, 《真本事》, in Chinese only. It wears the site's language (see
 * components/site/subpages.css): the forest head with the book standing on its lower edge, then
 * chapters on paper under an ink rule. Three things are its own: the formula set as the heads of
 * its three columns, the contents set as a book's contents page (all 21 lessons open, so readers
 * and search engines see them without a click), and the three endorsements as rows of who and
 * what they wrote.
 */

// ─── Where the book is ───────────────────────────────────
const WEREAD_URL =
  "https://weread.qq.com/book-detail?type=1&senderVid=4500358&v=33c32d30813abb4d6g0122ff";
const JD_URL = "https://item.jd.com/14667625.html";
const COURSE_URL = "https://www.superlinear.academy/c/work-wealth/";
const BILIBILI_COURSE_URL = "https://www.bilibili.com/cheese/play/ss300796438";
const COMMUNITY_URL = "https://www.superlinear.academy";
const COMMUNITY_FEED_URL = "https://www.superlinear.academy/feed?iframe=true";

// The book's own chat (/api/chat) gave way to 问问立正 on 2026-10-05: it answers from the 《真本事》
// course texts and frameworks along with everything else Lizheng has said and written. The words
// are the ones ask.lizheng.ai and the homepage already use; the Skill stays for people who want the
// book's advisor in their own AI tools.
const ASK_LIZHENG_URL = "https://ask.lizheng.ai/";
const SKILL_REPOSITORY_URL = "https://github.com/sunyuzheng/zhenbenshi-advisor";
const SKILL_SOURCE_URL =
  "https://github.com/sunyuzheng/zhenbenshi-advisor/blob/main/SKILL.md";

// ─── What is on this page ────────────────────────────────
const SECTIONS = [
  ["核心框架", "framework"],
  ["问问立正", "advisor"],
  ["课程大纲", "outline"],
  ["封面推荐", "endorsements"],
  ["关于作者", "author"],
  ["加入社群", "community"],
] as const;

const PAINS = [
  {
    title: "陷在“仓鼠轮”",
    body: "工作越忙越看不到前景，绩效还行，却缺乏可控收入。你一直在跑，但跑道本身并不通向你想去的地方。",
  },
  {
    title: "被打分体系绑架",
    body: "害怕犯错，永远只做90%执行，没有10%突破。客体、固定、打分三种错误思维，让你把失去主动权合理化。",
  },
  {
    title: "副业无法起势",
    body: "想做副业却找不到方向，赚钱技能无处积累。因为你还没搞清楚：你到底能提供什么市场真正需要的价值？",
  },
];

const FACTORS = [
  {
    term: "了解市场",
    title: "找准|高价值问题",
    body: "读懂行业、组织、用户的真实需求。知道市场要什么，你才能知道把力气用在哪里。",
  },
  {
    term: "打造产品",
    title: "能力变成|可交付成果",
    body: "从简历到副业产品再到个人品牌，把你的能力封装成别人买得到、用得上的东西。",
  },
  {
    term: "利用杠杆",
    title: "成果放大|十倍、百倍",
    body: "借助平台、内容、AI与资本，把成果放大到更多人和更高收益。一份努力产生复利。",
  },
];

const PRACTICE = [
  {
    label: "打开认知",
    title: "拆掉思维的墙",
    body: "理解财富自由与价值创造的底层逻辑，识别并破除客体思维、固定思维、打分思维三大陷阱。",
  },
  {
    label: "形成判断",
    title: "向真正做出结果的人学",
    body: "不只听结论，也看对方经历了什么、根据什么做出选择，再用真实案例检验自己的理解。",
  },
  {
    label: "动手去做",
    title: "在真实项目里练",
    body: "用高价值任务或一个小型副业来试，看见结果，再调整下一步。理论真正用过，才会变成自己的本事。",
  },
];

const SKILL_TOOLS = [
  ["Claude Code / Codex", "把仓库作为Skill使用"],
  ["Claude / ChatGPT", "参考SKILL.md配置项目指令"],
] as const;

interface Module {
  num: string;
  title: string;
  count: string;
  /** The number of the module's first lesson; the 21 lessons count straight through. */
  from: number;
  lessons: string[];
}

const MODULES: Module[] = [
  {
    num: "一",
    title: "认知觉醒",
    count: "6课",
    from: 1,
    lessons: [
      "你从“好学生 → 好工作 → 赚大钱”的梦中醒来了吗？",
      "信息爆炸时代，如何筛选“高价值”信息？",
      "警惕客体思维：努力没回报，是这个世界的错吗？",
      "警惕固定思维：你的人生本该如此吗？",
      "警惕打分思维：事业/择偶/情感，人生可以被量化吗？",
      "改变错误思维，筑牢认知地基，走向“财务自由”",
    ],
  },
  {
    num: "二",
    title: "思维变革",
    count: "4课",
    from: 7,
    lessons: [
      "“财富自由”是可行的，前提是正确认识它",
      "破解财富自由迷思：三个常见的“破财陷阱”",
      "获得财富自由的底层逻辑",
      "打工人如何利用“个人价值”，最大化自己赢面的具体路径",
    ],
  },
  {
    num: "三",
    title: "行动升级 · 工作篇",
    count: "7课",
    from: 11,
    lessons: [
      "强者成事终极秘诀：道天地将法",
      "只有10%的工作是有意义的，工作如何抓主线？",
      "如何在工作中改变3种错误思维惯性？",
      "了解市场：公司/老板/市场，分别要什么样的人？",
      "打造产品：如何积累“手艺”，打造黄金简历？",
      "利用杠杆1：工作内外如何将个人能力变成人力资本？",
      "利用杠杆2：如何积累通向财富自由的第一桶金？",
    ],
  },
  {
    num: "四",
    title: "行动升级 · 副业篇",
    count: "4课",
    from: 18,
    lessons: [
      "来自康奈尔金融博士的科普：为何韭菜总是你？",
      "搞钱第一步：放下“暴富”心态，打造赚钱技能",
      "三步走，有效提升“赚钱行动力”",
      "课程总结：找到你的长坡厚雪",
    ],
  },
];

interface Endorser {
  quote: string;
  name: string;
  title: string;
}

const ENDORSEMENTS: Endorser[] = [
  {
    quote:
      "煜征是我见到最身体力行学习 AI、应用 AI、普及 AI 的超级个体之一。他不仅对AI有深度理解，更能把这种理解转化成判断、行动和持续的结果；他不仅自己坚持终身学习的理念，还一直通过自媒体，社群等方式去帮助千千万万的普通人。作为「群友」，经常看到他在社群里耐心回答一些素味平生朋友的小白问题，分享自己的最佳实践经验，非常让我感动。无论你是刚开始自己职业生涯的年轻人，还是希望在职业上有新突破的经验人士，这本书都能给你带来一些启发。AI 可能是人类历史上最重要的技术革命，它带给了普通人超乎寻常的能力，也会对世界带来非常重大的变革。普通人如何抓住机会，同时又避免焦虑？煜征的这本书给出了他对这个问题的思考。所以，这本书非常值得一读。",
    name: "戴雨森",
    title: "真格基金",
  },
  {
    quote:
      "在AI时代，知识与技术正在重塑个人价值的生成方式。决定一个人长期回报的，往往是能否形成可以持续放大的能力结构。孙博士结合自己在顶级科技公司的实践经验，在本书中讨论了赚钱背后的能力、选择和长期竞争力。",
    name: "刘嘉",
    title: "清华大学心理与认知科学系主任",
  },
  {
    quote:
      "我在硅谷做了二十多年高管和投资人，见过很多聪明人，煜征是少数让我印象深刻的学习能力极强、又很愿意分享学习结果的那一类。他不只履历漂亮，而更重要的是，他既能想明白，又能做到。我们做过十多次深度对话，每次他都能抓到问题的重点，进行深度思考，挖掘到我身上真正有价值的经验；并在工作、创业、投资中，把这些经验融会贯通。所以，他既能做出紧跟时代的选择，又能长期耕耘，做出有护城河的结果，而这本书是他真金白银换、长期思考带来的认知，值得每个人认真读。",
    name: "硅谷徐老师",
    title: "GEN（财富500强企业）· 首席AI官、投资人、斯坦福商学院客座讲师",
  },
];

const AUTHOR_FACTS = [
  "康奈尔大学经济学博士；曾在Amazon任经济学家、在Meta任数据科学家、在腾讯IEG任增长数据科学与AI总监",
  "OpenAI收购团队早期成员；曾任Statsig Principal Data Scientist及公司唯一evangelist",
  "Superlinear Academy创始人，长期从事AI教育、社区与企业实践",
  // The joiner keeps 著有 with the title after it, so the line turns at the comma.
  "截至2026年8月，累计完成200+场公开对话；合著《Growth Data Analytics Playbook》，著\u2060有《真本事》",
  "现居西雅图",
];

const FAQ = [
  {
    q: "这本书适合哪些人？",
    a: "适合想跳出职场内卷、打造副业现金流、或准备职业转型的知识型工作者。无论你处于职场初中期还是管理层，都能在书中找到可落地的策略。书的核心是一套可操作的分析框架。",
  },
  {
    q: "在哪里可以购买这本书？",
    a: "已出版纸质书，并上线微信读书。可在微信读书搜索《真本事》，纸质书可在京东购买。",
  },
  {
    q: "副业会不会影响主业表现？",
    a: "书中强调“工作是资本，副业是实验室”。通过抓住10%高价值任务，你反而能在主业中更快成长，并将经验投射到副业变现。二者可以相互促进。",
  },
  {
    q: "是否提供线下活动或一对一辅导？",
    a: "页面下方可以直接浏览Superlinear Academy免费社区，具体活动以社区当期公告为准。如有合作或讲座需求，欢迎发邮件至yz@superlinear.academy。",
  },
];

function Arrow() {
  return <i aria-hidden="true">→</i>;
}

/**
 * A short title in book-title marks, 《真本事》, stays on one line: word joiners between its
 * characters, the same device that keeps 东西里来 together further down.
 */
function keepTitles(text: string) {
  return text.replace(/《[^》]{1,6}》/g, title =>
    Array.from(title).join("\u2060")
  );
}

/** The repository's address goes to the clipboard; the button says so for two seconds. */
function CopyRepository() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(SKILL_REPOSITORY_URL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button type="button" className="btn btn-line" onClick={copy}>
      <span aria-live="polite">{copied ? "已复制 ✓" : "复制仓库地址"}</span>
    </button>
  );
}

export default function ZhenbenShi() {
  useEffect(() => {
    return applyPageSeo({
      ...ZHENBENSHI_PAGE_META,
      type: "book",
      locale: "zh_CN",
      jsonLd: buildZhenbenshiStructuredData(),
    });
  }, []);

  return (
    <div className="lz-site lz-home lz-sub" lang="zh-CN">
      {/* The page is in Chinese only: the language switch leads to this book on the English shelf. */}
      <SiteHeader current="book" languageHref="/en/books#zbs" />

      <main>
        {/* ── The book ── */}
        <section className="forest-head book-head grain">
          <div className="wrap">
            <nav className="crumb" aria-label="位置">
              <Link href="/books">书</Link>
              <span aria-hidden="true">/</span>
              <span>真本事</span>
            </nav>

            <div className="cols2">
              <div className="words">
                <div className="eyebrow">由同名B站课程扩写成书</div>
                <h1>
                  <span className="line">
                    <span className="open">《</span>真本事：
                  </span>
                  <span className="line">从会工作到会赚钱》</span>
                </h1>
                <p className="lede">把工作变成能力，把能力变成收入</p>

                <div className="cta-row">
                  <a className="btn btn-ivory" href={WEREAD_URL} {...EXTERNAL}>
                    微信读书
                  </a>
                  <a className="btn btn-line" href={JD_URL} {...EXTERNAL}>
                    京东购买
                  </a>
                  <a className="lz-link" href={COURSE_URL} {...EXTERNAL}>
                    购买课程 <Arrow />
                  </a>
                </div>

                {/* A colophon, one fact to a line, as on the shelf. */}
                <ul className="colophon">
                  <li>
                    <Dotted text="孙煜征 著 · 已出版纸质书，并上线微信读书" />
                  </li>
                  <li>
                    <Dotted text="人民邮电出版社 · 2026年4月 · ISBN 9787115690500" />
                  </li>
                </ul>
              </div>

              <div className="plinth">
                <img
                  src="/book/cover-front.png"
                  alt="《真本事：从会工作到会赚钱》"
                  width={846}
                  height={1200}
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What is further down: the six stops the page's own menu used to hold. */}
        <nav className="toc" aria-label="本页内容">
          <div className="wrap">
            <ul>
              {SECTIONS.map(([label, id]) => (
                <li key={id}>
                  <SectionLink to={id}>{label}</SectionLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ── Where readers are stuck ── */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">认知觉醒</div>
                <h2>
                  <Phrases text="你明明努力，却仍在原地踏步？" />
                </h2>
                <p className="say">
                  很多时候，真正卡住人的，是努力方向和反馈质量。
                </p>
              </div>
              <ul className="points">
                {PAINS.map(item => (
                  <li key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── The formula: each factor heads its own column ── */}
        <section id="framework" className="sec ruled">
          <div className="wrap">
            <div className="eyebrow">核心框架</div>
            <h2 className="formula-name">个人价值公式</h2>

            <div className="formula-set">
              <p className="formula">
                <span className="lhs">
                  个人价值<span className="op">＝</span>
                </span>
                {FACTORS.map((factor, index) => (
                  <span key={factor.term} className="term">
                    {index > 0 && <span className="op">×</span>}
                    {factor.term}
                  </span>
                ))}
              </p>
              <div className="factors">
                {FACTORS.map(factor => (
                  <div key={factor.term} className="factor">
                    {/* The factor's name again, for a phone, where the columns no longer hang under the formula. */}
                    <p className="t">{factor.term}</p>
                    <h3>
                      <Phrases text={factor.title} />
                    </h3>
                    <p>{factor.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── From knowing to doing: three steps, in order ── */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">怎样练出本事</div>
                <h2>从理解到会做</h2>
                <p className="say">
                  光靠读书不够。你得在真实项目里试、得到反馈，再调整下一步。
                </p>
              </div>
              <ol className="points practice">
                {PRACTICE.map(step => (
                  <li key={step.label}>
                    <div>
                      <p className="t">{step.label}</p>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── 问问立正, and the book's advisor as a Skill ── */}
        <section id="advisor" className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">AI问答</div>
                <h2>问问立正</h2>
                {/* Word joiners keep 东西里来 together, so a phone breaks the line at the comma. */}
                <p className="say">
                  {
                    "回答只从立正讲过、写过的东⁠西⁠里⁠来，每一段都能点回原文。"
                  }
                </p>
                <div className="cta-row">
                  <a className="btn btn-green" href={ASK_LIZHENG_URL}>
                    去问问立正
                  </a>
                </div>
                <p className="mail">这是AI回答，不是立正本人实时回复。</p>
              </div>
              <div>
                {/* What the two rows under it are: the book's advisor as an open Skill. */}
                <p className="lead-in">把这本书的顾问装进你自己的AI工具</p>
                <ul className="points tools">
                  {SKILL_TOOLS.map(([tool, use]) => (
                    <li key={tool}>
                      <h3 lang="en">{tool}</h3>
                      <p>{use}</p>
                    </li>
                  ))}
                </ul>
                <div className="cta-row">
                  <CopyRepository />
                  <a className="lz-link" href={SKILL_SOURCE_URL} {...EXTERNAL}>
                    查看Skill源文件 <Arrow />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── The contents, set as a book's contents page ── */}
        <section id="outline" className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">课程大纲</div>
                <h2>
                  <Phrases text="21课，4大模块" />
                </h2>
              </div>
              <div>
                <p>
                  从认知觉醒到行动落地，完整路径清晰可循。课程与书相互映照，书是课程的深度延伸。
                </p>
                <a className="lz-link" href={BILIBILI_COURSE_URL} {...EXTERNAL}>
                  在B站观看课程 <Arrow />
                </a>
              </div>
            </div>

            <div className="contents">
              {[MODULES.slice(0, 2), MODULES.slice(2)].map((column, index) => (
                <div key={index}>
                  {column.map(mod => (
                    <section key={mod.num} className="module">
                      <h3>
                        <span className="n">{mod.num}</span>
                        <span>{mod.title}</span>
                        <small>{mod.count}</small>
                      </h3>
                      <ol>
                        {mod.lessons.map((lesson, i) => (
                          <li key={lesson}>
                            <span className="no">
                              {String(mod.from + i).padStart(2, "0")}
                            </span>
                            <span>{lesson}</span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who put their name on the cover ── */}
        <section id="endorsements" className="sec ruled">
          <div className="wrap">
            <div className="head solo">
              <div>
                <div className="eyebrow">封面推荐</div>
                <h2>他们为这本书背书</h2>
              </div>
            </div>

            <ul className="blurbs">
              {ENDORSEMENTS.map(e => (
                <li key={e.name}>
                  <figure>
                    <figcaption>
                      <b>{e.name}</b>
                      <small>{e.title}</small>
                    </figcaption>
                    <blockquote>
                      <span className="mark" aria-hidden="true">
                        “
                      </span>
                      {e.quote}
                      <span aria-hidden="true">”</span>
                    </blockquote>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── The author ── */}
        <section id="author" className="sec ruled">
          <div className="wrap">
            <div className="author">
              <figure className="face">
                <img
                  src="/book/author-960.webp"
                  alt="孙煜征博士"
                  width={960}
                  height={960}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>孙煜征 博士</figcaption>
              </figure>

              <div>
                <div className="eyebrow">关于作者</div>
                <h2>孙煜征</h2>
                <p className="say">
                  <Dotted text="康奈尔大学经济学博士 · Superlinear Academy · 创始人 · 作者" />
                </p>

                <ul className="points">
                  {AUTHOR_FACTS.map(item => (
                    <li key={item}>{keepTitles(item)}</li>
                  ))}
                </ul>

                <p className="note">
                  合著《Growth Data Analytics Playbook》入选《华尔街日报》CIO
                  Journal 2025年书单
                </p>

                <Link className="lz-link" href="/">
                  个人主页：lizheng.ai <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── The community, live ── */}
        <section id="community" className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">Superlinear社群</div>
                <h2>
                  <Phrases text="在免费社区里|把书里的方法用起来" />
                </h2>
              </div>
              <p>
                Superlinear
                Academy长期免费开放。你可以带着书里的框架和自己的真实问题，看看其他人怎样实践，也把自己的尝试放进讨论。
              </p>
            </div>

            <div className="feed">
              <iframe
                src={COMMUNITY_FEED_URL}
                title="Superlinear社群"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ── Questions ── */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">常见问题</div>
                <h2>你可能想问的</h2>
              </div>
              <ul className="points">
                {FAQ.map(item => (
                  <li key={item.q}>
                    <h3>{item.q}</h3>
                    <p>{keepTitles(item.a)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Where to read on: the page closes on the forest it opened on ── */}
        <section id="purchase" className="sec band closing grain">
          <div className="wrap">
            <div className="split">
              <h2>
                <Phrases text="想继续读，从这里开始" />
              </h2>
              <div>
                <p className="say first">
                  可以在微信读书阅读，也可以购买纸质书。想看别人如何把这些方法用起来，也欢迎进入Superlinear社区。
                </p>
                <div className="cta-row">
                  <a className="btn btn-ivory" href={WEREAD_URL} {...EXTERNAL}>
                    微信读书
                  </a>
                  <a className="btn btn-line" href={JD_URL} {...EXTERNAL}>
                    京东购买
                  </a>
                  <a className="lz-link" href={COMMUNITY_URL} {...EXTERNAL}>
                    加入Superlinear社群 <Arrow />
                  </a>
                </div>
                <p className="mail">
                  ©{" "}
                  <span suppressHydrationWarning>
                    {new Date().getFullYear()}
                  </span>{" "}
                  <Dotted text="Superlinear Academy · 《真本事》版权所有 · 孙煜征" />
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
