"use client";

import { Select } from "antd";
import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useParentOptions } from "../api/get-tasks";
import type { Task, TaskType } from "../types";

const SEARCH_DEBOUNCE_MS = 300;

export interface ParentSelectProps {
  childType: TaskType;
  /** Current parent, so it shows before any search runs. */
  known?: Task["parent"];
  /** The task being edited can't be its own parent. */
  excludeId?: string;
  /** Set by `Form.Item` so its label names the control. */
  id?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  "aria-label"?: string;
}

/** Campaigns for content/task/bug; tasks, content and bugs for a subtask. */
export default function ParentSelect({
  childType,
  known,
  excludeId,
  id,
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
}: ParentSelectProps) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const options = useParentOptions(childType, debounced);
  const found = (options.data ?? []).filter((task) => task.id !== excludeId);
  const choices = [
    ...(known && !found.some((task) => task.id === known.id) ? [known] : []),
    ...found,
  ];

  return (
    <Select<string>
      id={id}
      allowClear={childType !== "subtask"}
      value={value ?? undefined}
      placeholder={placeholder}
      aria-label={ariaLabel}
      loading={options.isFetching}
      showSearch={{ filterOption: false, onSearch: setSearch }}
      options={choices.map((task) => ({
        value: task.id,
        label: `${task.key} · ${task.title}`,
      }))}
      onChange={(next) => {
        setSearch("");
        onChange?.(next ?? null);
      }}
    />
  );
}
