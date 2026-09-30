import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "wouter";
import { followsReaderLanguage, langForPath } from "@/lib/language-url";

export type Lang = "en" | "zh";

interface LanguageContextType {
  lang: Lang;
  /** Switches language in place on pages with one address (the guest pages). */
  setReaderLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function isStandaloneChineseHost(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "podcast.lizheng.ai" ||
    window.location.hostname === "speaker.lizheng.ai"
  );
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

// The address decides the language: Chinese at plain paths, English under
// /en, and switching language is a link to the other address. The guest
// pages are the exception: one address, the language the visitor was reading
// in (Chinese on a fresh visit), switched in place.
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [location] = useLocation();
  const shared = followsReaderLanguage(location);
  const [readerLang, setReaderLang] = useState<Lang>(() =>
    shared ? "zh" : langForPath(location)
  );

  useEffect(() => {
    if (!shared) setReaderLang(langForPath(location));
  }, [shared, location]);

  const lang: Lang = isStandaloneChineseHost()
    ? "zh"
    : shared
      ? readerLang
      : langForPath(location);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en-US" : "zh-CN";
  }, [lang]);

  const value = useMemo(() => ({ lang, setReaderLang }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
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
