import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdminsPage } from "@/features/platform-admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("admins") };
}

export default function Page() {
  return <AdminsPage />;
}
