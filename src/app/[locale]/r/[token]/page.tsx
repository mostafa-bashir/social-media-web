import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PublicReportPage } from "@/features/analytics";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("analytics");
  // Shared links are private by intent: keep them out of search engines.
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function SharedReportRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PublicReportPage token={token} />;
}
