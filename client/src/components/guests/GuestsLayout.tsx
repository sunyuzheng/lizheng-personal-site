import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Link } from "wouter";

interface GuestsLayoutProps {
  children: ReactNode;
}

/** The guest directory and guest pages: a forest stage per page, then paper (guests.css). */
export default function GuestsLayout({ children }: GuestsLayoutProps) {
  const { lang } = useLanguage();
  return (
    <div className={cn("lz-site lz-guests relative min-h-screen", lang === "en" && "l-en")}>
      <SiteHeader />
      <main className="relative z-10">{children}</main>
      <p className="lz-guests-credit wrap">
        <span>{lang === "en" ? "Interview videos © their rights holders" : "访谈视频版权所有"}</span>
        <a href="https://www.youtube.com/@kedaibiao" target="_blank" rel="noopener noreferrer">
          {lang === "en" ? "Subscribe on YouTube ↗" : "订阅频道 ↗"}
        </a>
        <Link href={withLanguage("/collab/creators", lang)}>
          {lang === "en" ? "Invite me to your show" : "邀请我上节目"}
        </Link>
      </p>
      <SiteFooter />
    </div>
  );
}
