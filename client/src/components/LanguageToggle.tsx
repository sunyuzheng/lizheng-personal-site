import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link, useLocation } from "wouter";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export default function LanguageToggle({
  className = "",
  size = "md",
}: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const [location] = useLocation();
  const pad = size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <div
      className={`inline-flex shrink-0 items-center overflow-hidden rounded-full border border-white/15 bg-white/5 ${className}`}
      role="group"
      aria-label="Language"
    >
      <Link
        href={withLanguage(location, "en")}
        onClick={() => setLang("en")}
        aria-current={lang === "en" ? "page" : undefined}
        hrefLang="en"
        className={`${pad} whitespace-nowrap font-semibold uppercase tracking-wide transition ${
          lang === "en"
            ? "bg-amber-300 text-[#211300]"
            : "text-zinc-400 hover:text-amber-200"
        }`}
      >
        EN
      </Link>
      <Link
        href={withLanguage(location, "zh")}
        onClick={() => setLang("zh")}
        aria-current={lang === "zh" ? "page" : undefined}
        hrefLang="zh-CN"
        className={`${pad} whitespace-nowrap font-semibold transition ${
          lang === "zh"
            ? "bg-amber-300 text-[#211300]"
            : "text-zinc-400 hover:text-amber-200"
        }`}
      >
        中文
      </Link>
    </div>
  );
}
