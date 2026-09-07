import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/contexts/LanguageContext";
import { withLanguage } from "@/lib/language-url";
import { ChevronDown, Menu, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export default function HomeNavigation({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const { lang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDetailsElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const copy = pick(lang, {
    en: {
      about: "About me",
      content: "Content",
      academy: "Superlinear",
      collaborate: "Collaborate",
      community: "Free community",
      conversations: "Conversations",
      writing: "Writing",
      books: "Books",
      decks: "Talks & slides",
      open: "Open menu",
      close: "Close menu",
      navigation: "Main navigation",
    },
    zh: {
      about: "关于我",
      content: "内容",
      academy: "超线性学院",
      collaborate: "合作",
      community: "免费社区",
      conversations: "访谈",
      writing: "文章",
      books: "书",
      decks: "演讲资料",
      open: "打开菜单",
      close: "关闭菜单",
      navigation: "主导航",
    },
  });

  const close = () => {
    setMobileOpen(false);
    if (contentRef.current) contentRef.current.open = false;
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (contentRef.current?.open) {
        contentRef.current.open = false;
        contentRef.current.querySelector("summary")?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(close, [lang]);

  const anchor = (id: string, label: string, className: string) => (
    <a
      href={`#${id}`}
      className={className}
      onClick={event => {
        event.preventDefault();
        close();
        window.setTimeout(() => onNavigate(id), 0);
      }}
    >
      {label}
    </a>
  );

  const contentLinks = (className: string) => (
    <>
      {anchor("conversations", copy.conversations, className)}
      {anchor("thinking", copy.writing, className)}
      <Link
        href={withLanguage("/book", lang)}
        onClick={close}
        className={className}
      >
        {copy.books}
      </Link>
      <Link
        href={withLanguage("/decks", lang)}
        onClick={close}
        className={className}
      >
        {copy.decks}
      </Link>
    </>
  );
  const navLink =
    "flex min-h-11 items-center text-sm text-zinc-300 transition hover:text-white";

  return (
    <nav
      ref={navRef}
      aria-label={copy.navigation}
      className="sticky top-0 z-50 border-b border-white/10 bg-lizheng-dark/95 backdrop-blur-xl"
    >
      <div className="container flex h-[72px] items-center justify-between gap-6">
        <a
          href="#hero"
          onClick={event => {
            event.preventDefault();
            close();
            onNavigate("hero");
          }}
          className="flex min-h-11 shrink-0 flex-col justify-center"
        >
          <span className="text-base font-semibold text-white">
            {lang === "en" ? "Yuzheng Sun" : "立正"}
          </span>
          <span className="text-xs text-lizheng-muted">
            {lang === "en" ? "立正 · 课代表立正" : "孙煜征 · 课代表立正"}
          </span>
        </a>
        <div className="hidden items-center gap-6 lg:flex">
          <Link href={withLanguage("/about", lang)} className={navLink}>
            {copy.about}
          </Link>
          <details ref={contentRef} className="group relative">
            <summary
              className={`${navLink} cursor-pointer list-none gap-1.5 [&::-webkit-details-marker]:hidden`}
            >
              {copy.content}
              <ChevronDown className="size-3.5 transition group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 top-full min-w-48 border border-white/15 bg-lizheng-dark p-2 shadow-xl">
              {contentLinks(`${navLink} px-3 hover:bg-white/5`)}
            </div>
          </details>
          {anchor("superlinear", copy.academy, navLink)}
          <Link href={withLanguage("/collab", lang)} className={navLink}>
            {copy.collaborate}
          </Link>
          <LanguageToggle size="sm" />
          <Button
            asChild
            size="sm"
            className="min-h-11 gap-2 bg-superlinear text-white hover:bg-superlinear-deep"
          >
            <a
              href="https://www.superlinear.academy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Users className="size-4" />
              {copy.community}
            </a>
          </Button>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageToggle
            size="sm"
            className="[&>a]:flex [&>a]:min-h-11 [&>a]:min-w-11 [&>a]:items-center [&>a]:justify-center"
          />
          <button
            ref={mobileButtonRef}
            onClick={() => setMobileOpen(value => !value)}
            className="flex size-11 items-center justify-center text-zinc-300"
            aria-label={mobileOpen ? copy.close : copy.open}
            aria-expanded={mobileOpen}
            aria-controls="home-mobile-navigation"
          >
            {mobileOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div
          id="home-mobile-navigation"
          className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-white/10 lg:hidden"
        >
          <div className="container py-3">
            <div className="grid grid-cols-2 gap-x-5">
              <Link
                href={withLanguage("/about", lang)}
                onClick={close}
                className={navLink}
              >
                {copy.about}
              </Link>
              {anchor("superlinear", copy.academy, navLink)}
              <Link
                href={withLanguage("/collab", lang)}
                onClick={close}
                className={navLink}
              >
                {copy.collaborate}
              </Link>
              <a
                href="https://www.superlinear.academy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className={navLink.replace(
                  "text-zinc-300",
                  "text-superlinear-on-dark"
                )}
              >
                {copy.community} →
              </a>
            </div>
            <div className="mt-3 border-t border-white/10 pt-4">
              <p className="mb-1 text-xs text-lizheng-muted">{copy.content}</p>
              <div className="grid grid-cols-2 gap-x-5">
                {contentLinks(navLink)}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
