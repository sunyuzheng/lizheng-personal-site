import { applyPageSeo } from "@/lib/seo";
import { GUEST_INVITATION_PAGE_META } from "@shared/page-meta";
import { buildPodcastGuestInvitationStructuredData } from "@shared/structured-data";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
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

const moments = [
  {
    label: "田渊栋",
    title: "insight到底是什么？",
    body: "他说到insight。我们继续问：它是taste、intuition，还是mental model？",
    href: "https://youtu.be/dymM40bVIhQ?t=447",
    image: "https://img.youtube.com/vi/dymM40bVIhQ/maxresdefault.jpg",
  },
  {
    label: "杨滢（屠龙大实话）",
    title: "成功经验，换个人还成立吗？",
    body: "一家书店的成功，有多少只是因为创始人本来就是大V？答案里出现了一个失败反例，也说清了这套经验什么时候成立。",
    href: "https://youtu.be/vd_oYgwQSBM?t=1126",
    image: "https://img.youtube.com/vi/vd_oYgwQSBM/maxresdefault.jpg",
  },
] as const;

const recordingDetails = [
  {
    Icon: Mic2,
    title: "主题与边界",
    body: "录制前，先对齐你想讲清的问题，以及不便进入的内容。",
  },
  {
    Icon: Languages,
    title: "形式",
    body: "中文或英文；远程或西雅图线下；以完整长谈为主。",
  },
  {
    Icon: ShieldCheck,
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
    <div className="min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/90 backdrop-blur-xl">
        <div className="container flex h-[68px] items-center justify-between gap-4">
          <a
            href="https://podcast.lizheng.ai"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
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
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-superlinear-on-dark">
              Conversations
            </span>
          </a>

          <a
            href={mailto}
            aria-label="回复邀请"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-300 transition hover:border-superlinear-on-dark/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">回复邀请</span>
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(35,131,67,0.13),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_42%)]" />
          <div className="container relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20 lg:py-28">
            <div className="max-w-4xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-superlinear-on-dark">
                课代表立正 · 嘉宾邀请
              </p>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.75rem]">
                <span className="block">把一个重要的问题</span>
                <span className="block text-superlinear-on-dark">谈透。</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-zinc-200 sm:text-xl sm:leading-9">
                如果你收到了这个页面，我已经有一个只想和你谈的问题。
              </p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                我会提前读你的书、论文，也看完公开演讲和过去的访谈。录制开始后，你的答案决定下一问。
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={mailto}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-superlinear px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-superlinear-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark motion-reduce:transform-none"
                >
                  回复邀请
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#moments"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.035] px-6 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  看两段真实对话
                </a>
              </div>
            </div>

            <div className="space-y-4">
              {proofQuotes.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block rounded-3xl border p-6 transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark motion-reduce:transform-none sm:p-7 ${
                    index === 0
                      ? "border-superlinear-on-dark/25 bg-superlinear/[0.07]"
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
                      className="h-4 w-4 text-zinc-600 transition group-hover:text-superlinear-on-dark"
                      aria-hidden="true"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/10">
            <div className="container flex flex-wrap gap-x-8 gap-y-3 py-5 text-xs text-zinc-400">
              <span>
                <strong className="mr-1 text-sm text-white">200+</strong>
                场公开对话
              </span>
              <span>康奈尔经济学博士</span>
              <span>Amazon · Meta · 腾讯 · OpenAI收购团队早期成员</span>
              <span>
                <strong className="mr-1 text-sm text-white">40万+</strong>
                跨平台关注者
              </span>
            </div>
          </div>
        </section>

        <section
          id="moments"
          className="scroll-mt-24 border-b border-white/10 bg-[#080B12]"
        >
          <div className="container py-16 sm:py-24">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
              看看我们怎么聊。
            </h2>
            <p className="mt-4 text-base text-zinc-400">
              问题是起点，不是剧本。
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {moments.map(item => (
                <article
                  key={item.label}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]"
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block aspect-video overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark"
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
                    <p className="text-xs font-medium text-superlinear-on-dark">
                      {item.label}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-8 text-white sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-white/[0.025]">
          <div className="container py-16 sm:py-20">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              录制前，先把这些说清。
            </h2>
            <div className="mt-10 grid gap-7 md:grid-cols-3">
              {recordingDetails.map(({ Icon, title, body }) => (
                <article key={title} className="border-t border-white/10 pt-6">
                  <Icon
                    className="h-5 w-5 text-superlinear-on-dark"
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 text-base font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-500">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(35,131,67,0.12),transparent_34%)]" />
          <div className="container relative py-20 text-center sm:py-28">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
              你最想讲清什么？
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              回信告诉我一个问题，也可以先说不想谈什么。剩下的准备，我来做。
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-4">
              <a
                href={mailto}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-superlinear px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-superlinear-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-superlinear-on-dark motion-reduce:transform-none"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                回复邀请
              </a>
              <span className="inline-flex min-h-12 items-center text-sm text-zinc-500">
                也可联系商务负责人喵老师 · 微信 FM13870617
              </span>
            </div>
            <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zinc-600">
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
        <div className="container flex flex-col gap-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-zinc-300">课代表立正 · 对话</p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://podcast.lizheng.ai"
              className="transition hover:text-superlinear-on-dark"
            >
              Podcast
            </a>
            <a
              href="https://www.lizheng.ai/guests"
              className="transition hover:text-superlinear-on-dark"
            >
              全部对话
            </a>
            <a
              href="https://www.lizheng.ai"
              className="transition hover:text-superlinear-on-dark"
            >
              关于立正
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
