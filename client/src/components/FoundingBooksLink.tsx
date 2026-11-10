import type { Lang } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { FOUNDING_BOOKS_URL } from "@shared/book-links";

/**
 * Where Founding Members get the three books' preview editions: one quiet line under the books,
 * like a colophon, on the homepage's books chapter and on the books page (both wear .lz-home, whose
 * text link this uses).
 */
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
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-lz-line pt-4",
        className
      )}
    >
      <p className="text-[14px] leading-6 text-lz-ink-2">
        {lang === "zh"
          ? "三本书都有会员预览版。Founding Member登录学院账号验证后，可以读，也可以下载。"
          : "Member previews of all three books. Verify your Academy account to read and download."}
      </p>
      <a href={FOUNDING_BOOKS_URL} className="lz-link min-h-11">
        {lang === "zh"
          ? "去领取EPUB和PDF"
          : "Founding Member EPUB/PDF access"}{" "}
        <i aria-hidden="true">→</i>
      </a>
    </aside>
  );
}
