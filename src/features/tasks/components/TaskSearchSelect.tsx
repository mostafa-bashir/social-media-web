"use client";

import { Select } from "antd";
import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useTasks } from "../api/get-tasks";

const SEARCH_DEBOUNCE_MS = 300;
const RESULTS = 20;

/** Pick any task by title or key (e.g. ACME-42); clears itself after each pick. */
export default function TaskSearchSelect({
  excludeId,
  placeholder,
  loading,
  className,
  onSelect,
}: {
  excludeId?: string;
  placeholder: string;
  loading?: boolean;
  className?: string;
  onSelect: (taskId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const results = useTasks({
    search: debounced || undefined,
    page: 1,
    pageSize: RESULTS,
  });

  return (
    <Select<string>
      className={className}
      value={null}
      placeholder={placeholder}
      aria-label={placeholder}
      loading={loading || results.isFetching}
      showSearch={{ filterOption: false, onSearch: setSearch }}
      options={(results.data?.data ?? [])
        .filter((task) => task.id !== excludeId)
        .map((task) => ({
          value: task.id,
          label: `${task.key} · ${task.title}`,
        }))}
      onChange={(taskId) => {
        if (!taskId) return;
        setSearch("");
        onSelect(taskId);
      }}
    />
  );
}
