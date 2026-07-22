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

function readInitialLang(defaultLang: Lang): Lang {
  if (typeof window === "undefined") return defaultLang;
  if (
    window.location.pathname === "/zh" ||
    window.location.pathname.startsWith("/zh/")
  ) {
    return "zh";
  }
  if (
    window.location.pathname === "/zbs" ||
    window.location.pathname === "/guests" ||
    window.location.pathname.startsWith("/guests/")
  ) {
    return "zh";
  }
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "zh") return requested;
  if (hasCanonicalLanguagePath(window.location.pathname)) return "en";
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
    syncLangParam(lang);
  }, [lang]);

  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname === "/zh" ||
        window.location.pathname.startsWith("/zh/") ||
        window.location.pathname === "/zbs" ||
        window.location.pathname === "/guests" ||
        window.location.pathname.startsWith("/guests/")
      ) {
        setLangState("zh");
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
