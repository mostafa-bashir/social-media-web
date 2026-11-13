"use client";

import {
  AuditOutlined,
  BarChartOutlined,
  DashboardOutlined,
  HeartOutlined,
  NotificationOutlined,
  SafetyOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Menu, type MenuProps } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";
import { usePathname, useRouter } from "@/i18n/navigation";

interface AdminNavItem {
  href: string;
  /** Key in `admin.nav` */
  labelKey: string;
  icon: ReactNode;
}

/** Console sidebar. */
const ADMIN_NAV: AdminNavItem[] = [
  {
    href: routes.admin.home,
    labelKey: "overview",
    icon: <DashboardOutlined />,
  },
  { href: routes.admin.tenants, labelKey: "tenants", icon: <ShopOutlined /> },
  { href: routes.admin.users, labelKey: "users", icon: <TeamOutlined /> },
  { href: routes.admin.usage, labelKey: "usage", icon: <BarChartOutlined /> },
  { href: routes.admin.health, labelKey: "health", icon: <HeartOutlined /> },
  {
    href: routes.admin.announcements,
    labelKey: "announcements",
    icon: <NotificationOutlined />,
  },
  { href: routes.admin.admins, labelKey: "admins", icon: <SafetyOutlined /> },
  {
    href: routes.admin.auditLog,
    labelKey: "auditLog",
    icon: <AuditOutlined />,
  },
];

export default function AdminNav({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const router = useRouter();

  const items: MenuProps["items"] = ADMIN_NAV.map((item) => ({
    key: item.href,
    icon: item.icon,
    label: t(item.labelKey),
  }));
  // Overview is the prefix of every page, so it only matches exactly.
  const selected = ADMIN_NAV.map((item) => item.href).filter((href) =>
    href === routes.admin.home
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`),
  );

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
          onNavigate();
        }}
      />
    </nav>
  );
}
