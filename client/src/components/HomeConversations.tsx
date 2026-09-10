import type { Lang } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

// Homepage curation, not the source of truth for the full guest directory.
// Portrait and conversation sources: docs/reviews/conversations-2026-09-10.md.
const guests = [
  {
    slug: "tian-yuandong",
    topic: { zh: "AI研究", en: "AI RESEARCH" },
    headline: {
      zh: ["模型的顿悟", "研究者的品味"],
      en: ["Grokking", "& research taste"],
    },
    name: { zh: "田渊栋", en: "Yuandong Tian" },
    role: {
      zh: "前 Meta FAIR 研究总监",
      en: "Former Research Director, Meta FAIR",
    },
    image: "/guest-portraits/yuandong-tian.png",
    position: "50% 40%",
  },
  {
    slug: "shuchao-bi",
    topic: { zh: "技术前沿", en: "AI FRONTIERS" },
    headline: {
      zh: ["AI往何处去", "模型的自我迭代"],
      en: ["Where AI", "goes next"],
    },
    name: { zh: "毕书超", en: "Shuchao Bi" },
    role: {
      zh: "YouTube Shorts 联合创始人 · 前 OpenAI 多模态后训练负责人",
      en: "Co-founder, YouTube Shorts · Former Multimodal Post-Training Lead, OpenAI",
    },
    image: "/guest-portraits/shuchao-bi.jpg",
    position: "50% 40%",
    portraitScale: 1.5,
  },
  {
    slug: "reynold-xin",
    topic: { zh: "技术创业", en: "COMPANY BUILDING" },
    headline: {
      zh: ["大机会", "是怎样抓住的"],
      en: ["Spotting a", "big opportunity"],
    },
    name: { zh: "Reynold Xin", en: "Reynold Xin" },
    role: {
      zh: "Databricks 联合创始人、首席架构师",
      en: "Co-founder & Chief Architect, Databricks",
    },
    image: "/guest-portraits/reynold-xin.jpg",
    position: "50% 40%",
  },
  {
    slug: "yangqing-jia",
    topic: { zh: "创业圆桌", en: "FOUNDER ROUNDTABLE" },
    headline: {
      zh: ["AI创业", "从模型到市场"],
      en: ["Building", "beyond", "the model"],
    },
    name: { zh: "贾扬清", en: "Yangqing Jia" },
    role: {
      zh: "Caffe 作者 · Lepton AI 创始人（被 NVIDIA 收购）",
      en: "Creator of Caffe · Founder, Lepton AI (acquired by NVIDIA)",
    },
    image: "/guest-portraits/yangqing-jia.jpg",
    position: "50% 35%",
  },
  {
    slug: "howie-xu",
    topic: { zh: "周期与判断", en: "CYCLES & JUDGMENT" },
    headline: {
      zh: ["亲历两轮泡沫", "这次有何不同"],
      en: ["Two bubbles.", "What is", "different?"],
    },
    language: "zh",
    name: { zh: "硅谷徐老师", en: "Howie Xu" },
    role: {
      zh: "Howie Xu · Gen 首席AI与创新官",
      en: "Chief AI & Innovation Officer, Gen",
    },
    image: "/guest-portraits/howie-xu.jpg",
    position: "50% 35%",
  },
  {
    slug: "gergely-orosz",
    topic: { zh: "工程师职业", en: "ENGINEERING CAREERS" },
    headline: {
      zh: ["AI时代的", "工程师职业"],
      en: ["Engineering", "careers & AI"],
    },
    language: "en",
    name: { zh: "Gergely Orosz", en: "Gergely Orosz" },
    role: {
      zh: "The Pragmatic Engineer 创始人",
      en: "Founder, The Pragmatic Engineer",
    },
    href: "https://www.youtube.com/watch?v=-WvvJBd3hDI",
    image: "/guest-portraits/gergely-orosz.png",
    position: "50% 35%",
  },
  {
    slug: "liu-jia",
    topic: { zh: "认知与教育", en: "MIND & EDUCATION" },
    headline: {
      zh: ["大脑、AI", "与教育的未来"],
      en: ["The brain,", "AI & education"],
    },
    name: { zh: "刘嘉", en: "Liu Jia" },
    role: {
      zh: "清华大学讲席教授",
      en: "Chair Professor, Tsinghua University",
    },
    image: "/avatars/liu-jia.jpg",
    position: "50% 35%",
  },
  {
    slug: "vijaye-raji",
    topic: { zh: "职业选择", en: "CAREER CHOICES" },
    headline: {
      zh: ["从大厂高管", "到创业者"],
      en: ["From big tech", "to founder"],
    },
    name: { zh: "Vijaye Raji", en: "Vijaye Raji" },
    role: {
      zh: "OpenAI 应用 CTO · Statsig 创始人",
      en: "CTO of Applications, OpenAI · Founder, Statsig",
    },
    image: "/avatars/vijaye-raji.jpg",
    position: "50% 40%",
  },
  {
    slug: "ryo-lu",
    topic: { zh: "设计与创造", en: "DESIGN & CRAFT" },
    headline: {
      zh: ["走出Figma", "在代码中设计"],
      en: ["Beyond Figma.", "Designing", "in code."],
    },
    name: { zh: "Ryo Lu", en: "Ryo Lu" },
    role: {
      zh: "前 Cursor 设计负责人",
      en: "Former Head of Design, Cursor",
    },
    image: "/guest-portraits/ryo-lu.jpg",
    position: "50% 40%",
  },
] as const;

