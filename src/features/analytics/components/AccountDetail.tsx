"use client";

import { Alert, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useAnalyticsOverview } from "../api/get-analytics";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import { CATEGORICAL_STROKES } from "../lib/platform-series";
import AccountHeader from "./AccountHeader";
import BreakdownBarsChart, { type BreakdownPart } from "./BreakdownBarsChart";
import KpiGrid from "./KpiGrid";
import TopPostsCard from "./TopPostsCard";
import TrendChart from "./TrendChart";

const FOLLOWER_PARTS: BreakdownPart[] = [
  { metric: "followersGained", stroke: CATEGORICAL_STROKES[2] },
  { metric: "followersLost", stroke: CATEGORICAL_STROKES[1], negate: true },
];
const ENGAGEMENT_PARTS: BreakdownPart[] = [
  { metric: "likes", stroke: CATEGORICAL_STROKES[0] },
  { metric: "comments", stroke: CATEGORICAL_STROKES[1] },
  { metric: "shares", stroke: CATEGORICAL_STROKES[2] },
  { metric: "saves", stroke: CATEGORICAL_STROKES[3] },
];

/** One connected account in depth, within the page's filters. */
export default function AccountDetail({ accountId }: { accountId: string }) {
  const t = useTranslations("analytics.account");
  const errorMessage = useErrorMessage();
  const filters = useAnalyticsFilters();
  const scope = useMemo(
    () => ({ ...filters.scope, accountId }),
    [filters.scope, accountId],
  );
  const overview = useAnalyticsOverview(scope, filters.compare);
  const account = overview.data?.accounts[0];

  if (overview.error) {
    return <Alert type="error" showIcon title={errorMessage(overview.error)} />;
  }
  if (!account) return <Skeleton active paragraph={{ rows: 4 }} />;
  return (
    <>
      <AccountHeader account={account} />
      <KpiGrid
        totals={overview.data?.totals}
        comparison={overview.data?.comparisonTotals}
        compare={filters.compare}
        loading={overview.isLoading}
      />
      <TrendChart scope={scope} compare={filters.compare} groups={["total"]} />
      <BreakdownBarsChart
        title={t("followerFlow")}
        scope={scope}
        parts={FOLLOWER_PARTS}
      />
      <BreakdownBarsChart
        title={t("engagementMix")}
        scope={scope}
        parts={ENGAGEMENT_PARTS}
      />
      <TopPostsCard key={JSON.stringify(scope)} scope={scope} />
    </>
  );
}
