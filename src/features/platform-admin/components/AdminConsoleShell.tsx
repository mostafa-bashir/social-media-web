"use client";

import { Tag } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import AppShell from "@/components/ui/AppShell";

import AdminNav from "./AdminNav";
import AdminSessionGate from "./AdminSessionGate";
import AdminUserMenu from "./AdminUserMenu";

/** Console chrome: the app shell with admin navigation, behind the admin session. */
export default function AdminConsoleShell({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("admin");
  return (
    <AdminSessionGate>
      <AppShell
        sidebarTop={
          <div className="px-3 pb-2">
            <Tag color="gold" className="m-0!">
              {t("consoleBadge")}
            </Tag>
          </div>
        }
        nav={(onNavigate) => <AdminNav onNavigate={onNavigate} />}
        userMenu={<AdminUserMenu />}
      >
        {children}
      </AppShell>
    </AdminSessionGate>
  );
}
