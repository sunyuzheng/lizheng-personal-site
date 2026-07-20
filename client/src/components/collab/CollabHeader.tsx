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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between gap-2 py-4">
        <Link
          href={withLanguage(backHref, lang)}
          className="flex min-w-0 items-center gap-2 text-zinc-400 transition hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <div className="whitespace-nowrap text-sm font-semibold text-amber-300">
              {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
            </div>
            <div className="hidden truncate text-xs text-zinc-400 min-[340px]:block">
              {section[lang]}
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageToggle size="sm" />
          <Button
            asChild
            size="sm"
            className="bg-amber-400 text-[#211300] hover:bg-amber-300"
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
