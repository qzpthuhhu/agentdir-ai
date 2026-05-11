import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Locale, LOCALE_LABELS, dictionaries, I18nContextType } from "./config";

export type { Locale };
export { LOCALE_LABELS };

function getNestedValue(obj: any, path: string): string {
  const val = path.split(".").reduce((o, k) => o?.[k], obj);
  if (typeof val === "string") return val;
  const fallback = path.split(".").reduce((o, k) => o?.[k], dictionaries.en);
  return typeof fallback === "string" ? fallback : path;
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
