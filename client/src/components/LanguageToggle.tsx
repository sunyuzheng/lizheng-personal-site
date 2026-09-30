import { useLanguage } from "@/contexts/LanguageContext";
import { followsReaderLanguage, withLanguage } from "@/lib/language-url";
import { Link, useLocation } from "wouter";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md";
  surface?: "dark" | "light";
  /**
   * `segmented` shows both languages; `pill` shows a single link to the other
   * language, as in the shared site header.
   */
  variant?: "segmented" | "pill";
  /** Accessible name for the `pill` variant. */
  label?: string;
}

export default function LanguageToggle({
  className = "",
  size = "md",
  surface = "dark",
  variant = "segmented",
  label,
}: LanguageToggleProps) {
  const { lang, setReaderLang } = useLanguage();
  const [location] = useLocation();

  if (variant === "pill") {
    const other = lang === "en" ? "zh" : "en";
    // Guest pages have no second address, so the switch happens in place.
    if (followsReaderLanguage(location)) {
      return (
        <button
          type="button"
          onClick={() => setReaderLang(other)}
          lang={other === "en" ? "en" : "zh-CN"}
          aria-label={label}
          className={className}
        >
          {other === "en" ? "EN" : "中文"}
        </button>
      );
    }
    return (
      <Link
        href={withLanguage(location, other)}
        hrefLang={other === "en" ? "en" : "zh-CN"}
        lang={other === "en" ? "en" : "zh-CN"}
        aria-label={label}
        className={className}
      >
        {other === "en" ? "EN" : "中文"}
      </Link>
    );
  }

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
