import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";

export default async function WorkspaceIndex({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  redirect({ href: routes.workspace(slug).home, locale });
}
