"use client";

import { useAnalyticsOverview } from "../api/get-analytics";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import GoalsCard from "./GoalsCard";
import InsightsCard from "./InsightsCard";
import KpiGrid from "./KpiGrid";
import PlatformBreakdown from "./PlatformBreakdown";
import TopPostsCard from "./TopPostsCard";
import TrendChart from "./TrendChart";

/** The whole workspace (or client) at a glance. */
export default function OverviewTab() {
  const { scope, compare } = useAnalyticsFilters();
  const overview = useAnalyticsOverview(scope, compare);
  const platforms = overview.data?.platforms ?? [];

  return (
    <>
      <KpiGrid
        totals={overview.data?.totals}
        comparison={overview.data?.comparisonTotals}
        compare={compare}
        loading={overview.isLoading}
      />
      <InsightsCard overview={overview.data} compare={compare} />
      {scope.clientId ? <GoalsCard clientId={scope.clientId} /> : null}
      <TrendChart scope={scope} compare={compare} />
      {platforms.length > 1 ? (
        <PlatformBreakdown platforms={platforms} loading={overview.isLoading} />
      ) : null}
      {/* Keyed by scope, so a new filter starts the list afresh. */}
      <TopPostsCard key={JSON.stringify(scope)} scope={scope} />
    </>
  );
}
