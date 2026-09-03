import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { ArrowLeft, Youtube } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";

interface GuestsLayoutProps {
  children: ReactNode;
}

export default function GuestsLayout({ children }: GuestsLayoutProps) {
  const { lang } = useLanguage();
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-lizheng-dark text-zinc-100">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-superlinear/15 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-lizheng-dark/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <Link
            href={withLanguage("/", lang)}
            className="flex min-h-11 items-center gap-2 text-zinc-400 transition hover:text-superlinear-on-dark md:min-h-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <div>
              <div className="text-sm font-semibold text-superlinear-on-dark">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
              </div>
              <div className="text-xs text-lizheng-muted">
                {lang === "en" ? "课代表立正" : "Yuzheng Sun"}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle
              size="sm"
              className="[&>a]:flex [&>a]:min-h-11 [&>a]:min-w-11 [&>a]:items-center [&>a]:justify-center md:[&>a]:min-h-0 md:[&>a]:min-w-0"
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="min-h-11 border-superlinear-on-dark/40 bg-superlinear/10 text-superlinear-pale hover:bg-superlinear/20 md:min-h-8"
            >
              <a
                href="https://www.youtube.com/@kedaibiao"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="mr-1.5 h-3.5 w-3.5" />
                {lang === "en" ? "Subscribe" : "订阅频道"}
              </a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 mt-16 border-t border-white/10 bg-black/30 py-10 text-center">
        <p className="text-sm text-lizheng-muted">
          <Link
            href={withLanguage("/", lang)}
            className="inline-flex min-h-11 items-center text-superlinear-on-dark transition hover:text-white md:min-h-0"
          >
            {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
          </Link>{" "}
          ·{" "}
          {lang === "en"
            ? "All interview content © original rights holders"
            : "访谈内容版权所有"}
          <span className="mx-2 text-zinc-700">·</span>
          <Link
            href={withLanguage("/collab/creators", lang)}
            className="inline-flex min-h-11 items-center text-zinc-400 transition hover:text-superlinear-on-dark md:min-h-0"
          >
            {lang === "en" ? "Invite me to your show" : "邀请我上节目"}
          </Link>
        </p>
      </footer>
    </div>
  );
}
