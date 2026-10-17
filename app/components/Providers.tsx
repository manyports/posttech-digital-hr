"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/locale";
import { ToastProvider } from "./ui/Toast";

export function Providers({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nProvider initial={locale}>
      <ToastProvider>{children}</ToastProvider>
    </I18nProvider>
  );
}
