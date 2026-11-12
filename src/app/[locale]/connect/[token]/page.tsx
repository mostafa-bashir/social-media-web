import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PublicConnectPage } from "@/features/social-accounts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.publicConnect");
  // Connect links are private by intent: keep them out of search engines.
  return { title: t("pageTitle"), robots: { index: false, follow: false } };
}

export default async function ConnectLinkRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PublicConnectPage token={token} />;
}
