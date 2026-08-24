import React, { createContext, useContext, useEffect, useState } from "react";
import { hasCanonicalLanguagePath, withLanguage } from "@/lib/language-url";

export type Lang = "en" | "zh";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "lizheng-lang";

function isStandaloneChineseHost(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "podcast.lizheng.ai" ||
    window.location.hostname === "speaker.lizheng.ai"
  );
}

function readInitialLang(defaultLang: Lang): Lang {
  if (typeof window === "undefined") return defaultLang;
  if (isStandaloneChineseHost()) return "zh";
  if (
    window.location.pathname === "/decks" ||
    window.location.pathname.startsWith("/decks/")
  )
    return "zh";
  if (window.location.pathname === "/en/decks") return "en";
  if (
    window.location.pathname === "/zh" ||
    window.location.pathname.startsWith("/zh/")
  ) {
    return "zh";
  }
  if (
    window.location.pathname === "/zbs" ||
    window.location.pathname === "/speaker" ||
    window.location.pathname === "/podcast" ||
    window.location.pathname === "/guests" ||
    window.location.pathname.startsWith("/guests/")
  ) {
    return "zh";
  }
  if (hasCanonicalLanguagePath(window.location.pathname)) return "en";
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "zh") return requested;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "zh") return stored;
  return defaultLang;
}

function syncLangParam(lang: Lang) {
  const url = new URL(window.location.href);
  const nextUrl = withLanguage(`${url.pathname}${url.search}${url.hash}`, lang);
  window.history.replaceState(window.history.state, "", nextUrl);
}

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLang?: Lang;
}

export function LanguageProvider({
  children,
  defaultLang = "en",
}: LanguageProviderProps) {
  const [lang, setLangState] = useState<Lang>(() =>
    readInitialLang(defaultLang)
  );

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en-US" : "zh-CN";
    window.localStorage.setItem(STORAGE_KEY, lang);
    if (!isStandaloneChineseHost()) syncLangParam(lang);
  }, [lang]);

  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname === "/decks" ||
        window.location.pathname.startsWith("/decks/")
      ) {
        setLangState("zh");
        return;
      }
      if (window.location.pathname === "/en/decks") {
        setLangState("en");
        return;
      }
      if (
        isStandaloneChineseHost() ||
        window.location.pathname === "/zh" ||
        window.location.pathname.startsWith("/zh/") ||
        window.location.pathname === "/zbs" ||
        window.location.pathname === "/speaker" ||
        window.location.pathname === "/podcast" ||
        window.location.pathname === "/guests" ||
        window.location.pathname.startsWith("/guests/")
      ) {
        setLangState("zh");
        return;
      }
      if (hasCanonicalLanguagePath(window.location.pathname)) {
        setLangState("en");
        return;
      }
      const requested = new URLSearchParams(window.location.search).get("lang");
      setLangState(requested === "zh" ? "zh" : "en");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
  };
  const toggleLang = () => setLangState(prev => (prev === "en" ? "zh" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function pick<T>(lang: Lang, values: { en: T; zh: T }): T {
  return values[lang];
}
