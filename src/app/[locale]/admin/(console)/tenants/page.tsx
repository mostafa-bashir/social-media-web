import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TenantsPage } from "@/features/platform-admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("tenants") };
}

export default function Page() {
  return <TenantsPage />;
}
