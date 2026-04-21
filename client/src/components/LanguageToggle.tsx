import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export default function LanguageToggle({
  className = "",
  size = "md",
}: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const pad = size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5 ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`${pad} font-semibold uppercase tracking-wide transition ${
          lang === "en"
            ? "bg-amber-300 text-[#211300]"
            : "text-zinc-400 hover:text-amber-200"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`${pad} font-semibold transition ${
          lang === "zh"
            ? "bg-amber-300 text-[#211300]"
            : "text-zinc-400 hover:text-amber-200"
        }`}
      >
        中文
      </button>
    </div>
  );
}
