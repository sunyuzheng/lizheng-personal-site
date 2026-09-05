import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const endorsements = {
  en: [
    {
      quote:
        "Yuzheng has built an AI education community that is carefully curated, practical, and unusually useful for people doing real work.",
      name: "Wei Manfredi",
      role: "Senior Vice President, AI & Architecture · IHG Hotels & Resorts",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "Yuzheng shares more than tools. He teaches a philosophy of thinking—the rarest and most valuable thing in the AI era. Even as a scientist, I found his course deeply illuminating.",
      name: "Liu Jia",
      role: "Chair Professor, Tsinghua University · Cognitive neuroscientist",
      avatar: "/avatars/liu-jia.jpg",
      initials: "LJ",
    },
  ],
  zh: [
    {
      quote:
        "立正做的AI教育社群很少见：内容筛选认真，实战密度高，也确实贴近工作里的问题。",
      name: "Wei Manfredi",
      role: "IHG Hotels & Resorts AI与架构高级副总裁",
      avatar: "/avatars/wei-manfredi.jpg",
      initials: "WM",
    },
    {
      quote:
        "立正分享的不只是工具，而是思维哲学——这才是AI时代最稀缺、最有价值的东西。他的课程让我这个科学家也深受启发。",
      name: "刘嘉",
      role: "清华大学讲席教授 ·《最强大脑》总科学顾问",
      avatar: "/avatars/liu-jia.jpg",
      initials: "刘嘉",
    },
  ],
};

export default function EducationEndorsements() {
  const { lang } = useLanguage();
  return (
    <div className="mt-10 grid border-y border-white/15 lg:grid-cols-2">
      {endorsements[lang].map((item, index) => (
        <blockquote
          key={item.name}
          className={cn(
            "py-8 lg:px-8",
            index > 0 && "border-t border-white/15 lg:border-l lg:border-t-0"
          )}
        >
          <p className="text-lg leading-8 text-zinc-200">“{item.quote}”</p>
          <footer className="mt-6 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/15">
              <AvatarImage src={item.avatar} alt={item.name} />
              <AvatarFallback>{item.initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold text-white">
                {item.name}
              </div>
              <div className="mt-0.5 text-xs leading-5 text-zinc-400">
                {item.role}
              </div>
            </div>
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
