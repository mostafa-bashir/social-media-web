import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { ConnectSelectionPage } from "@/features/social-accounts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.selection");
  return { title: t("title") };
}

export default async function ConnectSelectionRoute({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const t = await getTranslations("accounts.selection");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ConnectSelectionPage selectionKey={key} />
    </>
  );
}
