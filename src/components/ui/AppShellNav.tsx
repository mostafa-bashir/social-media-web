"use client";

import { Menu, type MenuProps } from "antd";
import { useTranslations } from "next-intl";

import { WORKSPACE_NAV } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { usePathname, useRouter } from "@/i18n/navigation";

/** Sidebar navigation for a workspace, filtered by the member's permissions. */
export default function AppShellNav({
  slug,
  onNavigate,
}: {
  slug: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("common.nav");
  const pathname = usePathname();
  const router = useRouter();
  const { can, featureEnabled, isLoading } = usePermissions();

  const items: MenuProps["items"] = WORKSPACE_NAV.filter(
    (item) =>
      (!item.permission || can(item.permission)) &&
      (!item.feature || featureEnabled(item.feature)),
  ).map((item) => ({
    key: item.href(slug),
    icon: item.icon,
    label: t(item.labelKey),
  }));

  const selected = WORKSPACE_NAV.map((item) => item.href(slug)).filter(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );

  // Avoid items popping in once permissions arrive.
  if (isLoading) {
    return (
      <div aria-hidden className="flex flex-col gap-2 px-1">
        {WORKSPACE_NAV.map((item) => (
          <div
            key={item.key}
            className="h-10 animate-pulse rounded-lg bg-shell-surface"
          />
        ))}
      </div>
    );
  }

  return (
    <nav aria-label={t("label")}>
      <Menu
        theme="dark"
        mode="inline"
        items={items}
        selectedKeys={selected}
        className="border-e-0! bg-transparent!"
        onClick={({ key }) => {
          router.push(key);
          onNavigate?.();
        }}
      />
    </nav>
  );
}
