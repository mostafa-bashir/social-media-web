import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import FeatureGate from "@/components/ui/FeatureGate";
import PageHeader from "@/components/ui/PageHeader";
import { Feature } from "@/config/features";
import { AnalyticsShell, ExportMenu } from "@/features/analytics";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("analytics");
  return { title: t("title") };
}

export default async function AnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("analytics");
  return (
    <FeatureGate feature={Feature.Analytics}>
      <PageHeader
        title={t("title")}
        description={t("description")}
        extra={
          <Suspense>
            <ExportMenu />
          </Suspense>
        }
      />
      {/* The filters read the URL's search params. */}
      <Suspense>
        <AnalyticsShell>{children}</AnalyticsShell>
      </Suspense>
    </FeatureGate>
  );
}
