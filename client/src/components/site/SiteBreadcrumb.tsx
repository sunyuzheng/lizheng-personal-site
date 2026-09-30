import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

type Label = { en: string; zh: string };

/** "← Parent / Current" line for pages that sit below another page. */
export default function SiteBreadcrumb({
  parent,
  current,
  tone = "dark",
}: {
  parent: Label & { href: string };
  current: Label;
  tone?: "dark" | "light";
}) {
  const { lang } = useLanguage();
  return (
    <nav
      aria-label={lang === "en" ? "Breadcrumb" : "位置"}
      className={cn(
        "container flex items-center gap-2 pt-5 text-sm",
        tone === "dark" ? "text-zinc-400" : "text-lz-muted"
      )}
    >
      <Link
        href={withLanguage(parent.href, lang)}
        className={cn(
          "inline-flex min-h-11 items-center gap-1 transition md:min-h-0",
          tone === "dark"
            ? "text-superlinear-on-dark hover:text-white"
            : "text-superlinear-link hover:text-lz-ink"
        )}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        {parent[lang]}
      </Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{current[lang]}</span>
    </nav>
  );
}
