"use client";

import { BarChartOutlined } from "@ant-design/icons";
import { Alert } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import ListingEmptyState from "@/components/ui/ListingEmptyState";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useRouter } from "@/i18n/navigation";

import { useAnalyticsOverview } from "../api/get-analytics";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import { usePostDrawer } from "../hooks/use-post-drawer";
import AnalyticsFiltersBar from "./AnalyticsFiltersBar";
import AnalyticsNotice from "./AnalyticsNotice";
import AnalyticsTabs from "./AnalyticsTabs";
import PostAnalyticsDrawer from "./PostAnalyticsDrawer";

/**
 * Everything the analytics sections share: filters, section tabs, account
 * notices and the post drawer. The overview query is the same one the
 * Overview tab reads, so it is fetched once.
 */
export default function AnalyticsShell({ children }: { children: ReactNode }) {
  const t = useTranslations("analytics");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const filters = useAnalyticsFilters();
  const overview = useAnalyticsOverview(filters.scope, filters.compare);
  const drawer = usePostDrawer();
  const accounts = overview.data?.accounts ?? [];
  const noAccounts = overview.isSuccess && accounts.length === 0;

  return (
    <>
      <AnalyticsFiltersBar filters={filters} />
      <AnalyticsTabs />
      {overview.error ? (
        <Alert
          type="error"
          showIcon
          className="mb-6!"
          title={errorMessage(overview.error)}
        />
      ) : null}
      {noAccounts ? (
        <div className="surface-card">
          <ListingEmptyState
            icon={<BarChartOutlined />}
            title={t("empty.title")}
            description={t("empty.description")}
            actionLabel={t("empty.action")}
            onAction={() => router.push(routes.workspace(slug).accounts)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnalyticsNotice accounts={accounts} />
          {children}
        </div>
      )}
      <PostAnalyticsDrawer
        postRef={drawer.openPost}
        timezone={filters.scope.timezone}
        onClose={drawer.close}
      />
    </>
  );
}
