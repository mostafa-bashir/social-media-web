"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { platformSchema, type SocialPlatform } from "@/config/platforms";
import { useClientOption } from "@/hooks/use-client-options";
import { usePathname, useRouter } from "@/i18n/navigation";
import { browserTimezone, dayjs } from "@/lib/dayjs";

import { type AnalyticsScope, RANGE_PRESETS, type RangePreset } from "../types";

const DEFAULT_PRESET: RangePreset = 30;
const DAY_FORMAT = "YYYY-MM-DD";
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type RangeChoice = RangePreset | "custom";

export interface AnalyticsFilters {
  range: RangeChoice;
  clientId?: string;
  platform?: SocialPlatform;
  scope: AnalyticsScope;
  update: (change: FilterChange) => void;
}

export type FilterChange =
  | { range: RangePreset }
  | { from: string; to: string }
  | { clientId: string | undefined }
  | { platform: SocialPlatform | undefined };

/**
 * Report filters live in the URL, so a report can be bookmarked or shared.
 * Preset ranges end today in the client's zone (the viewer's for all clients).
 */
export function useAnalyticsFilters(): AnalyticsFilters {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const clientId = params.get("clientId") ?? undefined;
  const platform = platformSchema.safeParse(params.get("platform")).data;
  const customFrom = params.get("from");
  const customTo = params.get("to");
  const isCustom = Boolean(
    customFrom &&
    customTo &&
    DAY_PATTERN.test(customFrom) &&
    DAY_PATTERN.test(customTo),
  );
  const preset =
    RANGE_PRESETS.find((days) => String(days) === params.get("range")) ??
    DEFAULT_PRESET;

  const client = useClientOption(clientId);
  const timezone = (clientId && client.data?.timezone) || browserTimezone();

  const scope = useMemo<AnalyticsScope>(() => {
    const today = dayjs().tz(timezone);
    return {
      from: isCustom
        ? (customFrom as string)
        : today.subtract(preset - 1, "day").format(DAY_FORMAT),
      to: isCustom ? (customTo as string) : today.format(DAY_FORMAT),
      clientId,
      platform,
      timezone,
    };
  }, [isCustom, customFrom, customTo, preset, timezone, clientId, platform]);

  const update = useCallback(
    (change: FilterChange) => {
      const next = new URLSearchParams(params.toString());
      const set = (key: string, value: string | undefined) =>
        value ? next.set(key, value) : next.delete(key);
      if ("range" in change) {
        set("range", String(change.range));
        set("from", undefined);
        set("to", undefined);
      } else if ("from" in change) {
        set("range", undefined);
        set("from", change.from);
        set("to", change.to);
      } else if ("clientId" in change) {
        set("clientId", change.clientId);
      } else {
        set("platform", change.platform);
      }
      router.replace({ pathname, query: Object.fromEntries(next) });
    },
    [params, pathname, router],
  );

  return {
    range: isCustom ? "custom" : preset,
    clientId,
    platform,
    scope,
    update,
  };
}
