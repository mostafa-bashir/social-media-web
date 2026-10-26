import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { PostComposerPage } from "@/features/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("posts.composer");
  return { title: t("editTitle") };
}

export default async function EditPostRoute({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const t = await getTranslations("posts.composer");
  return (
    <>
      <PageHeader title={t("editTitle")} description={t("description")} />
      <PostComposerPage postId={postId} />
    </>
  );
}
