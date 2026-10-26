"use client";

import { DatePicker, Segmented, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/config/platforms";
import { dayjs } from "@/lib/dayjs";

import type {
  AnalyticsFilters,
  RangeChoice,
} from "../hooks/use-analytics-filters";
import { COMPARE_MODES, type CompareMode, RANGE_PRESETS } from "../types";

const DAY_FORMAT = "YYYY-MM-DD";
/** The API caps a report at a year plus a leap day. */
const MAX_RANGE_DAYS = 366;

/** One row of filters above every report on the page. */
export default function AnalyticsFiltersBar({
  filters,
}: {
  filters: AnalyticsFilters;
}) {
  const t = useTranslations("analytics.filters");
  const tPlatforms = useTranslations("common.platforms");
  // "Custom" shows the picker before a range is chosen.
  const [pickingCustom, setPickingCustom] = useState(false);
  const range: RangeChoice = pickingCustom ? "custom" : filters.range;

  return (
    <div className="surface-card mb-6 flex flex-wrap items-center gap-3">
      <ClientSelect
        allowClear
        className="w-full sm:w-56!"
        placeholder={t("allClients")}
        aria-label={t("client")}
        value={filters.clientId}
        onChange={(clientId) => filters.update({ clientId })}
      />
      <Select<SocialPlatform>
        allowClear
        className="w-full sm:w-44!"
        placeholder={t("allPlatforms")}
        aria-label={t("platform")}
        value={filters.platform}
        options={SOCIAL_PLATFORMS.map((value) => ({
          value,
          label: tPlatforms(value),
        }))}
        onChange={(platform) => filters.update({ platform })}
      />
      <Segmented<RangeChoice>
        aria-label={t("range")}
        className="max-w-full overflow-x-auto"
        value={range}
        options={[
          ...RANGE_PRESETS.map((days) => ({
            value: days,
            label: t("lastDays", { days }),
          })),
          { value: "custom" as const, label: t("custom") },
        ]}
        onChange={(value) => {
          setPickingCustom(value === "custom");
          if (value !== "custom") filters.update({ range: value });
        }}
      />
      {range === "custom" ? (
        <DatePicker.RangePicker
          aria-label={t("customRange")}
          allowClear={false}
          value={[dayjs(filters.scope.from), dayjs(filters.scope.to)]}
          disabledDate={(day, { from }) =>
            day.isAfter(dayjs(), "day") ||
            Boolean(from && Math.abs(day.diff(from, "day")) >= MAX_RANGE_DAYS)
          }
          onChange={(days) => {
            if (!days?.[0] || !days[1]) return;
            setPickingCustom(false);
            filters.update({
              from: days[0].format(DAY_FORMAT),
              to: days[1].format(DAY_FORMAT),
            });
          }}
        />
      ) : null}
      <Select<CompareMode>
        className="w-full sm:w-48!"
        aria-label={t("compare")}
        value={filters.compare}
        options={COMPARE_MODES.map((value) => ({
          value,
          label: t(`compareModes.${value}`),
        }))}
        onChange={(compare) => filters.update({ compare })}
      />
    </div>
  );
}
