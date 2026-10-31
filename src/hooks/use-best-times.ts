"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Permission } from "@/config/permissions";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePermissions } from "@/hooks/use-permissions";
import { apiClient, parseData } from "@/lib/api/api-client";
import { type Dayjs, nowAsPickerValue } from "@/lib/dayjs";
import { queryKeys } from "@/lib/query-keys";

/** How much history the suggestions learn from. */
const LOOKBACK_DAYS = 90;
const MAX_SUGGESTIONS = 3;
const DAYS_PER_WEEK = 7;

const slotsSchema = z.object({
  recommendedSlots: z.array(
    z.object({ weekday: z.number(), hour: z.number() }),
  ),
});

/** The next time at `weekday` (ISO) and `hour` after now, as a picker value in `zone`. */
function nextAt(weekday: number, hour: number, zone: string): Dayjs {
  const now = nowAsPickerValue(zone);
  for (let offset = 0; offset <= DAYS_PER_WEEK; offset += 1) {
    const candidate = now
      .add(offset, "day")
      .hour(hour)
      .minute(0)
      .second(0)
      .millisecond(0);
    const isoWeekday = candidate.day() === 0 ? 7 : candidate.day();
    if (isoWeekday === weekday && candidate.isAfter(now)) return candidate;
  }
  return now.add(DAYS_PER_WEEK, "day");
}

/**
 * When the client's posts did best lately (from analytics), as the next
 * matching times. Empty without analytics access or enough history.
 */
export function useBestTimes(
  clientId: string | undefined,
  timezone: string,
): Dayjs[] {
  const slug = useActiveWorkspaceSlug() ?? "";
  const { can } = usePermissions();
  const query = useQuery({
    queryKey: [...queryKeys.analytics(slug), "best-times", clientId],
    enabled: Boolean(slug && clientId && can(Permission.AnalyticsView)),
    retry: false,
    queryFn: async () => {
      const today = nowAsPickerValue(timezone);
      return parseData(
        slotsSchema,
        (
          await apiClient.get("/analytics/content", {
            params: {
              clientId,
              since: today.subtract(LOOKBACK_DAYS, "day").format("YYYY-MM-DD"),
              until: today.format("YYYY-MM-DD"),
            },
          })
        ).data,
      );
    },
  });
  return (query.data?.recommendedSlots ?? [])
    .slice(0, MAX_SUGGESTIONS)
    .map((slot) => nextAt(slot.weekday, slot.hour, timezone))
    .sort((a, b) => a.valueOf() - b.valueOf());
}
