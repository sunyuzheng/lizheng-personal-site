import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";

interface CollabHeaderProps {
  backHref: string;
  section: { en: string; zh: string };
}

export default function CollabHeader({ backHref, section }: CollabHeaderProps) {
  const { lang } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 border-b border-superlinear-cream bg-superlinear-canvas/95 text-superlinear-body backdrop-blur-xl">
      <div className="container flex items-center justify-between gap-2 py-4">
        <Link
          href={withLanguage(backHref, lang)}
          className="flex min-w-0 items-center gap-2 text-superlinear-body transition hover:text-superlinear-link"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <div className="whitespace-nowrap text-sm font-semibold text-superlinear-link">
              {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
            </div>
            <div className="hidden truncate text-xs text-superlinear-body/75 min-[340px]:block">
              {section[lang]}
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageToggle size="sm" surface="light" />
          <Button
            asChild
            size="sm"
            className="bg-superlinear text-white hover:bg-superlinear-deep"
          >
            <a
              href="mailto:yz@superlinear.academy"
              aria-label={
                lang === "en" ? "Email Yuzheng" : "邮件联系课代表立正"
              }
            >
              <Mail className="h-3.5 w-3.5 min-[360px]:mr-1.5" />
              <span className="hidden min-[360px]:inline">
                {lang === "en" ? "Email" : "邮件联系"}
              </span>
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
