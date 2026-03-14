import { createContext, useContext, useState, useCallback, ReactNode } from "react";

import en from "./locales/en.json";
import zh from "./locales/zh.json";
import es from "./locales/es.json";
import hi from "./locales/hi.json";
import pt from "./locales/pt.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";

export type Locale = "en" | "zh" | "es" | "hi" | "pt" | "ja" | "ko" | "de" | "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  hi: "हिन्दी",
  pt: "Português",
  ja: "日本語",
  ko: "한국어",
  de: "Deutsch",
  fr: "Français",
};

const dictionaries: Record<Locale, Record<string, any>> = { en, zh, es, hi, pt, ja, ko, de, fr };

function getNestedValue(obj: any, path: string): string {
  const val = path.split(".").reduce((o, k) => o?.[k], obj);
  if (typeof val === "string") return val;
  // fallback to English
  const fallback = path.split(".").reduce((o, k) => o?.[k], dictionaries.en);
  return typeof fallback === "string" ? fallback : path;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale") as Locale;
    return saved && dictionaries[saved] ? saved : "en";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = getNestedValue(dictionaries[locale], key);
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }
      return str;
    },
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
