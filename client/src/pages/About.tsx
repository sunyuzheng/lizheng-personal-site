import CourseReviews from "@/components/CourseReviews";
import DefiningWork from "@/components/DefiningWork";
import PeerEndorsements from "@/components/PeerEndorsements";
import CareerPath, { type CareerStep } from "@/components/home/CareerPath";
import { LINKS } from "@/components/home/content";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { GROWTH_BOOK_AMAZON_URL } from "@shared/book-links";
import { STATSIG_WRITING_PATH } from "@shared/writing-links";
import { pick, useLanguage, type Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { applyPageSeo } from "@/lib/seo";
import { ABOUT_PAGE_META, languageAlternates } from "@shared/page-meta";
import { buildAboutStructuredData } from "@shared/structured-data";
import { Fragment, useEffect } from "react";
import { Link } from "wouter";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

// The homepage career band, with the fuller Statsig role kept on the profile.
const career: Record<Lang, CareerStep[]> = {
  en: [
    { org: "Cornell University", latin: true, role: ["PhD in Economics"] },
    { org: "Amazon", latin: true, role: ["Economist"] },
    { org: "Meta", latin: true, role: ["Data Scientist"] },
    {
      org: "Tencent IEG",
      latin: true,
      role: ["Director, Growth Data Science & AI", "Led a 30-person team"],
    },
    {
      org: "Statsig",
      latin: true,
      role: [
        "Principal Data Scientist and sole evangelist",
        "Early team, later acquired by OpenAI",
      ],
    },
    { org: "Superlinear Academy", latin: true, role: ["Founder, full time"] },
  ],
  zh: [
    { org: "康奈尔大学", latin: false, role: ["经济学博士"] },
    { org: "Amazon", latin: true, role: ["经济学家"] },
    { org: "Meta", latin: true, role: ["数据科学家"] },
    {
      org: "腾讯IEG",
      latin: false,
      role: ["增长数据科学与AI总监", "带领30人团队"],
    },
    {
      org: "Statsig",
      latin: true,
      role: [
        "Principal Data Scientist、公司唯一布道师",
        "OpenAI收购团队早期成员",
      ],
    },
    { org: "超线性学院", latin: false, role: ["创始人 · 全职投入"] },
  ],
};

const currentWork = {
  en: [
    {
      name: "Superlinear Academy",
      role: "Free community",
      detail:
        "See how people use AI, share your work, and bring your questions. 20,000+ members, 700+ project posts, and 8,000+ project comments.",
      href: "https://www.superlinear.academy/",
    },
    {
      name: "AI Builders",
      role: "Long-term AI learning system",
      detail:
        "Understand AI systematically, build hands-on, and keep up as it changes. Co-taught with Yage.",
      href: "https://ai-builders.com/",
    },
    {
      name: "Stay Superlinear membership",
      role: "Long-term membership",
      detail:
        "Keep learning through guest masterclasses, deep technical analysis with Yage, Q&A, and member discussions. Recordings and resources stay available to members.",
      href: "https://stay.superlinear.academy/",
    },
    {
      name: "Enterprise AI programs",
      role: "Organizational practice",
      detail:
        "Most teams begin with AI Builders by the seat. Dedicated cohorts, course customization, and fully custom programs add company-specific cases, evaluation, and delivery only when needed.",
      href: "/collab/enterprise",
      cta: "Enterprise options",
    },
  ],
  zh: [
    {
      name: "Superlinear Academy",
      role: "免费社区",
      detail:
        "看别人怎么用AI，分享自己的项目，也带着问题来讨论。2万+成员，700+项目帖，8,000+条项目评论。",
      href: "https://www.superlinear.academy/",
    },
    {
      name: "AI Builders",
      role: "长期AI学习体系",
      detail:
        "想系统学懂AI、真正动手、并持续跟上变化，选AI Builders 2027。由我和鸭哥共同授课。",
      href: "https://ai-builders.com/",
    },
    {
      name: "Stay Superlinear会员",
      role: "长期会员社区",
      detail:
        "跟大师课嘉宾深聊，跟鸭哥看懂技术变化，也把自己的问题带进答疑和会员讨论。回放与资料可以随时回来查。",
      href: "https://stay.superlinear.academy/",
    },
    {
      name: "企业AI项目",
      role: "组织实践",
      detail:
        "多数团队从按席位采购AI Builders开始；只有确实需要时，才增加专属班、企业案例、评估与完整定制。",
      href: "/collab/enterprise",
      cta: "查看合作方式",
    },
  ],
};

const publicFacts = [
  {
    value: "200+",
    en: "public conversations with technology leaders and AI researchers",
    zh: "与科技领袖和AI研究者的公开对话",
  },
  {
    value: "400K+",
    en: "cross-platform audience",
    zh: "跨平台关注者",
  },
  {
    value: "3,000+",
    en: "paying learners across AI, data, and growth",
    zh: "AI、数据与增长领域的付费学员",
  },
];

export default function About() {
  const { lang } = useLanguage();
  const meta = ABOUT_PAGE_META[lang];

  useEffect(() => {
    return applyPageSeo({
      ...meta,
      type: "profile",
      locale: lang === "en" ? "en_US" : "zh_CN",
      alternates: languageAlternates(
        ABOUT_PAGE_META.en.canonical,
        ABOUT_PAGE_META.zh.canonical
      ),
      jsonLd: buildAboutStructuredData(lang, meta.canonical),
    });
  }, [lang, meta]);

  const copy = pick(lang, {
    en: {
      eyebrow: "About Yuzheng Sun",
      intro:
        "I’m Yuzheng Sun, known as 立正 / 课代表立正. I have a PhD in Economics from Cornell and founded Superlinear Academy. I live in Seattle.",
      belief:
        "MAKE WHAT LASTS. I want to build things people keep choosing, long after the launch.",
      backgroundTitle: "Background",
      background:
        "I worked as an economist at Amazon, a data scientist at Meta, and Director of Growth Data Science & AI at Tencent IEG. I then joined early-stage Statsig, later acquired by OpenAI, before building Superlinear Academy full time.",
      // Worded so it stays true before and after the November 2026 event.
      aie: "AI Engineer Shanghai 2026, the first AI Engineer conference in China, names Mengying Li and me as its co-organizers. My part is the program, speaker invitations, and connecting developer communities in the US and China.",
      aieLink: "AI Engineer Shanghai organizing team",
      currentTitle: "The academy I’m building",
      currentIntro:
        "Superlinear Academy is where my teaching, community, and enterprise work come together. You can begin with the free community.",
      publicTitle: "Books and conversations",
      publicIntro: (
        <>
          I co-authored{" "}
          <a
            href={GROWTH_BOOK_AMAZON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline"
          >
            Growth Data Analytics Playbook
          </a>{" "}
          and wrote{" "}
          <Link
            href="/zbs"
            className="inline"
          >
            Real Stuff
          </Link>{" "}
          (<span lang="zh-CN">真本事</span>), a book in Chinese. I host
          long-form conversations on my channel and join other shows as a guest.
        </>
      ),
      sourcesTitle: "Sources and contact",
      reviewed:
        "Facts last reviewed September 2, 2026. Changing figures retain their check date.",
      books: "Books",
      hosted: "Interviews I host",
      appeared: "Guest appearances",
      invite: "Invite Yuzheng to a program",
    },
    zh: {
      eyebrow: "关于我",
      intro:
        "我是孙煜征，大家叫我立正。康奈尔经济学博士，超线性学院Superlinear Academy创始人，现居西雅图。",
      belief:
        "学点真本事，做点真东西。对我来说，就是离开职位和公司名，仍能做出别人需要的东西。",
      backgroundTitle: "经历",
      background:
        "我做过Amazon经济学家、Meta数据科学家和腾讯IEG增长数据科学与AI总监，也是OpenAI收购团队Statsig的早期成员。现在全职建设Superlinear Academy。",
      aie: "2026年，我和李孟颖联合主办AI Engineer上海站，这是硅谷的AI工程师大会第一次来中国。我参与议程筹划和嘉宾邀请，也帮中美两边的开发者社区牵线。",
      aieLink: "AI Engineer上海站组织团队",
      currentTitle: "我正在办的这所学院",
      currentIntro:
        "课程、社区和企业项目，都在Superlinear Academy。想了解我们，可以先从免费社区开始。",
      publicTitle: "书与对话",
      publicIntro: (
        <>
          我合著了
          <a
            href={GROWTH_BOOK_AMAZON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline"
          >
            《Growth Data Analytics Playbook》
          </a>
          ，写了
          <Link
            href="/zbs"
            className="inline"
          >
            《真本事：从会工作到会赚钱》
          </Link>
          。也在自己的频道里做长访谈，去别人的节目做嘉宾。
        </>
      ),
      sourcesTitle: "资料与联系",
      reviewed: "事实最后核对：2026年9月2日。会变化的数字保留各自的核对日期。",
      books: "三本书",
      hosted: "我采访过的人",
      appeared: "我做客的节目",
      invite: "邀请我上节目",
    },
  });

  const names =
    lang === "en" ? ["孙煜征", "课代表立正"] : ["孙煜征", "Yuzheng Sun", "课代表立正"];
  const facts: Array<[string, string]> = [
    [lang === "en" ? "Based in" : "现居", "Seattle / 西雅图"],
    [
      lang === "en" ? "Education" : "学历",
      lang === "en" ? "Cornell PhD in Economics" : "康奈尔经济学博士",
    ],
    [lang === "en" ? "Public name" : "公开名称", "课代表立正"],
    [
      lang === "en" ? "Current role" : "现在",
      lang === "en" ? "Founder · Author" : "创始人 · 作者",
    ],
  ];

  return (
    <div
      className={lang === "en" ? "lz-site lz-home lz-sub l-en" : "lz-site lz-home lz-sub"}
      lang={lang === "en" ? "en" : "zh-CN"}
    >
      <SiteHeader current="about" />

      <main>
        {/* The opening, on the forest like the homepage's first screen: his name large, who he is
            in two sentences, and four plain facts; the career band stands under it. */}
        <section className="about-top grain">
          <div className="wrap">
            <div>
              <div className="eyebrow">{copy.eyebrow}</div>
              <h1>{lang === "en" ? "Yuzheng Sun" : "立正"}</h1>
              <p className="aka">
                {names.map((name, index) => (
                  <Fragment key={name}>
                    {index > 0 && " "}
                    <span className="phrase">
                      {index > 0 && "· "}
                      {name}
                    </span>
                  </Fragment>
                ))}
              </p>
              <p className="lede">{copy.intro}</p>
              <p className="belief">{copy.belief}</p>
            </div>
            <dl>
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <CareerPath lang={lang} steps={career[lang]} />

        {/* From here one sheet of paper: each chapter's name in the left column, its matter on the
            right, a hairline in ink between chapters. */}
        <section className="sec">
          <div className="wrap">
            <div className="chap">
              <h2>{copy.backgroundTitle}</h2>
              <div className="prose">
                <p>{copy.background}</p>
                <p>{copy.aie}</p>
                <div className="links">
                  <a
                    className="lz-link"
                    href="https://economics.cornell.edu/historical-placement-phd-students"
                    {...EXTERNAL}
                  >
                    {lang === "en"
                      ? "Cornell Economics placement record"
                      : "康奈尔经济学博士去向记录"}{" "}
                    <i aria-hidden="true">→</i>
                  </a>
                  {lang === "zh" && (
                    // A static page outside the React app, so a plain link.
                    <a className="lz-link" href={STATSIG_WRITING_PATH}>
                      在Statsig写的19篇文章（中文版） <i aria-hidden="true">→</i>
                    </a>
                  )}
                  <a
                    className="lz-link"
                    href={`${lang === "en" ? LINKS.aieShanghai : LINKS.aieShanghaiZh}#organizers`}
                    {...EXTERNAL}
                  >
                    {copy.aieLink} <i aria-hidden="true">→</i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="chap">
              <div>
                <div className="eyebrow">
                  {lang === "en" ? "Current work" : "现在在做"}
                </div>
                <h2>{copy.currentTitle}</h2>
              </div>
              <div>
                <p className="say first">{copy.currentIntro}</p>
                <ul className="work-rows">
                  {currentWork[lang].map(item => {
                    const label =
                      "cta" in item ? item.cta : lang === "en" ? "Website" : "官网";
                    return (
                      <li key={item.name}>
                        <div>
                          <b>{item.name}</b>
                          <small>{item.role}</small>
                        </div>
                        <p>{item.detail}</p>
                        {item.href.startsWith("/") ? (
                          <Link
                            className="lz-link"
                            href={withLanguage(item.href, lang)}
                          >
                            {label} <i aria-hidden="true">→</i>
                          </Link>
                        ) : (
                          <a className="lz-link" href={item.href} {...EXTERNAL}>
                            {label} <i aria-hidden="true">→</i>
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="chap">
              <div>
                <div className="eyebrow">AI Builders</div>
                <h2>{lang === "en" ? "Learner reviews" : "学员评价"}</h2>
              </div>
              <CourseReviews />
            </div>
          </div>
        </section>

        <section id="endorsements" className="sec ruled">
          <div className="wrap">
            <div className="chap">
              <h2>{lang === "en" ? "What peers say" : "来自同行的评价"}</h2>
              <PeerEndorsements />
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="chap">
              <h2>{copy.publicTitle}</h2>
              <div className="prose">
                <p>{copy.publicIntro}</p>
                <div className="links">
                  <Link className="lz-link" href={withLanguage("/books", lang)}>
                    {copy.books} <i aria-hidden="true">→</i>
                  </Link>
                  <Link className="lz-link" href={withLanguage("/guests", lang)}>
                    {copy.hosted} <i aria-hidden="true">→</i>
                  </Link>
                  <Link
                    className="lz-link"
                    href={`${withLanguage("/collab/creators", lang)}#conversations`}
                  >
                    {copy.appeared} <i aria-hidden="true">→</i>
                  </Link>
                </div>
                <p className="tally">
                  {publicFacts.map(item => (
                    <span key={item.value}>
                      <b>{item.value}</b>
                      {lang === "en" ? item.en : item.zh}
                    </span>
                  ))}
                </p>
                <p className="checked">
                  {lang === "en"
                    ? "Figures checked July 12, 2026."
                    : "数据核对日期：2026年7月12日。"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec ruled">
          <div className="wrap">
            <div className="chap">
              <h2>{copy.sourcesTitle}</h2>
              <div className="prose">
                <p>Seattle / 西雅图</p>
                <p className="checked">{copy.reviewed}</p>
                <div className="cta-row">
                  <Link
                    className="btn btn-green"
                    href={withLanguage("/collab/creators", lang)}
                  >
                    {copy.invite}
                  </Link>
                  <a
                    className="lz-link"
                    href="https://github.com/sunyuzheng/yuzheng-profile"
                    {...EXTERNAL}
                  >
                    {lang === "en" ? "Public source kit" : "公开事实资料库"}{" "}
                    <i aria-hidden="true">→</i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DefiningWork />
      </main>
      <SiteFooter />
    </div>
  );
}
