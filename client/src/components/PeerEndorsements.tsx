import { useLanguage } from "@/contexts/LanguageContext";
import { Quotation } from "@/components/home/Peers";

// Full wording and existing translations follow yuzheng-profile/EVIDENCE.md
// and the previously published site. Ellipses explicitly mark shortened clauses.
// The homepage shows `punch`, the shortest faithful cut, where "|" marks where a
// narrow column may break a Chinese line (see Phrases); About shows the full
// quotations (and `excerpt` where a page wants a longer cut).
export const endorsements = [
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
      excerpt:
        "Yuzheng shares more than tools. He teaches a philosophy of thinking—the rarest and most valuable thing in the AI era.",
      punch: "Yuzheng shares more than tools. He teaches a philosophy of thinking…",
    },
    zh: {
      name: "刘嘉",
      role: "清华大学讲席教授 ·《最强大脑》总科学顾问",
      shortRole: "清华大学讲席教授",
      subject: "关于教学",
      quote:
        "立正分享的不只是工具，而是思维哲学——这才是AI时代最稀缺、最有价值的东西。他的课程让我这个科学家也深受启发。",
      excerpt:
        "立正分享的不只是工具，而是思维哲学——这才是AI时代最稀缺、最有价值的东西。",
      punch: "立正分享的不只是工具，而是思维哲学……",
      soft: ["他的课程让我这个科学家"],
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
      punch: "Yuzheng has built an AI education community that is carefully curated, practical…",
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
      punch: "立正做的AI教育社群|很少见：内容筛选认真，实战密度高……",
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
        "Yuzheng distills years of product growth wisdom into actionable insight—helping data scientists surface decisive signals, PMs turn numbers into strategy…",
      punch: "Yuzheng distills years of product growth wisdom into actionable insight…",
    },
    zh: {
      name: "Vijaye Raji",
      role: "Statsig创始人 · OpenAI CTO of Applications",
      shortRole: "OpenAI CTO of Applications",
      subject: "推荐《Growth Data Analytics Playbook》",
      quote:
        "立正把多年产品增长经验提炼成可执行的洞察：帮助数据科学家找到决定性信号、产品经理把数字变成策略，也帮助创始人找到能够持续复利的PMF路径。",
      excerpt:
        "立正把多年产品增长经验提炼成可执行的洞察：帮助数据科学家找到决定性信号、产品经理把数字变成策略……",
      punch: "立正把多年产品增长经验|提炼成可执行的洞察……",
      // Where a long phrase of the full quotation may break in a narrow column (see Quotation).
      soft: ["立正把多年产品增长经验", "帮助数据科学家", "也帮助创始人"],
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
      punch: "Yuzheng is a true AI-native pioneer.",
    },
    zh: {
      name: "戴雨森",
      role: "真格基金合伙人",
      shortRole: "真格基金合伙人",
      subject: "关于AI实践",
      quote:
        "立正是真正的AI Native Pioneer——他用独特的思维框架，带领更多人在AI时代实现超线性成长。",
      excerpt: "立正是真正的AI Native Pioneer……",
      punch: "立正是真正的|AI Native Pioneer……",
      soft: ["带领更多人"],
    },
  },
];

/**
 * The four quotations in full on About, set as on the homepage (the title face, two to a row), each
 * signed with the speaker's full role and what the words were said about.
 */
export default function PeerEndorsements() {
  const { lang } = useLanguage();
  return (
    <ul
      className="peer-list"
      aria-label={lang === "en" ? "Peer endorsements" : "来自同行的评价"}
    >
      {endorsements.map(item => {
        const copy = item[lang];
        return (
          <li key={item.id}>
            <figure>
              <blockquote>
                <Quotation
                  text={copy.quote}
                  soft={"soft" in copy ? copy.soft : undefined}
                />
              </blockquote>
              <figcaption>
                <img
                  src={item.avatar}
                  alt=""
                  loading="lazy"
                  width={44}
                  height={44}
                />
                <span>
                  <span className="who">
                    <b>{copy.name}</b>
                    <i>{copy.subject}</i>
                  </span>
                  <small>{copy.role}</small>
                </span>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
