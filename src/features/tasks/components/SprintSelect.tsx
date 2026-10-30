"use client";

import { Select } from "antd";
import { useTranslations } from "next-intl";

import { useSprints } from "../api/sprints";

export const SPRINT_ACTIVE = "active";
export const SPRINT_BACKLOG = "backlog";

export interface SprintSelectProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** Filter mode also offers "Active sprint" and "Backlog". */
  asFilter?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
}

/** Sprints that can still take work (planned or active). */
export default function SprintSelect({
  value,
  onChange,
  asFilter = false,
  id,
  className,
  placeholder,
  "aria-label": ariaLabel,
}: SprintSelectProps) {
  const t = useTranslations("tasks.sprints");
  const sprints = (useSprints().data ?? []).filter(
    (sprint) => sprint.state !== "completed",
  );
  const options = [
    ...(asFilter
      ? [
          { value: SPRINT_ACTIVE, label: t("activeSprint") },
          { value: SPRINT_BACKLOG, label: t("backlog") },
        ]
      : []),
    ...sprints.map((sprint) => ({
      value: sprint.id,
      label:
        sprint.state === "active"
          ? t("activeName", { name: sprint.name })
          : sprint.name,
    })),
  ];

  return (
    <Select<string>
      id={id}
      allowClear
      className={className}
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value ?? undefined}
      options={options}
      onChange={(next) => onChange?.(next ?? null)}
    />
  );
}
