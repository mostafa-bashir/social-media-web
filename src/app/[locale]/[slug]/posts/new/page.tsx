import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { PostComposerPage } from "@/features/posts";

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("posts.composer");
  return { title: t("newTitle") };
}

export default async function NewPostRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations("posts.composer");
  return (
    <>
      <PageHeader title={t("newTitle")} description={t("description")} />
      <PostComposerPage initialClientId={firstValue(params.clientId)} />
    </>
  );
}
