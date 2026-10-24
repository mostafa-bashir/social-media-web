import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import AppShell from "@/components/ui/AppShell";
import { WorkspaceSwitcher } from "@/features/workspaces";

/**
 * proxy.ts already redirects when the URL's workspace isn't the session's
 * active one; this guard covers anything that slips past it.
 */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (session?.activeWorkspace?.slug !== slug) {
    notFound();
  }
  return (
    <AppShell slug={slug} sidebarTop={<WorkspaceSwitcher />}>
      {children}
    </AppShell>
  );
}
