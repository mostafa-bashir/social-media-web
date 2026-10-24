import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { VerifyEmailForm } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.verifyEmail");
  return { title: t("title") };
}

export default function Page() {
  return <VerifyEmailForm />;
}
