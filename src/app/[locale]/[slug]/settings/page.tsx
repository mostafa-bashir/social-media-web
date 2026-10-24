import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/shell/PageHeader";
import { WorkspaceSettingsForm } from "@/features/workspaces";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <WorkspaceSettingsForm />
    </>
  );
}
