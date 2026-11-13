import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ImpersonationHandoff } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.impersonation");
  // The one-time code is in the URL until the page strips it.
  return { title: t("title"), referrer: "no-referrer" };
}

export default function Page() {
  return <ImpersonationHandoff />;
}
