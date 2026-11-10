import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import {
  Dotted,
  EXTERNAL,
  Phrases,
  SectionLink,
} from "@/components/home/parts";
import { applyPageSeo } from "@/lib/seo";
import { guestsZh } from "@shared/guest-facts";
import { ZHENBENSHI_PAGE_META } from "@shared/page-meta";
import { buildZhenbenshiStructuredData } from "@shared/structured-data";
import { useEffect, useState } from "react";
import { Link } from "wouter";

/*
 * The page of one book, 《真本事》, in Chinese only. It wears the site's language (see
 * components/site/subpages.css): the forest head with the book standing on its lower edge, then
 * chapters on paper under an ink rule. Three things are its own: the formula set as the heads of
 * its three columns, the contents set as a book's contents page (all 21 chapters open, so readers
 * and search engines see them without a click), and the three endorsements as rows of who and
 * what they wrote.
 *
 * The words are the book's (rewritten 2026-11-10 from the printed text): the opening is the
 * preface's two scenes, the three reasons are the preface's, each factor of the formula carries a
 * passage from its chapter, and the contents are the book's own 21 chapters. Until then the page
 * showed the Bilibili course's 21 lessons as the outline and quoted a line the book does not
 * contain; the course the book grew out of now has one line of its own under the contents.
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
  ["目录", "outline"],
  ["问问立正", "advisor"],
  ["封面推荐", "endorsements"],
  ["关于作者", "author"],
  ["加入社区", "community"],
] as const;

// From the preface (从“天选打工人”到人生无限游戏), shortened; the title he gives himself there is
// 腾讯数据科学副总监.
const ORIGIN = [
  "35岁前，我用“天选打工人”介绍自己：康奈尔经济学博士、亚马逊经济学家、Meta数据科学家、腾讯副总监。有一次活动，主持人问我这个问题，我搜肠刮肚，找不到答案。",
  "后来在美国出差，我在麦当劳看到一条招聘横幅：时薪17.5美元。我认真地把这份工作和自己的工作放上天平的两端。它不用费脑费心，不用担心被裁，下班以后也不用盯着企业微信。再高的薪水，再高的社会地位，都压不过自由这个砝码。",
  // Word joiners keep 以后弄明白的事 together, so a phone never leaves 的事 alone on the last line.
  "这本书写的，是我跳下“仓鼠轮”以\u2060后\u2060弄\u2060明\u2060白\u2060的\u2060事。",
];

// The preface's 是什么在阻碍我们拿到结果？
const REASONS = [
  {
    title: "认知有局限",
    body: "从小被植入的思维模式，让我们误解了工作、职场和商业的规则。规则理解错了，时间和精力就耗在没有回报的事情上。",
  },
  {
    title: "缺少有效的指导",
    body: "大佬的经验往往不适用于普通人。不少“导师”的主要收入就来自“做导师”，道理听起来都对，却落不了地。",
  },
  {
    title: "抓不住重点",
    body: "时间和精力有限，得聚焦在当下最重要的事上。什么最重要，往往只有处境相似的过来人说得清。",
  },
];

const FACTORS = [
  {
    term: "了解市场",
    title: "先弄清|每道题值多少钱",
    body: "书里有个思想实验：面前有一万道题，每道题的价格用阿拉伯文标着。最该做的不是挑最擅长的那道，而是先学阿拉伯语。个人价值，由市场需求决定。",
  },
  {
    term: "打造产品",
    title: "把能力做成|别人用得上的东西",
    body: "用做产品的思路经营自己，积累才有复利。书里拿一份简历从头讲：先了解市场，再打造产品。",
  },
  {
    term: "利用杠杆",
    title: "让同一份力气|走得更远",
    body: "投资里的杠杆，风险和收益一起放大。职场里常常不对称：事情做成了，上升空间很大；做砸了，后果往往有限。所以要学会识别杠杆。",
  },
];

const SKILL_TOOLS = [
  ["Claude Code / Codex", "把仓库作为Skill使用"],
  ["Claude / ChatGPT", "参考SKILL.md配置项目指令"],
] as const;

interface Part {
  num: string;
  title: string;
  count: string;
  /** The number of the part's first chapter; the 21 chapters count straight through. */
  from: number;
  chapters: string[];
}

