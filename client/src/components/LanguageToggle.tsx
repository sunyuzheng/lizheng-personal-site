import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { Link, useLocation } from "wouter";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md";
  surface?: "dark" | "light";
}

export default function LanguageToggle({
  className = "",
  size = "md",
  surface = "dark",
}: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const [location] = useLocation();
  const pad = size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs";
  const activeTone = "bg-superlinear text-white";
  const inactiveTone =
    surface === "light"
      ? "text-superlinear-body hover:bg-superlinear-hover hover:text-superlinear-link"
      : "text-zinc-400 hover:text-superlinear-on-dark";
  const frameTone =
    surface === "light"
      ? "border-superlinear-cream bg-superlinear-surface"
      : "border-white/15 bg-white/5";

  return (
    <div
      className={`inline-flex shrink-0 items-center overflow-hidden rounded-full border ${frameTone} ${className}`}
      role="group"
      aria-label="Language"
    >
      <Link
        href={withLanguage(location, "en")}
        onClick={() => setLang("en")}
        aria-current={lang === "en" ? "page" : undefined}
        hrefLang="en"
        className={`${pad} whitespace-nowrap font-semibold uppercase tracking-wide transition ${
          lang === "en" ? activeTone : inactiveTone
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
          lang === "zh" ? activeTone : inactiveTone
        }`}
      >
        中文
      </Link>
    </div>
  );
}
