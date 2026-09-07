import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

// Full wording and existing translations follow yuzheng-profile/EVIDENCE.md
// and the previously published site. Ellipses explicitly mark shortened clauses.
const endorsements = [
  {
    id: "liu-jia",
    avatar: "/avatars/liu-jia.jpg",
    en: {
      name: "Liu Jia",
      role: "Chair Professor, Tsinghua University · Cognitive neuroscientist",
      shortRole: "Chair Professor, Tsinghua University",
      subject: "On teaching",
      quote:
        "Yuzheng shares more than tools. He teaches a philosophy of thinking—the rarest and most valuable thing in the AI era. Even as a scientist, I found his course deeply illuminating.",
      excerpt: "Even as a scientist, I found his course deeply illuminating.",
    },
    zh: {
      name: "刘嘉",
      role: "清华大学讲席教授 ·《最强大脑》总科学顾问",
      shortRole: "清华大学讲席教授",
      subject: "关于教学",
      quote:
        "立正分享的不只是工具，而是思维哲学——这才是AI时代最稀缺、最有价值的东西。他的课程让我这个科学家也深受启发。",
      excerpt: "他的课程让我这个科学家也深受启发。",
    },
  },
  {
    id: "wei-manfredi",
    avatar: "/avatars/wei-manfredi.jpg",
    en: {
      name: "Wei Manfredi",
      role: "Senior Vice President, AI & Architecture · IHG Hotels & Resorts",
      shortRole: "SVP, AI & Architecture · IHG",
      subject: "On the community",
      quote:
        "Yuzheng has built an AI education community that is carefully curated, practical, and unusually useful for people doing real work.",
      excerpt:
        "Yuzheng has built an AI education community that is carefully curated, practical, and unusually useful for people doing real work.",
    },
    zh: {
      name: "Wei Manfredi",
      role: "IHG Hotels & Resorts AI与架构高级副总裁",
      shortRole: "IHG AI与架构高级副总裁",
      subject: "关于社群",
      quote:
        "立正做的AI教育社群很少见：内容筛选认真，实战密度高，也确实贴近工作里的问题。",
      excerpt:
        "立正做的AI教育社群很少见：内容筛选认真，实战密度高，也确实贴近工作里的问题。",
    },
  },
  {
    id: "vijaye-raji",
    avatar: "/avatars/vijaye-raji.jpg",
    en: {
      name: "Vijaye Raji",
      role: "Founder, Statsig · CTO of Applications, OpenAI",
      shortRole: "CTO of Applications, OpenAI",
      subject: "On Growth Data Analytics Playbook",
      quote:
        "Yuzheng distills years of product growth wisdom into actionable insight—helping data scientists surface decisive signals, PMs turn numbers into strategy, and founders find a repeatable path to compounding PMF.",
      excerpt:
        "Yuzheng distills years of product growth wisdom into actionable insight…",
    },
    zh: {
      name: "Vijaye Raji",
      role: "Statsig创始人 · OpenAI CTO of Applications",
      shortRole: "OpenAI CTO of Applications",
      subject: "推荐《Growth Data Analytics Playbook》",
      quote:
        "立正把多年产品增长经验提炼成可执行的洞察：帮助数据科学家找到决定性信号、产品经理把数字变成策略，也帮助创始人找到能够持续复利的PMF路径。",
      excerpt: "立正把多年产品增长经验提炼成可执行的洞察……",
    },
  },
  {
    id: "dai-yusen",
    avatar: "/avatars/dai-yusen.jpg",
    en: {
      name: "Dai Yusen",
      role: "Partner, ZhenFund",
      shortRole: "Partner, ZhenFund",
      subject: "On AI practice",
      quote:
        "Yuzheng is a true AI-native pioneer. With his distinctive way of thinking, he helps more people achieve superlinear growth in the AI era.",
      excerpt: "Yuzheng is a true AI-native pioneer.",
    },
    zh: {
      name: "戴雨森",
      role: "真格基金合伙人",
      shortRole: "真格基金合伙人",
      subject: "关于AI实践",
      quote:
        "立正是真正的AI Native Pioneer——他用独特的思维框架，带领更多人在AI时代实现超线性成长。",
      excerpt: "立正是真正的AI Native Pioneer……",
    },
  },
];

export default function PeerEndorsements({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { lang } = useLanguage();
  return (
    <div aria-label={lang === "en" ? "Peer endorsements" : "来自同行的评价"}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <p
          className={cn(
            "text-xs font-medium",
            compact ? "text-superlinear-deep" : "text-superlinear-on-dark"
          )}
        >
          {lang === "en"
            ? compact
              ? "FROM PEERS · SELECTED EXCERPTS"
              : "FROM PEERS"
            : compact
              ? "来自同行的评价 · 节选"
              : "来自同行的评价"}
        </p>
        {compact && (
          <Link
            href={`${withLanguage("/about", lang)}#endorsements`}
            className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-superlinear-link hover:text-superlinear-deep"
          >
            {lang === "en" ? "Read the full endorsements" : "读完整评价"}
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <div
        className={cn(
          "grid",
          compact
            ? "mt-2 gap-x-8 border-t border-[#DDD9D0] sm:grid-cols-2 xl:grid-cols-4"
            : "mt-6 gap-x-12 border-t border-white/15 md:grid-cols-2"
        )}
      >
        {endorsements.map(item => {
          const copy = item[lang];
          return (
            <figure
              key={item.id}
              className={cn(
                "py-6",
                compact
                  ? "border-b border-[#DDD9D0]"
                  : "border-b border-white/15 md:py-8"
              )}
            >
              <figcaption
                className={cn(
                  "flex items-start gap-3",
                  compact && "xl:min-h-[68px]"
                )}
              >
                <img
                  src={item.avatar}
                  alt=""
                  loading="lazy"
                  width={40}
                  height={40}
                  className={cn(
                    "size-10 shrink-0 rounded-full object-cover",
                    !compact && "size-12"
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-base font-semibold leading-6",
                      compact ? "text-superlinear-ink" : "text-white"
                    )}
                  >
                    {copy.name}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-5",
                      compact ? "text-[#5C574D]" : "text-zinc-400"
                    )}
                  >
                    {compact ? copy.shortRole : copy.role}
                  </p>
                </div>
              </figcaption>
              {!compact && (
                <p className="mt-5 text-xs leading-5 text-superlinear-on-dark">
                  {copy.subject}
                </p>
              )}
              <blockquote
                className={cn(
                  "mt-4 leading-7",
                  compact
                    ? "text-[15px] text-[#4B4238]"
                    : "text-lg leading-8 text-zinc-200"
                )}
              >
                “{compact ? copy.excerpt : copy.quote}”
              </blockquote>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
