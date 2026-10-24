import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import PageHeader from "@/components/ui/PageHeader";
import { DashboardStats, UpcomingModules } from "@/features/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  const [t, session] = await Promise.all([
    getTranslations("dashboard"),
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
      <DashboardStats />
      <UpcomingModules />
    </>
  );
}