// The book's contents page (人民邮电出版社, 2026), titles as printed.
const PARTS: Part[] = [
  {
    num: "上",
    title: "认知觉醒",
    count: "10章",
    from: 1,
    chapters: [
      "从“好学生→好工作→赚大钱”的梦中醒来",
      "学习的正确方法——告别校园思维，拥抱真实世界",
      "警惕客体思维，学会对自己负责",
      "警惕固定型思维——解锁成功的底层代码，释放人生潜力",
      "警惕打分思维——接纳世界的多样和复杂",
      "重塑思维模式，开启你的财务自由之路",
      "通往财务自由之路——重塑你的财富观",
      "投资的陷阱：金钱、时间和人生的无底洞",
      "个人价值公式——从会工作到会赚钱的核心",
      "从理想到行动——实现个人价值的具体路径",
    ],
  },
  {
    num: "下",
    title: "知行合一",
    count: "11章",
    from: 11,
    chapters: [
      "选择的智慧：用“道、天、地、将、法”规划你的职业发展",
      "抓住工作中10%的核心价值",
      "洞悉商业本质：实现增长的核心法则",
      "跨过阻碍，了解真正的市场",
      "产品打造方法论：以简历为例",
      "利用杠杆：放大影响力与加速成长",
      "职场中的“元能力”——沟通",
      "投资：少踩坑、建体系，理解市场并穿越喧嚣",
      "赚钱：一项需要磨炼的技能",
      "告别空想：将赚钱意愿转化为行动",
      "找到属于你的“长坡厚雪”：坚持与自我认知",
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
  "康奈尔大学经济学博士；曾在Amazon任经济学家、在Meta任数据科学家、在腾讯IEG任数据与AI副总监",
  "OpenAI收购团队早期成员；曾任Statsig Principal Data Scientist及公司唯一布道师",
  "超线性学院（Superlinear Academy）创始人，长期从事AI教育、社区与企业实践",
  // The joiners keep 著有 and 合著 with the title after them, so the line turns at a comma.
  `2020年以来与${guestsZh()}嘉宾公开对话；著\u2060有《真本事》和英文书《Feels Like Progress》，合\u2060著《Growth Data Analytics Playbook》`,
  "现居西雅图",
];

const FAQ = [
  {
    q: "这本书适合哪些人？",
    a: "写给按规则努力工作、却发现离自己想要的生活越来越远的人。上篇讲认知，下篇讲工作和赚钱的具体方法。",
  },
  {
    q: "在哪里可以购买这本书？",
    a: "已出版纸质书，并上线微信读书。可在微信读书搜索《真本事》，纸质书可在京东购买。",
  },
  {
    q: "副业会不会影响主业表现？",
    // The preface's 为什么要“先工作，后赚钱”, and chapter 12.
    a: "书里的顺序是“先工作，后赚钱”：本职工作给你一个好的起点和成长的平台；副业让你更真实地直面商业规则，再慢慢发展成自己的事业。第十二章讲怎样抓住工作中10%的核心价值，把时间和精力腾出来。",
  },
  {
    q: "是否提供线下活动或一对一辅导？",
    a: "这一页上面可以直接浏览超线性学院免费社区，具体活动以社区当期公告为准。如有合作或讲座需求，欢迎发邮件至yz@superlinear.academy。",
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
                <p className="lede">
                  <Phrases text="拿掉证书、职位和公司名以后，|你还真正会什么？" />
                </p>
                <p className="aside">把工作变成能力，把能力变成收入。</p>

                {/* The book's two shops. The course it grew out of is under the contents. */}
                <div className="cta-row">
                  <a className="btn btn-ivory" href={WEREAD_URL} {...EXTERNAL}>
                    微信读书
                  </a>
                  <a className="btn btn-line" href={JD_URL} {...EXTERNAL}>
                    京东购买
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

        {/* ── Where the book comes from: two scenes from its preface, then its three reasons ── */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="split">
              <div>
                <div className="eyebrow">这本书从哪里来</div>
                <h2>
                  <Phrases text="如果不考虑钱，|你最想做什么？" />
                </h2>
              </div>
              <div className="story">
                {ORIGIN.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <p className="lead-in reasons-lead">
              很多人跳不出“仓鼠轮”，有三个原因
            </p>
            <div className="cols reasons">
              {REASONS.map(reason => (
                <div key={reason.title}>
                  <h3>{reason.title}</h3>
                  <p>{reason.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The formula: each factor heads its own column ── */}
        <section id="framework" className="sec ruled">
          <div className="wrap">
            <div className="eyebrow">核心框架</div>
            <h2 className="formula-name">个人价值公式</h2>
            <p className="formula-for">
              它不是“速成秘诀”，而是一个用来做选择、定投入、看回报的框架。
            </p>

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

        {/* ── The contents, set as a book's contents page ── */}
        <section id="outline" className="sec ruled">
          <div className="wrap">
            <div className="head">
              <div>
                <div className="eyebrow">目录</div>
                <h2>
                  <Phrases text="上下两篇，21章" />
                </h2>
              </div>
              <div>
                <p>
                  上篇剖析三个最普遍、最有害的思维模式，再拆解个人价值公式。下篇讲具体的方法：先工作，后赚钱。
                </p>
              </div>
            </div>

            <div className="contents">
              {PARTS.map(part => (
                <section key={part.num} className="module">
                  <h3>
                    <span className="n">{part.num}</span>
                    <span>{part.title}</span>
                    <small>{part.count}</small>
                  </h3>
                  <ol>
                    {part.chapters.map((chapter, i) => (
                      <li key={chapter}>
                        <span className="no">
                          {String(part.from + i).padStart(2, "0")}
                        </span>
                        <span>{chapter}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>

            {/* The course the book grew out of: named once, with where to watch and buy it. */}
            <p className="course-note">
              <span>这本书由同名B站课程扩写而来。想看视频：</span>
              <a className="lz-link" href={BILIBILI_COURSE_URL} {...EXTERNAL}>
                在B站看课程 <Arrow />
              </a>
              <a className="lz-link" href={COURSE_URL} {...EXTERNAL}>
                在学院购买课程 <Arrow />
              </a>
            </p>
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

        {/* ── Who put their name on the cover ── */}
        <section id="endorsements" className="sec ruled">
          <div className="wrap">
            <div className="head solo">
              <div>
                <div className="eyebrow">封面推荐</div>
                <h2>三位推荐人这样说</h2>
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
                  <Dotted text="康奈尔大学经济学博士 · 超线性学院创始人、作者" />
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
                <div className="eyebrow">超线性学院社区</div>
                <h2>
                  <Phrases text="在免费社区里|把书里的方法用起来" />
                </h2>
              </div>
              <p>
                超线性学院的社区长期免费开放。你可以带着书里的框架和自己的真实问题，看看其他人怎样实践，也把自己的尝试放进讨论。
              </p>
            </div>

            <div className="feed">
              <iframe
                src={COMMUNITY_FEED_URL}
                title="超线性学院社区"
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
                {/* The preface's last paragraph: the book in its own words, before the ways to get it. */}
                <blockquote className="last-words">
                  所谓的“真本事”，不是靠某次“开挂”瞬间逆袭，而是看你在每个细微处，能不能都比别人多想一步、做得更好。当这些不起眼的“好一点”撞上时间，复利会送你一份意想不到的厚礼。
                  <cite>《真本事》前言</cite>
                </blockquote>
                <p className="say">
                  可以在微信读书读，也可以买纸质书。想看别人怎样把这些方法用起来，欢迎进入超线性学院的免费社区。
                </p>
                <div className="cta-row">
                  <a className="btn btn-ivory" href={WEREAD_URL} {...EXTERNAL}>
                    微信读书
                  </a>
                  <a className="btn btn-line" href={JD_URL} {...EXTERNAL}>
                    京东购买
                  </a>
                  <a className="lz-link" href={COMMUNITY_URL} {...EXTERNAL}>
                    免费加入超线性学院 <Arrow />
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
