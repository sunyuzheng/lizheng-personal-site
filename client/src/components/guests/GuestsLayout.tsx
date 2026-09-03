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
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0F1A] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-superlinear/15 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <Link
            href={withLanguage("/", lang)}
            className="flex items-center gap-2 text-zinc-400 transition hover:text-superlinear-on-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            <div>
              <div className="text-sm font-semibold text-superlinear-on-dark">
                {lang === "en" ? "Yuzheng Sun" : "课代表立正"}
              </div>
              <div className="text-xs text-zinc-500">
                {lang === "en" ? "课代表立正" : "Yuzheng Sun"}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle size="sm" />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-superlinear-on-dark/40 bg-superlinear/10 text-superlinear-pale hover:bg-superlinear/20"
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
        <p className="text-sm text-zinc-500">
          <Link
            href={withLanguage("/", lang)}
            className="text-superlinear-on-dark transition hover:text-white"
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
            className="text-zinc-400 transition hover:text-superlinear-on-dark"
          >
            {lang === "en" ? "Invite me to your show" : "邀请我上节目"}
          </Link>
        </p>
      </footer>
    </div>
  );
}
