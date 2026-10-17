export const LOCALES = ["ru", "kk"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "hr-locale";

export function parseLocale(value: string | undefined | null): Locale {
  return value === "kk" ? "kk" : "ru";
}

export function tx(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
