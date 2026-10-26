import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { PostsPage } from "@/features/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("posts");
  return { title: t("title") };
}

export default async function PostsRoute() {
  const t = await getTranslations("posts");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <PostsPage />
    </>
  );
}
