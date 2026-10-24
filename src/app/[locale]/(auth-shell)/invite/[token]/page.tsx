import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { InvitationLanding } from "@/features/invitations";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("workspaces.invitation");
  return { title: t("metaTitle") };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InvitationLanding token={decodeURIComponent(token)} />;
}
