"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { DICT, type Dict } from "./dict";
import { LOCALE_COOKIE, parseLocale, type Locale } from "./locale";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * The locale cookie is the source of truth on the client. The server renders
 * with `initial` (read from the same cookie); after hydration React switches
 * to the cookie value if they differ (e.g. a cached page after a switch).
 */
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function I18nProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocaleCookie, () => initial);

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    listeners.forEach((l) => l());
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
