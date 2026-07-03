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

const copy = {
  en: {
    seoTitle: "Collaborate · Yuzheng Sun",
    seoDesc:
      "Invite Yuzheng Sun (课代表立正) to your podcast or event: three prepared episode directions, logistics, and a downloadable guest kit.",
    navSub: "Collaborate",
    eyebrow: "Podcasts · Interviews · Events",
    h1: "Everything you need for an episode, on one page.",
    intro:
      "The dated, checkable track record lives on the homepage. This page has the rest: three prepared episode directions, logistics, and a guest kit you can forward.",
    recordLink: "See the on-record calls",
    topicsEyebrow: "Three directions, prepared for your audience — one is enough",
    topics: [
      {
        num: "Direction 1",
        title: "Predictions, audited: putting the public calls on the table",
        detail:
          "Which calls landed, which missed, and the reasoning at the time. Every source carries a date — including the misses.",
        fit: "Fits: audiences drowning in AI news — three years compressed into one hour.",
      },
      {
        num: "Direction 2",
        title: "What are people earning $1M actually anxious about?",
        detail:
          "Three first-hand layers: an economist's framework (the marginal cost of distributing intelligence goes to zero — which jobs gain leverage, which get zeroed out), a sample of 3,000 Silicon Valley engineer students, and observations from corporate trainings at Tencent, Meituan, and Xiaohongshu.",
        fit: "Fits: audiences asking “will AI come for me” — answers with a framework and data.",
      },
      {
        num: "Direction 3",
        title: "From User to Builder: compounding AI leverage for non-engineers",
        detail:
          "How people who don't write code put AI to real work: agent habits, reusable compounding skills, and making outcomes deterministic. Field-tested in corporate trainings at Meituan and Xiaohongshu.",
        fit: "Fits: audiences who aren't engineers but refuse to stay spectators.",
      },
    ],
    range:
      "Beyond these three: growth, data & experimentation (Growth Data Analytics Playbook · sole evangelist at Statsig) · career leverage (真本事) · an economics PhD's take on metaphysics. For creator-focused shows there is one more option: why a long-free community started charging — a fully open-numbers case study.",
    practical: [
      {
        title: "Distribution",
        detail:
          "After the episode ships, it gets pushed across YouTube, Bilibili, and Xiaohongshu simultaneously.",
      },
      {
        title: "Scheduling",
        detail: "Recording time follows your calendar; remote works fine.",
      },
      {
        title: "Prep",
        detail:
          "Pick a direction and the relevant sources and data arrive before the recording — no extra homework for you.",
      },
    ],
    kitTitle: "Guest kit (3-page PDF)",
    kitDetail:
      "Track record, bio and verified numbers, episode directions — ready to forward.",
    kitButton: "Download PDF",
    contactTitle: "Yuzheng Sun (课代表立正)",
    contactButton: "Email",
    back: "Back to homepage",
    closing:
      "If none of this fits your show, no problem — the calls stay on the record, whenever you want to check them.",
  },
  zh: {
    seoTitle: "合作 · 课代表立正",
    seoDesc:
      "邀请课代表立正上播客或活动：三个准备好的选题方向、实务安排，以及可直接转发的嘉宾资料包。",
    navSub: "合作",
    eyebrow: "播客 · 访谈 · 活动",
    h1: "一期节目需要的东西，都在这一页。",
    intro:
      "带日期、可对账的判断记录在主页。这一页是剩下的部分：三个准备好的选题方向、实务安排，和一份可以直接转发的嘉宾资料包。",
    recordLink: "看判断留档",
    topicsEyebrow: "为你的观众准备了三个方向，选一个就够",
    topics: [
      {
        num: "方向一",
        title: "预言复盘：把 2023 年以来的公开判断摊开对答案",
        detail:
          "哪条对了，哪条错了，当时是怎么想的。所有原文带日期可查，包括错的。",
        fit: "适合：观众常被 AI 资讯淹没——这一期把三年的信息压缩成一个小时。",
      },
      {
        num: "方向二",
        title: "年薪百万的人在焦虑什么",
        detail:
          "三层都是一手的：经济学家的框架——智力分发的边际成本降为 0，哪类工作的杠杆在放大、哪类在清零；3,000 名硅谷工程师学员的样本；腾讯、美团、小红书内训现场的观察。",
        fit: "适合：观众问过「AI 到底会不会动到我」——答案带框架，也带数据。",
      },
      {
        num: "方向三",
        title: "从 User 到 Builder：普通人把 AI 用出复利",
        detail:
          "不写代码的人怎么动手把 AI 用好：养成用 agent 的习惯，持续产出能复用、能复利的 skills，把结果做确定。这套内容在美团、小红书的企业内训里当场验证过。",
        fit: "适合：观众不是工程师，但不想只当看客。",
      },
    ],
    range:
      "这三个之外还能聊：增长、数据与实验（《Growth Data Analytics Playbook》· Statsig 唯一布道师）· 个人成长与职业杠杆（《真本事》）· 一个经济学博士怎么看玄学。观众偏创作者的节目，还有一个备选：免费社区办了几年，为什么开始收费——一个数字全公开的商业化案例。",
    practical: [
      {
        title: "分发",
        detail: "节目上线后，B 站、YouTube、小红书三个平台同步推这一期。",
      },
      { title: "档期", detail: "录制时间随你的档期，远程连线即可。" },
      {
        title: "资料",
        detail: "选定方向后，提前把相关原文和数据整理给你，不用再做功课。",
      },
    ],
    kitTitle: "嘉宾资料包（三页 PDF）",
    kitDetail: "判断留档、人物与数字、选题方向——可以直接转发给团队。",
    kitButton: "下载 PDF",
    contactTitle: "孙煜征（课代表立正）",
    contactButton: "邮件联系",
    back: "回到主页",
    closing:
      "方向不合也没关系，当作认识一下——判断都公开留档，什么时候想翻都在。",
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
              {t.topicsEyebrow}
            </p>
            <div className="mt-5 grid gap-5">
              {t.topics.map(topic => (
                <article
                  key={topic.num}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 md:p-8"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
                    {topic.num}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-8 text-white md:text-2xl">
                    {topic.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                    {topic.detail}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {topic.fit}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-6 max-w-4xl text-sm leading-7 text-zinc-400">
              {t.range}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {t.practical.map(item => (
              <div key={item.title} className="border-t-2 border-white/60 pt-4">
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-6 md:p-8">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {t.kitTitle}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  {t.kitDetail}
                </p>
              </div>
              <a
                href="/collab/podcast-one-pager.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants(),
                  "mt-6 w-fit bg-amber-400 text-[#211300] hover:bg-amber-300"
                )}
              >
                <Download className="mr-2 h-4 w-4" />
                {t.kitButton}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-6 md:p-8">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {t.contactTitle}
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  yz@superlinear.academy · 商务合作微信：FM13870617
                </p>
              </div>
              <a
                href="mailto:yz@superlinear.academy"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 w-fit border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                )}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t.contactButton}
              </a>
            </div>
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
