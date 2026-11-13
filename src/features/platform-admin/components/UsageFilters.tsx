"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Segmented, Select } from "antd";
import { useTranslations } from "next-intl";

import {
  USAGE_RANGES,
  USAGE_SORTS,
  type UsageRange,
  type UsageSort,
} from "../types/usage";

export interface UsageFilterValues {
  search: string;
  days: UsageRange;
  sort: UsageSort;
}

/** Search, date range and sort for the usage table (one row, above it). */
export default function UsageFilters({
  value,
  onChange,
}: {
  value: UsageFilterValues;
  onChange: (next: UsageFilterValues) => void;
}) {
  const t = useTranslations("admin.usage");
  return (
    <>
      <Input
        allowClear
        prefix={<SearchOutlined className="text-text-tertiary" />}
        placeholder={t("table.search")}
        aria-label={t("table.search")}
        className="sm:max-w-xs!"
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
      />
      <Segmented<UsageRange>
        aria-label={t("range")}
        value={value.days}
        options={USAGE_RANGES.map((days) => ({
          value: days,
          label: t("days", { days }),
        }))}
        onChange={(days) => onChange({ ...value, days })}
      />
      <Select<UsageSort>
        className="w-full sm:w-48!"
        aria-label={t("table.sortBy")}
        value={value.sort}
        options={USAGE_SORTS.map((sort) => ({
          value: sort,
          label: t(`table.sorts.${sort}`),
        }))}
        onChange={(sort) => onChange({ ...value, sort })}
      />
    </>
  );
}
