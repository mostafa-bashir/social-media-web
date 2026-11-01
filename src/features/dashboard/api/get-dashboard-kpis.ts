import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { browserTimezone, dayjs } from "@/lib/dayjs";
import { queryKeys } from "@/lib/query-keys";

export const KPI_WINDOW_DAYS = 7;
/** Figures only move when the background sync runs, every few hours. */
const KPI_STALE_MS = 5 * 60_000;
const DAY_FORMAT = "YYYY-MM-DD";

const metric = z.number().nullable();
const totalsSchema = z.object({
  views: metric,
  engagements: metric,
  engagementRate: metric,
  followersGained: metric,
});
const overviewSchema = z.object({
  totals: totalsSchema,
  comparisonTotals: totalsSchema.nullable(),
  accounts: z.array(
    z.object({
      id: z.string(),
      status: z.enum(["active", "reconnect_required"]),
      analyticsEnabled: z.boolean(),
      analyticsSyncedAt: z.string().nullable(),
      analyticsError: z.string().nullable(),
    }),
  ),
});
export type KpiTotals = z.infer<typeof totalsSchema>;

/** Last 7 days (today included, viewer's zone) against the 7 before. */
export function useDashboardKpis(enabled: boolean, clientId?: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  const today = dayjs().tz(browserTimezone());
  const scope = {
    from: today.subtract(KPI_WINDOW_DAYS - 1, "day").format(DAY_FORMAT),
    to: today.format(DAY_FORMAT),
    clientId,
  };
  return useQuery({
    queryKey: [...queryKeys.analytics(slug), "dashboard-kpis", scope],
    queryFn: async () =>
      parseData(
        overviewSchema,
        (
          await apiClient.get("/analytics/overview", {
            params: { ...scope, compare: "previous" },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
    staleTime: KPI_STALE_MS,
    enabled: enabled && Boolean(slug),
  });
}
