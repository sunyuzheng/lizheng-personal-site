import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { cn } from "@/lib/utils";
import { Youtube } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";

interface GuestsLayoutProps {
  children: ReactNode;
}

export default function GuestsLayout({ children }: GuestsLayoutProps) {
  const { lang } = useLanguage();
  return (
    <div
      className={cn(
        "lz-site relative min-h-screen overflow-x-clip bg-lz-forest-3 text-zinc-100",
        lang === "en" && "l-en"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-superlinear/15 blur-3xl" />
      </div>

      <SiteHeader />

      <main className="relative z-10">{children}</main>

      <div className="relative z-10 mt-16 border-t border-white/10">
        <p className="container flex flex-wrap items-center justify-center gap-x-5 gap-y-1 py-8 text-center text-sm text-lizheng-muted">
          <span>
            {lang === "en"
              ? "All interview content © original rights holders"
              : "访谈内容版权所有"}
          </span>
          <a
            href="https://www.youtube.com/@kedaibiao"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-superlinear-on-dark transition hover:text-white md:min-h-0"
          >
            <Youtube className="size-4" aria-hidden="true" />
            {lang === "en" ? "Subscribe on YouTube" : "订阅频道"}
          </a>
          <Link
            href={withLanguage("/collab/creators", lang)}
            className="inline-flex min-h-11 items-center text-zinc-400 transition hover:text-superlinear-on-dark md:min-h-0"
          >
            {lang === "en" ? "Invite me to your show" : "邀请我上节目"}
          </Link>
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
