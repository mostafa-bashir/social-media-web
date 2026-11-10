import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { findSiteUrl } from "@/config/env";
import { routes } from "@/config/routes";
import { LandingPage } from "@/features/landing";
import { redirect } from "@/i18n/navigation";
import { OG_LOCALES, routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.meta" });
  // Without a public origin, absolute URLs would point at localhost; leave them out.
  const hasSiteUrl = findSiteUrl() !== null;
  return {
    title: { absolute: t("title") },
    description: t("description"),
    ...(hasSiteUrl && {
      alternates: {
        canonical: `/${locale}`,
        languages: {
          ...Object.fromEntries(
            routing.locales.map((code) => [code, `/${code}`]),
          ),
          "x-default": `/${routing.defaultLocale}`,
        },
      },
    }),
    openGraph: {
      type: "website",
      ...(hasSiteUrl && { url: `/${locale}` }),
      title: t("title"),
      description: t("description"),
      ...(hasLocale(routing.locales, locale) && {
        locale: OG_LOCALES[locale],
        alternateLocale: routing.locales
          .filter((code) => code !== locale)
          .map((code) => OG_LOCALES[code]),
      }),
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Entry point: guests see the landing page; members go to their workspace. */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session || session.error) {
    return <LandingPage />;
  }
  const slug = session.activeWorkspace?.slug;
  redirect({
    href: slug ? routes.workspace(slug).home : routes.workspaces.picker,
    locale,
  });
}
