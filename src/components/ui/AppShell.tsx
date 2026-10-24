"use client";

import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Grid } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { directionFor } from "@/i18n/routing";

import AppShellNav from "./AppShellNav";
import BrandMark from "./BrandMark";
import UserMenu from "./UserMenu";

const SIDER_WIDTH = 248;

export interface AppShellProps {
  slug: string;
  /** Rendered at the top of the sidebar (the workspace switcher). */
  sidebarTop: ReactNode;
  children: ReactNode;
}

/**
 * Workspace chrome (fana pattern): the deep-indigo canvas spans sidebar and
 * gutter; pages live in the rounded content card. Sidebar becomes a drawer
 * below `lg`.
 */
export default function AppShell({
  slug,
  sidebarTop,
  children,
}: AppShellProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const isDesktop = Grid.useBreakpoint().lg ?? true;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebar = (
    <>
      <div className="px-2 py-1">
        <BrandMark onDark />
      </div>
      <div className="shell-divider" />
      {sidebarTop}
      <AppShellNav slug={slug} onNavigate={() => setDrawerOpen(false)} />
    </>
  );

  return (
    <div className="app-shell flex-col lg:flex-row">
      {isDesktop ? (
        <aside className="app-shell-sider">{sidebar}</aside>
      ) : (
        <>
          <div className="app-shell-mobile-bar">
            <Button
              type="text"
              icon={<MenuOutlined />}
              aria-label={t("openMenu")}
              className="shell-control"
              onClick={() => setDrawerOpen(true)}
            />
            <BrandMark onDark showName={false} />
            <UserMenu />
          </div>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            placement={directionFor(locale) === "rtl" ? "right" : "left"}
            size={SIDER_WIDTH + 24}
            closable={false}
            styles={{ body: { padding: 0 } }}
          >
            <div className="app-shell-sider static! h-full! w-full! bg-shell">
              {sidebar}
            </div>
          </Drawer>
        </>
      )}
      <div className="app-shell-main">
        <div className="app-shell-content">
          {isDesktop ? (
            <header className="app-shell-header justify-end">
              <UserMenu />
            </header>
          ) : (
            <div className="h-4" />
          )}
          <main className="app-shell-body">{children}</main>
        </div>
      </div>
    </div>
  );
}
