import {
  ApiOutlined,
  BarChartOutlined,
  DashboardOutlined,
  PictureOutlined,
  ScheduleOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

import { Permission, type PermissionSlug } from "./permissions";

import { routes } from "./routes";

export interface NavItem {
  key: string;
  /** Key in the `common.nav` namespace */
  labelKey: string;
  icon: ReactNode;
  href: (slug: string) => string;
  /** Hidden unless the member holds this permission */
  permission?: PermissionSlug;
}

/** Workspace sidebar. Add new features here (social, analytics, tasks…). */
export const WORKSPACE_NAV: NavItem[] = [
  {
    key: "dashboard",
    labelKey: "dashboard",
    icon: <DashboardOutlined />,
    href: (slug) => routes.workspace(slug).home,
  },
  {
    key: "clients",
    labelKey: "clients",
    icon: <ShopOutlined />,
    href: (slug) => routes.workspace(slug).clients,
    permission: Permission.ClientsView,
  },
  {
    key: "accounts",
    labelKey: "accounts",
    icon: <ApiOutlined />,
    href: (slug) => routes.workspace(slug).accounts,
    permission: Permission.AccountsView,
  },
  {
    key: "posts",
    labelKey: "posts",
    icon: <ScheduleOutlined />,
    href: (slug) => routes.workspace(slug).posts,
    permission: Permission.PostsView,
  },
  {
    key: "media",
    labelKey: "media",
    icon: <PictureOutlined />,
    href: (slug) => routes.workspace(slug).media,
    permission: Permission.PostsView,
  },
  {
    key: "analytics",
    labelKey: "analytics",
    icon: <BarChartOutlined />,
    href: (slug) => routes.workspace(slug).analytics,
    permission: Permission.AnalyticsView,
  },
  {
    key: "members",
    labelKey: "members",
    icon: <TeamOutlined />,
    href: (slug) => routes.workspace(slug).members,
    permission: Permission.MembersView,
  },
  {
    key: "roles",
    labelKey: "roles",
    icon: <SafetyCertificateOutlined />,
    href: (slug) => routes.workspace(slug).roles,
    permission: Permission.RolesView,
  },
  {
    key: "settings",
    labelKey: "settings",
    icon: <SettingOutlined />,
    href: (slug) => routes.workspace(slug).settings,
  },
];
