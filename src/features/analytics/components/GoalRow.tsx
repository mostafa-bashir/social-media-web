"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useFormatter, useTranslations } from "next-intl";

import RowActions from "@/components/ui/RowActions";
import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";

import type { Goal, GoalStatus } from "../api/goals";
import { useMetricFormat } from "../hooks/use-metric-format";

const STATUS_TONE: Record<GoalStatus, StatusTone> = {
  achieved: "growth",
  onTrack: "brand",
  behind: "accent",
  missed: "danger",
  upcoming: "neutral",
  noData: "neutral",
};

const asPercent = (part: number, whole: number) =>
  Math.min(100, Math.max(0, (part / whole) * 100));

/** One goal: progress bar with today's pace marked, status, and actions. */
export default function GoalRow({
  goal,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  /** Omitted for people who can't manage goals. */
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const t = useTranslations("analytics.goals");
  const format = useFormatter();
  const { exact } = useMetricFormat();
  const { progress } = goal;
  const label = t(`metrics.${goal.metric}`);
  const day = (iso: string) =>
    format.dateTime(new Date(`${iso}T00:00:00Z`), {
      dateStyle: "medium",
      timeZone: "UTC",
    });
  const filled =
    progress.actual === null ? 0 : asPercent(progress.actual, goal.target);
  const pace = asPercent(progress.expected, goal.target);

  return (
    <li className="flex flex-col gap-2 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="font-medium text-text-primary">
            {t("summary", {
              metric: label,
              actual: exact(progress.actual),
              target: exact(goal.target),
            })}
          </span>
          <span className="text-xs text-text-tertiary">
            {format.dateTimeRange(
              new Date(`${goal.startDate}T00:00:00Z`),
              new Date(`${goal.endDate}T00:00:00Z`),
              { dateStyle: "medium", timeZone: "UTC" },
            )}
            {progress.status === "behind" || progress.status === "onTrack"
              ? ` · ${t("pace", { expected: exact(progress.expected) })}`
              : progress.status === "upcoming"
                ? ` · ${t("startsOn", { when: day(goal.startDate) })}`
                : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge tone={STATUS_TONE[progress.status]}>
            {t(`status.${progress.status}`)}
          </StatusBadge>
          {onEdit && onDelete ? (
            <RowActions
              label={t("actionsFor", { metric: label })}
              actions={[
                {
                  key: "edit",
                  label: t("edit"),
                  icon: <EditOutlined />,
                  onClick: onEdit,
                },
                {
                  key: "delete",
                  label: t("delete"),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: onDelete,
                },
              ]}
            />
          ) : null}
        </div>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={goal.target}
        aria-valuenow={progress.actual ?? 0}
        aria-valuetext={t("summary", {
          metric: label,
          actual: exact(progress.actual),
          target: exact(goal.target),
        })}
        className="relative h-2 rounded-full bg-border-default"
      >
        <div
          className={`h-full rounded-full ${progress.status === "achieved" ? "bg-growth" : "bg-primary"}`}
          style={{ width: `${filled}%` }}
        />
        {progress.status === "onTrack" || progress.status === "behind" ? (
          // Where a steady pace would be today.
          <div
            aria-hidden
            className="absolute -top-1 h-4 w-0.5 rounded-full bg-text-secondary"
            style={{ insetInlineStart: `${pace}%` }}
          />
        ) : null}
      </div>
    </li>
  );
}
