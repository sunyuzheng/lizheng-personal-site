import type { Lang } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { FOUNDING_BOOKS_URL } from "@shared/book-links";
import { ArrowRight } from "lucide-react";

export default function FoundingBooksLink({
  lang,
  className,
}: {
  lang: Lang;
  className?: string;
}) {
  return (
    <aside
      aria-label={
        lang === "zh" ? "Founding Member电子书领取" : "Founding Member books"
      }
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[10px] border border-lz-green/20 bg-lz-green/[0.06] px-5 py-4",
        className
      )}
    >
      <p className="text-[13px] leading-6 text-lz-ink-2">
        {lang === "zh"
          ? "三本原版的会员内部预览，登录学院账号验证后即可阅读与下载。"
          : "Member previews of all three books. Verify your Academy account to read and download."}
      </p>
      <a
        href={FOUNDING_BOOKS_URL}
        className="inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-lz-green underline decoration-lz-green/35 underline-offset-4 transition hover:text-superlinear-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lz-green"
      >
        {lang === "zh"
          ? "Founding Member专属领取EPUB/PDF"
          : "Founding Member EPUB/PDF access"}
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
    </aside>
  );
}
