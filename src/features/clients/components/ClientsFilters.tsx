"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Segmented } from "antd";
import { useTranslations } from "next-intl";

import { CLIENT_KINDS, type ClientKind } from "../types";

export interface ClientsFiltersProps {
  search: string;
  archived: boolean;
  kind: ClientKind;
  onSearchChange: (search: string) => void;
  onArchivedChange: (archived: boolean) => void;
  onKindChange: (kind: ClientKind) => void;
}

/** Search, signed clients vs prospects, and active vs archived. */
export default function ClientsFilters({
  search,
  archived,
  kind,
  onSearchChange,
  onArchivedChange,
  onKindChange,
}: ClientsFiltersProps) {
  const t = useTranslations("clients");
  return (
    <>
      <Input
        allowClear
        prefix={<SearchOutlined className="text-text-tertiary" />}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="sm:max-w-xs!"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Segmented<ClientKind>
        aria-label={t("filters.kindLabel")}
        value={kind}
        options={CLIENT_KINDS.map((value) => ({
          value,
          label: t(`filters.${value}`),
        }))}
        onChange={onKindChange}
      />
      <Segmented
        aria-label={t("filters.statusLabel")}
        value={archived ? "archived" : "active"}
        options={[
          { value: "active", label: t("filters.active") },
          { value: "archived", label: t("filters.archived") },
        ]}
        onChange={(value) => onArchivedChange(value === "archived")}
      />
    </>
  );
}
