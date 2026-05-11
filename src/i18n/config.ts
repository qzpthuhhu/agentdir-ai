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

export const dictionaries: Record<Locale, Record<string, any>> = { en, zh, es, hi, pt, ja, ko, de, fr };

export interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}
