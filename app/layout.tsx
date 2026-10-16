import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./components/Providers";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#EBEBEB] font-sans text-neutral-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