export default function HomeConversations({ lang }: { lang: Lang }) {
  const selectedGuests = guests.filter(
    guest => !("language" in guest) || guest.language === lang
  );

  return (
    <section
      id="conversations"
      aria-labelledby="conversations-heading"
      className="scroll-mt-[72px] bg-lizheng-dark py-16 md:py-24"
    >
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-superlinear-on-dark">
              {lang === "en" ? "200+ CONVERSATIONS" : "200+场公开对话"}
            </p>
            <h2
              id="conversations-heading"
              className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl"
            >
              {lang === "en" ? (
                "The people behind the work."
              ) : (
                <>
                  <span className="inline-block">和他们，</span>
                  <span className="inline-block">把问题聊透。</span>
                </>
              )}
            </h2>
          </div>
          <p className="max-w-lg text-pretty text-base leading-8 text-zinc-400">
            {lang === "en"
              ? "How does research break through? How do products take shape? And how do we grow along the way?"
              : "研究是怎么突破的，产品是怎么做成的，人又该怎样成长？"}
          </p>
        </div>

        <ul className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 md:mt-12 xl:grid-cols-4">
          {selectedGuests.map(guest => {
            const external = "href" in guest;
            const href = external
              ? guest.href
              : withLanguage(`/guests/${guest.slug}`, lang);
            const GuestLink = external ? "a" : Link;
            return (
              <li key={guest.slug} className="min-w-0">
                <GuestLink
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group block h-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-superlinear-on-dark"
                >
                  <div className="conversation-cover">
                    <div className="conversation-cover-copy">
                      <p className="conversation-cover-topic">
                        {guest.topic[lang]}
                      </p>
                      <p className="conversation-cover-title">
                        {guest.headline[lang].map(line => (
                          <span key={line}>{line}</span>
                        ))}
                      </p>
                      <span
                        className="conversation-cover-rule"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="conversation-cover-portrait">
                      <img
                        src={guest.image}
                        alt=""
                        width={320}
                        height={480}
                        loading="lazy"
                        style={{
                          objectPosition: guest.position,
                          scale:
                            "portraitScale" in guest
                              ? String(guest.portraitScale)
                              : undefined,
                          transformOrigin: "50% 25%",
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold leading-7 tracking-tight text-white">
                      {guest.name[lang]}
                    </h3>
                    <ArrowUpRight
                      className="mt-1.5 h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-superlinear-on-dark group-focus-visible:text-superlinear-on-dark"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 text-[13px] leading-5 text-zinc-400">
                    {guest.role[lang]}
                  </p>
                </GuestLink>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-zinc-400 sm:text-sm">
            {lang === "en"
              ? "400K+ followers · YouTube, Bilibili & Xiaohongshu"
              : "YouTube、B站、小红书 · 40万+关注者"}
          </p>
          <Link
            href={withLanguage("/guests", lang)}
            className="inline-flex min-h-11 items-center gap-3 self-start text-sm font-semibold text-superlinear-on-dark outline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-superlinear-on-dark sm:self-auto"
          >
            {lang === "en" ? "Browse all conversations" : "查看全部嘉宾访谈"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
