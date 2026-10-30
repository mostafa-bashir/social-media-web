import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { TasksPage } from "@/features/tasks";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tasks");
  return { title: t("title") };
}

export default async function TasksRoute() {
  const t = await getTranslations("tasks");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <TasksPage />
    </>
  );
}
