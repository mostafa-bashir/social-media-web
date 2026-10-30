"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Segmented, Select } from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMemberOptions } from "@/hooks/use-member-options";

import type { TaskPageState } from "../hooks/use-task-filters";
import {
  DUE_FILTERS,
  TASK_PRIORITIES,
  TASK_VIEWS,
  type TaskView,
} from "../types";

const SEARCH_DEBOUNCE_MS = 300;
const ASSIGNEE_ME = "me";

export interface TaskFiltersBarProps {
  state: TaskPageState;
  onChange: (change: Partial<TaskPageState>) => void;
}

export default function TaskFiltersBar({
  state,
  onChange,
}: TaskFiltersBarProps) {
  const t = useTranslations("tasks");
  const [search, setSearch] = useState(state.search ?? "");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedMemberSearch = useDebouncedValue(
    memberSearch,
    SEARCH_DEBOUNCE_MS,
  );
  const members = useMemberOptions(debouncedMemberSearch);

  useEffect(() => {
    if (debouncedSearch !== (state.search ?? "")) {
      onChange({ search: debouncedSearch || undefined });
    }
    // Only the typed text drives this; URL changes elsewhere must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <>
      <Input
        allowClear
        prefix={<SearchOutlined aria-hidden />}
        className="w-full sm:w-52!"
        placeholder={t("filters.search")}
        aria-label={t("filters.search")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <ClientSelect
        allowClear
        className="w-full sm:w-48!"
        placeholder={t("filters.allClients")}
        aria-label={t("filters.client")}
        value={state.clientId}
        onChange={(clientId) => onChange({ clientId })}
      />
      <Select<string>
        allowClear
        className="w-full sm:w-44!"
        placeholder={t("filters.anyone")}
        aria-label={t("filters.assignee")}
        value={state.assigneeId}
        showSearch={{ filterOption: false, onSearch: setMemberSearch }}
        options={[
          { value: ASSIGNEE_ME, label: t("filters.me") },
          ...(members.data ?? []).map((member) => ({
            value: member.userId,
            label: member.name,
          })),
        ]}
        onChange={(assigneeId) => {
          setMemberSearch("");
          onChange({ assigneeId });
        }}
      />
      <Select
        allowClear
        className="w-full sm:w-36!"
        placeholder={t("filters.anyPriority")}
        aria-label={t("filters.priority")}
        value={state.priority}
        options={TASK_PRIORITIES.map((value) => ({
          value,
          label: t(`priority.${value}`),
        }))}
        onChange={(priority) => onChange({ priority })}
      />
      <Select
        allowClear
        className="w-full sm:w-40!"
        placeholder={t("filters.anyDue")}
        aria-label={t("filters.due")}
        value={state.due}
        options={DUE_FILTERS.map((value) => ({
          value,
          label: t(`filters.dueOptions.${value}`),
        }))}
        onChange={(due) => onChange({ due })}
      />
      <Segmented<TaskView>
        value={state.view}
        options={TASK_VIEWS.map((value) => ({
          value,
          label: t(`views.${value}`),
        }))}
        onChange={(view) => onChange({ view })}
      />
    </>
  );
}
