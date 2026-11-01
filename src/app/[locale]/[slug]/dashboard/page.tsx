import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import PageHeader from "@/components/ui/PageHeader";
import {
  AccountsHealthCard,
  AttentionStrip,
  DashboardHeaderActions,
  DashboardStats,
  GettingStartedCard,
  KpiStrip,
  MyTasksCard,
  UpcomingPostsCard,
} from "@/features/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

/** Command center: what needs you, what's coming, how it's going. */
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
        extra={<DashboardHeaderActions />}
      />
      <GettingStartedCard />
      <AttentionStrip />
      <KpiStrip />
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingPostsCard />
        <MyTasksCard />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AccountsHealthCard />
        <div className="lg:col-span-2">
          <DashboardStats />
        </div>
      </div>
    </>
  );
}
