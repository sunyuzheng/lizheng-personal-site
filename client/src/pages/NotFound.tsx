import { useLanguage } from "@/contexts/LanguageContext";
import { Home } from "lucide-react";
import { withLanguage } from "@/lib/language-url";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { applyPageSeo } from "@/lib/seo";

export default function NotFound() {
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();

  useEffect(
    () =>
      applyPageSeo({
        title:
          lang === "en"
            ? "Page not found · Yuzheng Sun"
            : "页面不存在 · 孙煜征",
        description:
          lang === "en" ? "This page does not exist." : "你访问的页面不存在。",
        canonical: "https://www.lizheng.ai/404",
        ogImage:
          "https://www.lizheng.ai/hero/acquired-behind-scenes-desktop.webp",
        locale: lang === "en" ? "en_US" : "zh_CN",
        robots: "noindex, follow",
        jsonLd: null,
      }),
    [lang]
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F1A] text-zinc-100">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-superlinear-on-dark mb-4">
          404
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-3">
          {lang === "en" ? "Page not found" : "页面不存在"}
        </h1>
        <p className="text-zinc-400 mb-8">
          {lang === "en"
            ? "This page may have been moved or deleted."
            : "你访问的页面可能已被移动或删除。"}
        </p>
        <button
          onClick={() => setLocation(withLanguage("/", lang))}
          className="inline-flex items-center gap-2 rounded-lg bg-superlinear px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-superlinear-deep"
        >
          <Home className="w-4 h-4" />
          {lang === "en" ? "Back home" : "回到首页"}
        </button>
      </div>
    </div>
  );
}
