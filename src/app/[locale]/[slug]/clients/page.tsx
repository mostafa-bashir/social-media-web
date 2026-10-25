import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { ClientsPage } from "@/features/clients";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("clients");
  return { title: t("title") };
}

export default async function ClientsRoute() {
  const t = await getTranslations("clients");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ClientsPage />
    </>
  );
}
