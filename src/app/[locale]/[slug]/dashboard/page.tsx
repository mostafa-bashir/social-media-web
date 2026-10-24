import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { PageHeader } from "@/components/shell/PageHeader";
import { UpcomingModules } from "@/components/shell/UpcomingModules";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  const [t, session] = await Promise.all([
    getTranslations("common.dashboard"),
    auth(),
  ]);
  return (
    <>
      <PageHeader
        title={t("welcome", { name: session?.user.name ?? "" })}
        description={t("subtitle", {
          workspace: session?.activeWorkspace?.name ?? "",
        })}
      />
      <UpcomingModules />
    </>
  );
}
