import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";

/** Entry point: straight into the active workspace, else the picker. */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const slug = session?.activeWorkspace?.slug;
  redirect({
    href: slug ? routes.workspace(slug).home : routes.workspaces.picker,
    locale,
  });
}
