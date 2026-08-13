import { applyPageSeo } from "@/lib/seo";
import { GUEST_INVITATION_PAGE_META } from "@shared/page-meta";
import { buildPodcastGuestInvitationStructuredData } from "@shared/structured-data";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Languages,
  Mail,
  MapPin,
  Mic2,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";

const proofQuotes = [
  {
    quote:
      "“通过这个对话，我也更深层次地理解了这件事多重要、它的context是什么。”",
    name: "田渊栋",
    context: "访谈结束时",
    href: "https://youtu.be/dymM40bVIhQ?t=2364",
  },
  {
    quote: "“你这准备得非常充分。”",
    name: "Reynold Xin",
    context: "Databricks联合创始人",
    href: "https://youtu.be/GIv0I-34aaI?t=316",
  },
] as const;

const methods = [
  {
    number: "01",
    title: "读到能问下一层",
    body: "书、论文、演讲和旧访谈是起点。准备的目的，不是展示做了多少功课，而是找到真正值得问的那一层。",
  },
  {
    number: "02",
    title: "让答案改写下一问",
    body: "我会准备问题，但不执行问题清单。开始之后，你如何定义问题、答案里哪个词最有分量，决定我们往哪里走。",
  },
  {
    number: "03",
    title: "带着判断来，也愿意被改变",
    body: "好的对谈不是彼此客气地完成答案。我会把自己的模型摆到桌上；当事实或你的解释推翻它，对话才真正向前。",
  },
] as const;

const moments = [
  {
    label: "田渊栋",
    title: "一个词，追到研究判断的底层",
    body: "他提到insight，我们没有把这个词放过去。它是taste、intuition，还是mental model？这个追问最后进入了稀疏信号下的研究判断，以及怎样识别真正好的研究者。",
    kicker: "从答案里的关键词继续往下走",
    href: "https://youtu.be/dymM40bVIhQ?t=447",
    image: "https://img.youtube.com/vi/dymM40bVIhQ/maxresdefault.jpg",
  },
  {
    label: "刘嘉",
    title: "形式上已经结束，才问出真正重要的最后一问",
    body: "近三小时的谈话已经收尾，但一个2023年出租车上真实发生的场景，打开了AI时代的教育、孩子如何成为自己，以及人类终极使命的完整论述。",
    kicker: "不因为“该结束了”放弃那个问题",
    href: "https://youtu.be/-Et3GJRSI_0?t=5749",
    image: "https://img.youtube.com/vi/-Et3GJRSI_0/maxresdefault.jpg",
  },
  {
    label: "杨滢（屠龙大实话）",
    title: "不接受传奇故事，先问经验能不能迁移",
    body: "一家书店成功了，有多少只因为创始人本来就是大V？这个不太客气、但观众真正需要的反事实检验，引出了影响大小、品类匹配和一个完全失败的反例。",
    kicker: "替观众检查一个成功故事的可迁移性",
    href: "https://youtu.be/vd_oYgwQSBM?t=1126",
    image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
  },
  {
    label: "Howie Xu · 2022",
    title: "看见趋势以后，为什么绝大多数人仍然低估后果？",
    body: "2009年，行业里几乎人人都听过cloud和mobile，但这不等于理解了它们会改变什么。2022年10月，这个区分把对话带进了下一轮真正的结构性机会：generative AI。",
    kicker: "比“看到了”更重要的，是内化它的后果",
    href: "https://youtu.be/R8X4ClBY5tg?t=764",
    image: "https://img.youtube.com/vi/R8X4ClBY5tg/maxresdefault.jpg",
  },
] as const;

