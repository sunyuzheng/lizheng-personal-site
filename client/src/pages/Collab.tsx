import LanguageToggle from "@/components/LanguageToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { applyPageSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  Mail,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

type Category = {
  num: string;
  title: string;
  detail: string;
  fit: string;
  items?: string[];
  action?: { label: string; href: string; external: boolean };
};

const copy = {
  en: {
    seoTitle: "Collaborate · Yuzheng Sun",
    seoDesc:
      "Work with Yuzheng Sun (课代表立正): podcasts and interviews, talks and events, corporate training, and business partnerships.",
    navSub: "Collaborate",
    eyebrow: "Podcasts · Talks · Training · Partnerships",
    h1: "Everything a collaboration needs, on one page.",
    intro:
      "Four kinds of collaboration below. Each one states what fits and what to prepare — when those match, things move fast.",
    recordLink: "See the on-record calls",
    catEyebrow: "Four kinds of collaboration",
    categories: [
      {
        num: "01",
        title: "Podcasts & interviews (me as your guest)",
        detail:
          "This one means: inviting me onto your show. Three episode directions are already prepared — pick one and the sources and data arrive before the recording. After the episode ships, it gets pushed across my YouTube, Bilibili, and Xiaohongshu channels simultaneously.",
        items: [
          "Predictions, audited: putting the dated public calls on the table — including the misses",
          "What are people earning $1M actually anxious about: an economist's framework + 3,000 Silicon Valley engineer students + corporate-training observations",
          "From User to Builder: compounding AI leverage for non-engineers",
        ],
        fit: "Fits when: your audience cares about AI, growth, or careers, and you want an hour with real information density.",
        action: {
          label: "Guest kit (3-page PDF)",
          href: "/collab/podcast-one-pager.pdf",
          external: true,
        },
      },
      {
        num: "02",
        title: "Talks & events",
        detail:
          "Keynotes and panels around the same material: AI judgment, growth and experimentation, User to Builder, career leverage. The same sessions have been delivered inside Tencent, Meituan, Xiaohongshu, and DoorDash — three recordings are public.",
        fit: "Fits when: you can say who is in the room and what they should walk away with. Audience beats venue size.",
      },
      {
        num: "03",
        title: "Corporate training",
        detail:
          "Structured programs for engineering and non-engineering teams. Delivered at Tencent, Meituan, Xiaohongshu, and DoorDash; a dedicated site covers formats and details.",
        fit: "Fits when: a team needs to move from using AI to building with it, and leadership wants deterministic outcomes.",
        action: {
          label: "corp-training.ai-builders.com",
          href: "https://corp-training.ai-builders.com/",
          external: true,
        },
      },
      {
        num: "04",
        title: "Products & deeper partnerships",
        detail:
          "The principle first: my channels don't take sponsored placements. The reason is simple: the audience comes for judgment that hasn't been paid for — that trust is the only thing the channel owns, and it can only be sold once. So for genuinely good products we go deeper instead: a founder interview (a product story worth telling is good content in its own right), an advisor package, or an angel check.",
        fit: "Fits when: you have long-term conviction in the product and want deep involvement of judgment and network — not a one-off exposure.",
      },
    ] as Category[],
    priceTitle: "Two numbers, and how to do the math",
    priceDetail:
      "Advisory at $2,000/hour; custom corporate training from $100k. Posted plainly to save time on both sides. A quick self-check: if the decision this hour affects is worth six figures, the price is cheap; if not yet, don't spend it — my channels and the Knowledge Bank stay open, and most of my thinking is there for free.",
    passTitle: "Where we can't help",
    passIntro:
      "Three kinds of proposals we usually pass on — not because they are bad ideas, but because we can't deliver something worthy of your effort:",
    passes: [
      "Sponsored placements and endorsements of products we haven't used — the judgment isn't for sale, and we can't hand our audience a conclusion we didn't reach ourselves.",
      "Pure audience swaps and cross-promotion — no new value for either side's audience.",
      "Topics with no overlap with AI, growth, or personal development — we would have nothing insider to say.",
    ],
    passClose: "Anything outside these three — happy to talk.",
    howTitle: "How to reach out",
    howIntro:
      "Three lines in the email are usually enough to decide within the week:",
    hows: [
      "Who you are, in one sentence.",
      "What you want to do together — concrete form and timing.",
      "Who your audience or users are, and what they get out of it.",
    ],
    howClose: "Replies within three working days — including when the answer is no.",
    contactTitle: "Yuzheng Sun (课代表立正)",
    contactDetail: "yz@superlinear.academy · Business WeChat: FM13870617",
    contactButton: "Email",
    back: "Back to homepage",
    closing:
      "If nothing here fits, no problem — the calls stay on the record, whenever you want to check them.",
  },
  zh: {
    seoTitle: "合作 · 课代表立正",
    seoDesc:
      "与课代表立正合作：播客与访谈、演讲与活动、企业培训、商务合作。每类写清了什么情况最合适、需要准备什么。",
    navSub: "合作",
    eyebrow: "播客 · 演讲 · 培训 · 商务",
    h1: "一次合作需要的东西，都在这一页。",
    intro:
      "下面是四类合作。每类都写清了什么情况最合适、需要你准备什么——对得上，事情就快。",
    recordLink: "看判断留档",
    catEyebrow: "四类合作",
    categories: [
      {
        num: "01",
        title: "播客 · 访谈（请我做嘉宾）",
        detail:
          "这一类说的是：请我上你的节目。三个选题方向已经备好——选定一个，相关原文和数据会在录制前整理给你。节目上线后，我的 B 站、YouTube、小红书三个平台同步推这一期。",
        items: [
          "预言复盘：把带日期的公开判断摊开对答案，包括错的",
          "年薪百万的人在焦虑什么：经济学家的框架 + 3,000 名硅谷工程师学员样本 + 内训现场观察",
          "从 User 到 Builder：普通人把 AI 用出复利",
        ],
        fit: "最合适的情况：你的观众关心 AI、增长或职业，你想要一期信息密度高的节目。",
        action: {
          label: "嘉宾资料包（三页 PDF）",
          href: "/collab/podcast-one-pager.pdf",
          external: true,
        },
      },
      {
        num: "02",
        title: "演讲 · 活动",
        detail:
          "Keynote 和圆桌，围绕同一套内容：AI 判断力、增长与实验、User→Builder、职业杠杆。同样的内容在腾讯、美团、小红书、DoorDash 的场子里讲过，三场实录公开可查。",
        fit: "最合适的情况：你说得清台下坐的是谁、希望他们带走什么。观众是谁，比场面大小重要。",
      },
      {
        num: "03",
        title: "企业培训",
        detail:
          "面向研发和非研发团队的成体系课程。腾讯、美团、小红书、DoorDash 都交付过，形式和细节有专门的站点。",
        fit: "最合适的情况：团队需要从「会用 AI」走到「用 AI 做出东西」，管理层在意结果的确定性。",
        action: {
          label: "corp-training.ai-builders.com",
          href: "https://corp-training.ai-builders.com/",
          external: true,
        },
      },
      {
        num: "04",
        title: "产品与深度合作",
        detail:
          "先说原则：我的节目不接商单。原因很简单：观众来，是为了没被付费影响过的判断——这份信任是频道唯一值钱的东西，卖一次就没了。所以对真正好的产品，我们换更深的做法：请 founder 上节目做访谈（值得讲的产品故事，本身就是好内容）；advisor 合作包；天使投资。",
        fit: "最合适的情况：你对产品有长期信心，想要的是判断和网络的深度参与，而不是一次曝光。",
      },
    ] as Category[],
    priceTitle: "两个数字，和一个自查的算法",
    priceDetail:
      "咨询 $2,000/小时；定制企业培训 $100k 起。写在明处，是为了替双方省时间。自查的算法：如果这一小时要影响的决策值六位数，这个价格就是划算的；还没到的话，先别花这个钱——B 站、YouTube 和 Knowledge Bank 一直开着，我判断里能公开的部分都在那里，免费。",
    passTitle: "先说清楚，哪些帮不上",
    passIntro:
      "三类提议我们通常会婉拒——不是事情不好，是我们给不出对得起你的交付：",
    passes: [
      "商单、软广，以及没用过的产品背书——判断不出售，我们也不能把自己没得出的结论递给观众。",
      "单纯换量的互推和资源置换——对两边的观众都没有增量。",
      "和 AI、增长、个人成长都不沾边的题目——我们讲不出内行的东西。",
    ],
    passClose: "不在这三类里的，都欢迎聊。",
    howTitle: "怎么联系",
    howIntro: "邮件里写清三件事，通常当周就能定：",
    hows: [
      "你是谁，一句话。",
      "想一起做什么——具体到形式和时间。",
      "你的观众或用户是谁，这件事对他们有什么用。",
    ],
    howClose: "三个工作日内一定回复——不合适也会回。",
    contactTitle: "孙煜征（课代表立正）",
    contactDetail: "yz@superlinear.academy · 商务合作微信：FM13870617",
    contactButton: "邮件联系",
    back: "回到主页",
    closing:
      "都不合适也没关系，当作认识一下——判断都公开留档，什么时候想翻都在。",
  },
};

