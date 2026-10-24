import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.resetPassword");
  return { title: t("title") };
}

export default function Page() {
  return <ResetPasswordForm />;
}