function buildMailto() {
  const subject = "来谈一个你真正想讲清的问题";
  const body = [
    "我是：",
    "",
    "我最想讲清的问题：",
    "",
    "为什么它值得现在谈：",
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
    <div className="min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/90 backdrop-blur-xl">
        <div className="container flex h-[68px] items-center justify-between gap-4">
          <a
            href="https://podcast.lizheng.ai"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">回到Podcast</span>
            <span className="sm:hidden">节目</span>
          </a>

          <a
            href="https://podcast.lizheng.ai"
            className="absolute left-1/2 -translate-x-1/2 text-center"
            aria-label="课代表立正Podcast首页"
          >
            <span className="block text-sm font-semibold text-white">
              课代表立正
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300">
              Conversations
            </span>
          </a>

          <a
            href={mailto}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-300 transition hover:border-amber-300/40 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">回复邀请</span>
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(251,191,36,0.13),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_42%)]" />
          <div className="container relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20 lg:py-28">
            <div className="max-w-4xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300">
                课代表立正 · 嘉宾邀请
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.5rem]">
                一场为你的思想而准备、
                <span className="text-amber-200">也愿意被你的答案改写</span>
                的长对话。
              </h1>
              <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg sm:leading-9">
                我会读你的书、论文、公开演讲和过去的访谈，带着自己的理解来。但真正开始以后，提纲不是轨道：我会听你怎样定义问题，追随答案里最值得继续的那句话，一起把一个重要问题谈到它该到的地方。
              </p>
              <p className="mt-6 max-w-2xl border-l-2 border-amber-300/60 pl-5 text-sm leading-7 text-zinc-400">
                如果你收到了这个页面，说明我已经有了一个只想和你谈的问题。
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={mailto}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-300 px-6 text-sm font-semibold text-[#211300] transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 motion-reduce:transform-none"
                >
                  说说你最想讲清的问题
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#moments"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.035] px-6 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  看真实对话片段
                </a>
              </div>
            </div>

            <div className="space-y-4 lg:pt-16">
              {proofQuotes.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block rounded-3xl border p-6 transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 motion-reduce:transform-none sm:p-7 ${
                    index === 0
                      ? "border-amber-300/25 bg-amber-300/[0.07]"
                      : "border-white/10 bg-white/[0.035]"
                  }`}
                >
                  <blockquote className="text-lg font-medium leading-8 text-zinc-100 sm:text-xl sm:leading-9">
                    {item.quote}
                  </blockquote>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.context}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 text-zinc-600 transition group-hover:text-amber-300"
                      aria-hidden="true"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/10">
            <div className="container grid gap-4 py-5 text-xs text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
              <span>
                <strong className="mr-1 text-sm text-white">200+</strong>
                场公开对话
              </span>
              <span>康奈尔经济学博士</span>
              <span>Amazon · Meta · 腾讯 · Statsig</span>
              <span>
                <strong className="mr-1 text-sm text-white">40万+</strong>
                跨平台关注者
              </span>
            </div>
          </div>
        </section>

        <section className="container py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
              How the conversation works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
              不是采访一个title，而是理解一个人的vantage point。
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              真正稀缺的，往往不是某个人还有多少故事没讲，而是他站在那个位置上，看见了什么别人很难看见的问题。
            </p>
          </div>

          <div className="mt-12 grid border-y border-white/10 lg:grid-cols-3">
            {methods.map((item, index) => (
              <article
                key={item.number}
                className={`py-8 lg:px-8 lg:py-10 ${
                  index > 0
                    ? "border-t border-white/10 lg:border-l lg:border-t-0"
                    : ""
                }`}
              >
                <p className="font-mono text-xs text-amber-300/80">
                  {item.number}
                </p>
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="moments"
          className="scroll-mt-24 border-y border-white/10 bg-[#080B12]"
        >
          <div className="container py-16 sm:py-24">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                  Follow the answer
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
                  这些时刻，不在原来的题纲里。
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-zinc-400 lg:justify-self-end lg:text-base lg:leading-8">
                一个好追问不是追加一道难题。它是在听见答案以后，发现原来的问题还不够准确，或者有一条更值得走的路。
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {moments.map(item => (
                <article
                  key={item.label}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]"
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block aspect-video overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
                    aria-label={`从时间点观看${item.label}对话`}
                  >
                    <img
                      src={item.image}
                      alt={`${item.label}访谈画面`}
                      className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-95 motion-reduce:transform-none"
                      width={1280}
                      height={720}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm">
                      <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
                    </span>
                  </a>
                  <div className="p-6 sm:p-7">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                      {item.label}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-8 text-white sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">
                      {item.body}
                    </p>
                    <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-6 text-zinc-500">
                      {item.kicker}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                A compounding conversation network
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
                一次谈话，会进入下一次。
              </h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-zinc-400">
              <p>
                200+场公开对话最有价值的地方，不是增加一排名字。研究者、创始人、技术负责人、管理者和一线实践者提供了不同的观测位置；前一次谈话里得到的问题，可以在下一次里接受另一个领域的检验。
              </p>
              <p>
                田渊栋关于模型“优雅”的观察，以及查晟对训练信号的判断，后来被带进与刘嘉的对话，连接到脑科学中的长程反馈、预测编码与neural manifold。对话因此不只是当下的内容，也是一张还在生长的知识网络。
              </p>
              <a
                href="https://www.lizheng.ai/guests"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-amber-200 transition hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
              >
                看全部嘉宾与对话档案
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="container py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                Before we record
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                把边界说清，然后把注意力交给问题。
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  Icon: BookOpen,
                  title: "录制前",
                  body: "对齐最想讲清的问题、发布形式和不便进入的边界。",
                },
                {
                  Icon: Mic2,
                  title: "录制中",
                  body: "问题是起点，不是剧本。有更重要的线索，我们就继续走。",
                },
                {
                  Icon: ShieldCheck,
                  title: "具体事实",
                  body: "人名、数字、引文等容易出错的细节，可以在发布前核对。",
                },
                {
                  Icon: Languages,
                  title: "形式",
                  body: "中文或英文，远程或西雅图线下；完整长谈是主体。",
                },
              ].map(({ Icon, title, body }) => (
                <article key={title} className="border-t border-white/10 pt-6">
                  <Icon className="h-5 w-5 text-amber-300" aria-hidden="true" />
                  <h3 className="mt-5 text-base font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-500">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.12),transparent_34%)]" />
          <div className="container relative py-20 text-center sm:py-28">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
              One question worth leaving behind
            </p>
            <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
              你有没有一个已经想了很久，却一直没有被认真问到的问题？
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              告诉我那是什么。剩下的准备，我们来做。
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href={mailto}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-300 px-6 text-sm font-semibold text-[#211300] transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 motion-reduce:transform-none"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                yz@superlinear.academy
              </a>
              <span className="inline-flex min-h-12 items-center rounded-full border border-white/10 px-5 text-sm text-zinc-400">
                商务负责人喵老师 · 微信FM13870617
              </span>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Seattle · Remote
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                中文 · English
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#080B12]">
        <div className="container flex flex-col gap-5 py-9 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-zinc-300">课代表立正 · 对话</p>
            <p className="mt-1">把真正重要、还没有被充分讲清的东西留下来。</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://podcast.lizheng.ai"
              className="transition hover:text-amber-300"
            >
              Podcast
            </a>
            <a
              href="https://www.lizheng.ai/guests"
              className="transition hover:text-amber-300"
            >
              全部对话
            </a>
            <a
              href="https://www.lizheng.ai"
              className="transition hover:text-amber-300"
            >
              关于立正
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
