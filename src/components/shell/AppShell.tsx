"use client";

import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Grid, Layout, Menu, type MenuProps } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { WORKSPACE_NAV } from "@/config/navigation";
import { usePermissions, WorkspaceSwitcher } from "@/features/workspaces";
import { usePathname, useRouter } from "@/i18n/navigation";
import { directionFor } from "@/i18n/routing";

import { UserMenu } from "./UserMenu";

const SIDER_WIDTH = 240;

function WorkspaceMenu({
  slug,
  onNavigate,
}: {
  slug: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("common.nav");
  const pathname = usePathname();
  const router = useRouter();
  const { can } = usePermissions();

  const items: MenuProps["items"] = WORKSPACE_NAV.filter(
    (item) => !item.permission || can(item.permission),
  ).map((item) => ({
    key: item.href(slug),
    icon: item.icon,
    label: t(item.labelKey),
  }));

  const selected = WORKSPACE_NAV.map((item) => item.href(slug)).filter(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );

  return (
    <Menu
      mode="inline"
      items={items}
      selectedKeys={selected}
      className="!border-e-0"
      onClick={({ key }) => {
        router.push(key);
        onNavigate?.();
      }}
    />
  );
}

/** Workspace chrome: sidebar (drawer on mobile), switcher and user menu. */
export function AppShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg ?? true;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <WorkspaceSwitcher />
      </div>
      <WorkspaceMenu slug={slug} onNavigate={() => setDrawerOpen(false)} />
    </div>
  );

  return (
    <Layout className="min-h-dvh">
      {isDesktop ? (
        <Layout.Sider
          width={SIDER_WIDTH}
          theme="light"
          className="!sticky top-0 h-dvh border-e border-app-border"
        >
          {sidebar}
        </Layout.Sider>
      ) : (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement={directionFor(locale) === "rtl" ? "right" : "left"}
          size={SIDER_WIDTH}
          styles={{ body: { padding: 0 } }}
          title={t("appName")}
        >
          {sidebar}
        </Drawer>
      )}
      <Layout>
        <Layout.Header className="!flex !h-14 items-center justify-between !bg-app-surface !px-4 border-b border-app-border">
          {isDesktop ? (
            <span />
          ) : (
            <Button
              type="text"
              icon={<MenuOutlined />}
              aria-label={t("openMenu")}
              onClick={() => setDrawerOpen(true)}
            />
          )}
          <UserMenu />
        </Layout.Header>
        <Layout.Content className="p-4 sm:p-6">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
