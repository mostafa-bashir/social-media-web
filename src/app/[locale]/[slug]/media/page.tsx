import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { MediaPage } from "@/features/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("media");
  return { title: t("title") };
}

export default async function MediaRoute() {
  const t = await getTranslations("media");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <MediaPage />
    </>
  );
}
