import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import PageHeader from "@/components/ui/PageHeader";
import { AnalyticsPage } from "@/features/analytics";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("analytics");
  return { title: t("title") };
}

export default async function AnalyticsRoute() {
  const t = await getTranslations("analytics");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {/* The filters read the URL's search params. */}
      <Suspense>
        <AnalyticsPage />
      </Suspense>
    </>
  );
}
