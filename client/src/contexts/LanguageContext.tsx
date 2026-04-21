import React, { createContext, useContext, useEffect, useState } from "react";

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
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "zh") return stored;
  return defaultLang;
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
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);
  const toggleLang = () =>
    setLangState(prev => (prev === "en" ? "zh" : "en"));

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
