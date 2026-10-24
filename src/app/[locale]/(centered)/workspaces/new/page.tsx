import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CreateWorkspaceForm } from "@/features/workspaces";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("workspaces.create");
  return { title: t("title") };
}

export default function NewWorkspacePage() {
  return <CreateWorkspaceForm />;
}
