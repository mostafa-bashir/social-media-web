import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { WorkspacePicker } from "@/features/workspaces";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("workspaces.picker");
  return { title: t("metaTitle") };
}

export default function WorkspacesPage() {
  return <WorkspacePicker />;
}