export default function Collab() {
  const { lang } = useLanguage();
  const t = copy[lang];

  useEffect(() => {
    return applyPageSeo({
      title: t.seoTitle,
      description: t.seoDesc,
      canonical: "https://www.lizheng.ai/collab",
    });
  }, [lang, t]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,191,36,0.08)_0%,rgba(11,15,26,0)_24rem)]" />

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 transition hover:text-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <div>
              <div className="text-sm font-semibold text-amber-300">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
              </div>
              <div className="text-xs text-zinc-500">{t.navSub}</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle size="sm" />
            <Button
              asChild
              size="sm"
              className="bg-amber-400 text-[#211300] hover:bg-amber-300"
            >
              <a href="mailto:yz@superlinear.academy">
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                {t.contactButton}
              </a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300">
              {t.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] text-white md:text-6xl">
              {t.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              {t.intro}
            </p>
            <a
              href="/#record"
              className="group mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition hover:text-amber-300"
            >
              <span>{t.recordLink}</span>
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              {t.catEyebrow}
            </p>
            <div className="mt-5 grid gap-5">
              {t.categories.map(cat => (
                <article
                  key={cat.num}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 md:p-8"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm text-amber-300/90">
                      {cat.num}
                    </span>
                    <h2 className="text-xl font-semibold leading-8 text-white md:text-2xl">
                      {cat.title}
                    </h2>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                    {cat.detail}
                  </p>
                  {cat.items ? (
                    <ul className="mt-3 max-w-3xl space-y-1.5 border-l border-white/15 pl-4">
                      {cat.items.map(item => (
                        <li
                          key={item}
                          className="text-sm leading-7 text-zinc-400"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {cat.fit}
                  </p>
                  {cat.action ? (
                    <a
                      href={cat.action.href}
                      target={cat.action.external ? "_blank" : undefined}
                      rel={
                        cat.action.external ? "noopener noreferrer" : undefined
                      }
                      className="group mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 transition hover:text-amber-300"
                    >
                      {cat.action.href.endsWith(".pdf") ? (
                        <Download className="h-3 w-3" />
                      ) : null}
                      <span>{cat.action.label}</span>
                      <ExternalLink className="h-3 w-3 transition group-hover:translate-x-0.5" />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white">{t.priceTitle}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-300">
              {t.priceDetail}
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h3 className="text-lg font-semibold text-white">
                {t.passTitle}
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {t.passIntro}
              </p>
              <ul className="mt-4 space-y-3">
                {t.passes.map(item => (
                  <li
                    key={item}
                    className="border-l border-white/20 pl-4 text-sm leading-7 text-zinc-400"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                {t.passClose}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h3 className="text-lg font-semibold text-white">{t.howTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {t.howIntro}
              </p>
              <ol className="mt-4 space-y-3">
                {t.hows.map((item, i) => (
                  <li key={item} className="flex gap-3 text-sm leading-7">
                    <span className="font-mono text-amber-300/90">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {t.howClose}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.045] p-6 md:flex-row md:items-center md:p-8">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {t.contactTitle}
              </h3>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                {t.contactDetail}
              </p>
            </div>
            <a
              href="mailto:yz@superlinear.academy"
              className={cn(
                buttonVariants(),
                "bg-amber-400 text-[#211300] hover:bg-amber-300"
              )}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t.contactButton}
            </a>
          </div>

          <p className="mt-10 text-sm leading-7 text-zinc-500">{t.closing}</p>

          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
