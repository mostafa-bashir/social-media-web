"use client";

import { BarChartOutlined } from "@ant-design/icons";
import { Alert } from "antd";
import { useTranslations } from "next-intl";

import ListingEmptyState from "@/components/ui/ListingEmptyState";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useRouter } from "@/i18n/navigation";

import { useAnalyticsOverview } from "../api/get-analytics";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import AccountsComparison from "./AccountsComparison";
import AnalyticsFiltersBar from "./AnalyticsFiltersBar";
import AnalyticsKpis from "./AnalyticsKpis";
import AnalyticsNotice from "./AnalyticsNotice";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import TopPostsTable from "./TopPostsTable";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const filters = useAnalyticsFilters();
  const overview = useAnalyticsOverview(filters.scope);
  const accounts = overview.data?.accounts ?? [];
  const noAccounts = overview.isSuccess && accounts.length === 0;

  return (
    <>
      <AnalyticsFiltersBar filters={filters} />
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
          <AnalyticsKpis
            totals={overview.data?.totals}
            previous={overview.data?.previousTotals}
            loading={overview.isLoading}
          />
          <AnalyticsTrendChart scope={filters.scope} />
          <AccountsComparison
            accounts={accounts}
            loading={overview.isFetching}
          />
          {/* Keyed by scope, so a new filter starts again at page 1. */}
          <TopPostsTable
            key={JSON.stringify(filters.scope)}
            scope={filters.scope}
          />
        </div>
      )}
    </>
  );
}
