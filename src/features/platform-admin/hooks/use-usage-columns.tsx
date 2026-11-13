"use client";

import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import type { TenantUsageRow } from "../types/usage";
import { useDayLabel } from "./use-day-label";

/** Unknown until the first snapshot after tracking started. */
const count = (value: number | null) => (value === null ? "—" : value);

/** Columns of the per-workspace usage table. */
export function useUsageColumns(): ColumnsType<TenantUsageRow> {
  const t = useTranslations("admin.usage.table");
  const dayLabel = useDayLabel();
  return [
    {
      title: t("workspace"),
      key: "workspace",
      render: (_, row) => (
        <Link href={routes.admin.tenant(row.tenantId)} className="font-medium">
          {row.name}
        </Link>
      ),
    },
    { title: t("postsPublished"), dataIndex: "postsPublished", width: 120 },
    {
      title: t("postsFailed"),
      dataIndex: "postsFailed",
      width: 100,
      responsive: ["md"],
    },
    { title: t("activeUsers"), dataIndex: "activeUsers", width: 120 },
    {
      title: t("members"),
      dataIndex: "members",
      width: 100,
      responsive: ["lg"],
      render: count,
    },
    {
      title: t("accounts"),
      dataIndex: "socialAccounts",
      width: 100,
      responsive: ["lg"],
      render: count,
    },
    {
      title: t("features"),
      dataIndex: "featuresUsed",
      width: 100,
      responsive: ["xl"],
      render: count,
    },
    {
      title: t("lastActive"),
      dataIndex: "lastActiveDay",
      responsive: ["md"],
      render: (value: string | null) => (value ? dayLabel(value) : t("never")),
    },
  ];
}
