"use client";

import { Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useAdminTenants } from "../api/tenants";

const SEARCH_DEBOUNCE_MS = 300;
const RESULTS = 20;

const tenantLabel = (tenant: { name: string; slug: string }) =>
  `${tenant.name} (/${tenant.slug})`;

/** Searchable multi-select of workspaces (by name, URL or owner email). */
export default function TenantPicker({
  value,
  onChange,
  id,
  initialTenants = [],
}: {
  value?: string[];
  onChange?: (ids: string[]) => void;
  id?: string;
  /** Already-targeted workspaces, so an edit shows names instead of ids. */
  initialTenants?: Array<{ id: string; name: string; slug: string }>;
}) {
  const t = useTranslations("admin.announcements.form");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const tenants = useAdminTenants({
    page: 1,
    pageSize: RESULTS,
    search: debounced,
  });
  // Keep chosen workspaces labelled even after the search moves on.
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialTenants.map((tenant) => [tenant.id, tenantLabel(tenant)]),
    ),
  );
  const options = (tenants.data?.data ?? []).map((tenant) => ({
    value: tenant.id,
    label: tenantLabel(tenant),
  }));

  return (
    <Select
      id={id}
      mode="multiple"
      showSearch={{ filterOption: false, onSearch: setSearch }}
      placeholder={t("tenantsPlaceholder")}
      loading={tenants.isFetching}
      value={value}
      options={[
        ...options,
        ...(value ?? [])
          .filter(
            (tenantId) => !options.some((option) => option.value === tenantId),
          )
          .map((tenantId) => ({
            value: tenantId,
            label: labels[tenantId] ?? tenantId,
          })),
      ]}
      onChange={(ids: string[]) => {
        setLabels((current) => ({
          ...current,
          ...Object.fromEntries(
            options.map((option) => [option.value, option.label]),
          ),
        }));
        onChange?.(ids);
      }}
    />
  );
}
