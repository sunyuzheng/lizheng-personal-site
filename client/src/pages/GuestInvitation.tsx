import { Quotation } from "@/components/home/Peers";
import { Dotted, EXTERNAL } from "@/components/home/parts";
import { SoloFooter, SoloHeader } from "@/components/site/SoloShell";
import { applyPageSeo } from "@/lib/seo";
import { GUEST_INVITATION_PAGE_META } from "@shared/page-meta";
import { buildPodcastGuestInvitationStructuredData } from "@shared/structured-data";
import { useEffect } from "react";

/*
 * The page a guest receives with a personal invitation (speaker.lizheng.ai). It reads as a short
 * letter in the site's language (components/site/subpages.css): the forest head holds the one
 * sentence and, beside it, what two earlier guests said on tape; then two moments to watch, what is
 * agreed before recording, and the way to reply. It has a host of its own, so its header and footer
 * carry this page's few links, not the site's navigation.
 */

const PODCAST_URL = "https://podcast.lizheng.ai";

// The quotation marks are set by Quotation, so the words are stored without them.
const proofQuotes = [
  {
    quote:
      "通过这个对话，我也更深层次地理解了这件事多重要、它的context是什么。",
    name: "田渊栋",
    context: "访谈结束时",
    href: "https://youtu.be/dymM40bVIhQ?t=2364",
  },
  {
    quote: "你这准备得非常充分。",
    name: "Reynold Xin",
    context: "Databricks联合创始人",
    href: "https://youtu.be/GIv0I-34aaI?t=316",
  },
] as const;

// `at` is the moment the link opens at, written out (the t= of the address).
const moments = [
  {
    label: "田渊栋",
    title: "insight到底是什么？",
    body: "他说到insight。我们继续问：它是taste、intuition，还是mental model？",
    href: "https://youtu.be/dymM40bVIhQ?t=447",
    at: "7:27",
    image: "https://img.youtube.com/vi/dymM40bVIhQ/maxresdefault.jpg",
  },
  {
    label: "杨滢（屠龙大实话）",
    title: "成功经验，换个人还成立吗？",
    body: "一家书店的成功，有多少只是因为创始人本来就是大V？答案里出现了一个失败反例，也说清了这套经验什么时候成立。",
    href: "https://youtu.be/vd_oYgwQSBM?t=1126",
    at: "18:46",
    image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
  },
] as const;

const recordingDetails = [
  {
    title: "主题与边界",
    body: "录制前，先对齐你想讲清的问题，以及不便进入的内容。",
  },
  {
    title: "形式",
    body: "中文或英文；远程或西雅图线下；以完整长谈为主。",
  },
  {
    title: "事实核对",
    body: "人名、数字、引文等容易出错的细节，发布前可以核对。",
  },
] as const;

