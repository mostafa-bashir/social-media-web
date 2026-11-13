import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdminSetupPasswordForm } from "@/features/platform-admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.setupPassword");
  return { title: t("title") };
}

export default function Page() {
  return <AdminSetupPasswordForm />;
}
