"use client";

import { Select } from "antd";
import { useLocale } from "next-intl";
import { useMemo } from "react";

import { countryOptions } from "@/lib/countries";

/** Mirrors the API's limit on a client's target markets. */
export const MAX_TARGET_COUNTRIES = 5;

/** Searchable, localized country picker for an antd Form field. */
export default function TargetCountriesSelect({
  value,
  onChange,
  placeholder,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}) {
  const locale = useLocale();
  const options = useMemo(() => countryOptions(locale), [locale]);
  return (
    <Select<string[]>
      mode="multiple"
      allowClear
      showSearch
      optionFilterProp="label"
      maxCount={MAX_TARGET_COUNTRIES}
      placeholder={placeholder}
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}
