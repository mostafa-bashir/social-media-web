import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { directionFor, routing } from "@/i18n/routing";
import { COLOR_SCHEME_COOKIE, parseColorScheme } from "@/lib/color-scheme";
import { AuthSessionProvider } from "@/providers/AuthSessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const latinFont = Inter({ subsets: ["latin"], variable: "--font-latin" });
const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return { title: { default: t("appName"), template: `%s · ${t("appName")}` } };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const colorScheme = parseColorScheme(
    cookieStore.get(COLOR_SCHEME_COOKIE)?.value,
  );
  const fontVariable =
    locale === "ar" ? "var(--font-arabic)" : "var(--font-latin)";

  return (
    <html
      lang={locale}
      dir={directionFor(locale)}
      data-theme={colorScheme}
      className={`${latinFont.variable} ${arabicFont.variable}`}
      style={{ ["--font-sans" as string]: fontVariable }}
    >
      <body>
        <NextIntlClientProvider>
          <AuthSessionProvider session={session}>
            <QueryProvider>
              <ThemeProvider locale={locale} initialColorScheme={colorScheme}>
                {children}
              </ThemeProvider>
            </QueryProvider>
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
