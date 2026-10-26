"use client";

import { Select } from "antd";
import { useMemo, useState } from "react";

import { useClientOption, useClientOptions } from "@/hooks/use-client-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const SEARCH_DEBOUNCE_MS = 300;

export interface ClientSelectProps {
  value?: string;
  onChange?: (clientId?: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Client picker that searches on the server, so workspaces with many clients
 * can reach all of them. Works as a controlled antd Form field too.
 */
export default function ClientSelect({
  value,
  onChange,
  ...selectProps
}: ClientSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const matches = useClientOptions(debouncedSearch);
  const selected = useClientOption(value);

  const options = useMemo(() => {
    const list = matches.data ?? [];
    const withSelected =
      selected.data && !list.some((client) => client.id === selected.data.id)
        ? [selected.data, ...list]
        : list;
    return withSelected.map((client) => ({
      value: client.id,
      label: client.name,
    }));
  }, [matches.data, selected.data]);

  return (
    <Select
      {...selectProps}
      showSearch={{ filterOption: false, onSearch: setSearch }}
      loading={matches.isFetching}
      value={value}
      options={options}
      onChange={(clientId?: string) => {
        setSearch("");
        onChange?.(clientId);
      }}
    />
  );
}
