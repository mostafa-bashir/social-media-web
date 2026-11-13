import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { UserDetailPage } from "@/features/platform-admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("users") };
}

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserDetailPage userId={userId} />;
}
