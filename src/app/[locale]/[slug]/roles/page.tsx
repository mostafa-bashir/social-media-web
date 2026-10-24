import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { RolesPage } from "@/features/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("roles");
  return { title: t("title") };
}

export default async function RolesRoute() {
  const t = await getTranslations("roles");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <RolesPage />
    </>
  );
}
