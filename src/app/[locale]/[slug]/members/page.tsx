import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { MembersPage } from "@/features/members";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("members");
  return { title: t("title") };
}

export default async function MembersRoute() {
  const t = await getTranslations("members");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <MembersPage />
    </>
  );
}
