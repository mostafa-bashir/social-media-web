import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TenantDetailPage } from "@/features/platform-admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("tenants") };
}

export default async function Page({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <TenantDetailPage tenantId={tenantId} />;
}
