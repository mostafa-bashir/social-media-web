"use client";

import { useAnalyticsOverview } from "../api/get-analytics";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import AccountsComparison from "./AccountsComparison";
import TrendChart from "./TrendChart";

/** Accounts side by side; each opens its own page. */
export default function AccountsTab() {
  const { scope, compare } = useAnalyticsFilters();
  const overview = useAnalyticsOverview(scope, compare);

  return (
    <>
      <AccountsComparison
        accounts={overview.data?.accounts ?? []}
        loading={overview.isFetching}
      />
      <TrendChart scope={scope} compare={compare} groups={["account"]} />
    </>
  );
}
