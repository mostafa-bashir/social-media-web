import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { findSiteUrl } from "@/config/env";
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

/**
 * Namespaces read only by server components. Kept out of the client payload so
 * every app page doesn't ship the guest landing copy.
 */
const SERVER_ONLY_NAMESPACES: ReadonlySet<string> = new Set(["landing"]);

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
  const siteUrl = findSiteUrl();
  return {
    ...(siteUrl && { metadataBase: new URL(siteUrl) }),
    title: { default: t("appName"), template: `%s · ${t("appName")}` },
  };
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

  const [session, cookieStore, messages] = await Promise.all([
    auth(),
    cookies(),
    getMessages(),
  ]);
  const clientMessages = Object.fromEntries(
    Object.entries(messages).filter(
      ([namespace]) => !SERVER_ONLY_NAMESPACES.has(namespace),
    ),
  );
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
        <NextIntlClientProvider messages={clientMessages}>
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
