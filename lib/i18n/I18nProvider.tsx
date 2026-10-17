"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DICT, type Dict } from "./dict";
import { LOCALE_COOKIE, parseLocale, type Locale } from "./locale";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => {
    const stored = readLocaleCookie();
    if (stored !== locale) setLocaleState(stored);
  }, [initial]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }

  return <I18nContext.Provider value={{ locale, setLocale, m: DICT[locale] }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    return { locale: "ru", setLocale: () => undefined, m: DICT.ru };
  }
  return value;
}

export function LocaleSwitch() {
  const { locale, setLocale, m } = useI18n();
  return (
    <div role="group" aria-label={m.switchLabel} className="flex items-center">
      {(["ru", "kk"] as const).map((code) => {
        const on = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={on}
            onClick={() => setLocale(code)}
            className={[
              "px-1.5 h-7 rounded-md text-[11px] font-semibold tracking-wide cursor-pointer transition-colors",
              on ? "text-hero-foreground" : "text-tertiary hover:text-hero-muted",
            ].join(" ")}
          >
            {code === "ru" ? m.ru : m.kz}
          </button>
        );
      })}
    </div>
  );
}

export function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return "ru";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=(ru|kk)`));
  return parseLocale(match?.[1]);
}