function buildMailto() {
  const subject = "来谈一个你真正想讲清的问题";
  const body = [
    "我是：",
    "",
    "我最想讲清的问题：",
    "",
    "希望提前说明的边界：",
    "",
    "语言、形式与大概时间：",
  ].join("\n");
  return `mailto:yz@superlinear.academy?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function GuestInvitation() {
  useEffect(
    () =>
      applyPageSeo({
        ...GUEST_INVITATION_PAGE_META,
        locale: "zh_CN",
        imageAlt: "课代表立正Podcast嘉宾邀请",
        jsonLd: buildPodcastGuestInvitationStructuredData(),
      }),
    []
  );

  const mailto = buildMailto();

  return (
    <div className="lz-site lz-home lz-sub" lang="zh-CN">
      <SoloHeader
        brandHref={PODCAST_URL}
        brandLabel="课代表立正Podcast首页"
        small="对话"
      >
        <a className="plain" href={PODCAST_URL}>
          回到Podcast
        </a>
        <a className="lz-lang" href={mailto}>
          回复邀请
        </a>
      </SoloHeader>

      <main>
        {/* ── The invitation, and what two guests said on tape ── */}
        <section className="forest-head invite-head grain">
          <div className="wrap">
            <div className="cols2 top">
              <div>
                <div className="eyebrow">
                  <Dotted text="课代表立正 · 嘉宾邀请" />
                </div>
                <h1>
                  <span className="line">把一个重要的问题</span>
                  <span className="line">谈透。</span>
                </h1>
                <p className="lede">
                  如果你收到了这个页面，我已经有一个只想和你谈的问题。
                </p>
                <p className="aside">
                  我会提前读你的书、论文，也看完公开演讲和过去的访谈。录制开始后，你的答案决定下一问。
                </p>
                <div className="cta-row">
                  <a className="btn btn-ivory" href={mailto}>
                    回复邀请
                  </a>
                  <a className="btn btn-line" href="#moments">
                    看两段真实对话
                  </a>
                </div>
              </div>

              <ul className="said">
                {proofQuotes.map(item => (
                  <li key={item.name}>
                    <figure>
                      <blockquote>
                        <Quotation text={item.quote} />
                      </blockquote>
                      <figcaption>
                        <a href={item.href} {...EXTERNAL}>
                          {item.name}
                          <span className="ext" aria-hidden="true">
                            ↗
                          </span>
                        </a>
                        <span>{item.context}</span>
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="facts-line">
              <li>
                <b>200+</b>场公开对话
              </li>
              <li>康奈尔经济学博士</li>
              <li>
                <Dotted text="Amazon · Meta · 腾讯 · OpenAI收购团队早期成员" />
              </li>
              <li>
                <b>40万+</b>跨平台关注者
              </li>
            </ul>
          </div>
        </section>

        {/* ── Two moments to watch ── */}
        <section id="moments" className="sec">
          <div className="wrap">
            <div className="head solo">
              <div>
                <h2>看看我们怎么聊。</h2>
                <p className="after">问题是起点，不是剧本。</p>
              </div>
            </div>

            <div className="moments">
              {moments.map(item => (
                <article key={item.label}>
                  <a
                    className="still"
                    href={item.href}
                    aria-label={`从时间点观看${item.label}对话`}
                    {...EXTERNAL}
                  >
                    <img
                      src={item.image}
                      alt={`${item.label}访谈画面`}
                      width={1280}
                      height={720}
                      loading="lazy"
                    />
                  </a>
                  <div className="t">{item.label}</div>
                  <h3>
                    <a href={item.href} {...EXTERNAL}>
                      {item.title}
                    </a>
                  </h3>
                  <p>{item.body}</p>
                  <a className="lz-link" href={item.href} {...EXTERNAL}>
                    从{item.at}看起 <i aria-hidden="true">→</i>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Before recording ── */}
        <section className="sec ruled">
          <div className="wrap">
            <div className="head solo">
              <h2>录制前，先把这些说清。</h2>
            </div>
            <div className="cols">
              {recordingDetails.map(item => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The reply: the page closes on the forest it opens on ── */}
        <section className="sec band closing grain">
          <div className="wrap">
            <div className="split">
              <h2>你最想讲清什么？</h2>
              <div>
                {/* The second sentence stays whole, so its last two words never sit alone on a line. */}
                <p className="say first">
                  回信告诉我一个问题，也可以先说不想谈什么。
                  <span className="phrase">剩下的准备，我来做。</span>
                </p>
                <div className="cta-row">
                  <a className="btn btn-ivory" href={mailto}>
                    回复邀请
                  </a>
                </div>
                <p className="mail">
                  <Dotted text="也可联系商务负责人喵老师 · 微信 FM13870617" />
                </p>
                <p className="mail where">
                  <span>
                    <Dotted text="Seattle · Remote" />
                  </span>
                  <span>
                    <Dotted text="中文 · English" />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SoloFooter name="课代表立正 · 对话" label="相关页面">
        <li>
          <a href={PODCAST_URL}>Podcast</a>
        </li>
        <li>
          <a href="https://www.lizheng.ai/guests">全部对话</a>
        </li>
        <li>
          <a href="https://www.lizheng.ai">关于立正</a>
        </li>
      </SoloFooter>
    </div>
  );
}
