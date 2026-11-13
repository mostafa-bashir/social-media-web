"use client";

import {
  ApiOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import StatCard from "@/components/ui/StatCard";

import type { AdminTenantDetail } from "../types/tenants";

const BYTES_PER_MB = 1_000_000;

/** Headline numbers for one workspace, read live from its schema. */
export default function TenantOverview({
  tenant,
}: {
  tenant: AdminTenantDetail;
}) {
  const t = useTranslations("admin.tenants.overview");
  const format = useFormatter();
  const { counts } = tenant;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={t("members")}
        value={tenant.memberCount}
        icon={<TeamOutlined />}
      />
      <StatCard
        label={t("clients")}
        value={counts.clients}
        icon={<ShopOutlined />}
      />
      <StatCard
        label={t("socialAccounts")}
        value={counts.socialAccounts}
        icon={<ApiOutlined />}
        footer={
          counts.socialAccountsNeedingReconnect > 0 ? (
            <Tag color="orange">
              {t("needReconnect", {
                count: counts.socialAccountsNeedingReconnect,
              })}
            </Tag>
          ) : null
        }
      />
      <StatCard
        label={t("posts")}
        value={counts.posts}
        icon={<CalendarOutlined />}
        footer={
          <span className="text-xs text-text-tertiary">
            {t("postsBreakdown", {
              scheduled: counts.postsScheduled,
              failed: counts.postsFailed,
            })}
          </span>
        }
      />
      <StatCard
        label={t("tasks")}
        value={counts.tasks}
        icon={<CarryOutOutlined />}
      />
      <StatCard
        label={t("storage")}
        value={format.number(counts.mediaBytes / BYTES_PER_MB, {
          style: "unit",
          unit: "megabyte",
          maximumFractionDigits: 1,
        })}
        icon={<CloudOutlined />}
      />
      <div className="surface-panel text-sm text-text-secondary sm:col-span-2 lg:col-span-3">
        {t("settings", {
          timezone: tenant.timezone,
          locale: tenant.locale,
          created: format.dateTime(new Date(tenant.createdAt), {
            dateStyle: "long",
          }),
        })}
      </div>
    </div>
  );
}
