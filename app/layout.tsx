import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { Providers } from "./components/Providers";
import { parseLocale } from "@/lib/i18n/locale";
import "./globals.css";

const archivo = localFont({
  src: [
    { path: "./fonts/ttf/Archivo-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ttf/Archivo-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/ttf/Archivo-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/ttf/Archivo-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "./fonts/ttf/Archivo-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/ttf/Archivo-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "./fonts/ttf/Archivo-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/ttf/Archivo-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Digital HR",
  description: "Единый портал для всего, что связано с HR: заявки, обучение и ответы на вопросы.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const locale = parseLocale(jar.get("hr-locale")?.value);
  return (
    <html lang={locale} className={`${archivo.variable} h-full antialiased`}>
      <body className="page-matte min-h-full font-sans tracking-[-0.05em] selection:bg-primary/10 selection:text-primary">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
