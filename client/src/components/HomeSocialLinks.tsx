import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight, Mail } from "lucide-react";

const chineseChannels = [
  { label: "B站", href: "https://space.bilibili.com/491306902" },
  {
    label: "小红书",
    href: "https://www.xiaohongshu.com/user/profile/62a402140000000019029369",
  },
];
const youtube = {
  label: "YouTube",
  href: "https://www.youtube.com/@kedaibiao",
};
const professionalChannels = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/yuzhengsun/" },
  { label: "Substack", href: "https://yuzheng.substack.com/" },
  { label: "GitHub", href: "https://github.com/sunyuzheng" },
];

export default function HomeSocialLinks({
  footer = false,
}: {
  footer?: boolean;
}) {
  const { lang } = useLanguage();
  const channels =
    lang === "zh"
      ? [
          ...chineseChannels,
          youtube,
          ...(footer ? professionalChannels : professionalChannels.slice(0, 1)),
        ]
      : [youtube, ...professionalChannels];
  return (
    <div
      aria-label={lang === "zh" ? "关注我的内容" : "Follow my work"}
      className={`flex flex-wrap items-center gap-x-5 gap-y-1 ${footer ? "max-w-md" : "mt-5 border-t border-white/10 pt-2"}`}
    >
      {channels.map(channel => (
        <a
          key={channel.label}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-lizheng-muted transition hover:text-white"
        >
          {channel.label}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      ))}
      {footer && (
        <a
          href="mailto:yz@superlinear.academy"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-lizheng-muted transition hover:text-white"
        >
          <Mail className="size-4" />
          {lang === "zh" ? "邮件" : "Email"}
        </a>
      )}
    </div>
  );
}
