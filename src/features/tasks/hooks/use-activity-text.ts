"use client";

import { useFormatter, useTranslations } from "next-intl";

import { dayjs } from "@/lib/dayjs";

import {
  GOAL_METRICS,
  LINK_KINDS,
  TASK_PRIORITIES,
  TASK_TYPES,
  type TaskActivity,
  WORKFLOW_STAGES,
} from "../types";
import { useDuration } from "./use-duration";

const DATE_FORMAT = "D MMM YYYY, HH:mm";

type Value = string | number | null | undefined;

const isOneOf = <T extends string>(
  list: readonly T[],
  value: unknown,
): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

/** One readable sentence per history entry ("changed priority from Low to Urgent"). */
export function useActivityText() {
  const t = useTranslations("tasks.history");
  const tTask = useTranslations("tasks");
  const format = useFormatter();
  const duration = useDuration();
  const compact = (value: number) =>
    format.number(value, { notation: "compact", maximumFractionDigits: 1 });

  const metric = (value: unknown) =>
    isOneOf(GOAL_METRICS, value)
      ? tTask(`goals.metrics.${value}`)
      : String(value);

  /** Stored display values, translated where they're enum codes. */
  const fieldValue = (field: string, value: Value): string => {
    if (value === null || value === undefined) return t("none");
    if (field === "priority" && isOneOf(TASK_PRIORITIES, value)) {
      return tTask(`priority.${value}`);
    }
    if (field === "type" && isOneOf(TASK_TYPES, value)) {
      return tTask(`types.${value}`);
    }
    if (field === "estimateMinutes" && typeof value === "number") {
      return duration(value);
    }
    if (
      (field === "dueAt" || field === "startAt") &&
      typeof value === "string"
    ) {
      return dayjs(value).format(DATE_FORMAT);
    }
    return String(value);
  };

  const changes = (data: TaskActivity["data"]) =>
    (Array.isArray(data.changes) ? data.changes : [])
      .map((change: { field: string; from?: Value; to?: Value }) => {
        const field = t(`fields.${change.field}`);
        return "to" in change
          ? t("changedValue", {
              field,
              from: fieldValue(change.field, change.from),
              to: fieldValue(change.field, change.to),
            })
          : t("changed", { field });
      })
      .join("; ");

  return (entry: TaskActivity): string => {
    const data = entry.data;
    const text = (key: string) => String(data[key] ?? "");
    switch (entry.kind) {
      case "created":
        return t("created");
      case "updated":
        return changes(data);
      case "moved":
        return t("moved", { from: text("from"), to: text("to") });
      case "stage_changed": {
        const stage = isOneOf(WORKFLOW_STAGES, data.to)
          ? tTask(`stages.${data.to}`)
          : t("none");
        return data.column
          ? t("stageMoved", { stage, column: text("column") })
          : t("stage", { stage });
      }
      case "post_linked":
      case "post_unlinked":
        return t(entry.kind, { caption: text("caption") || t("noCaption") });
      case "goal_added":
      case "goal_removed":
      case "goal_reached":
      case "goal_missed":
        return t(entry.kind, {
          metric: metric(data.metric),
          target: compact(Number(data.target)),
        });
      case "link_added":
      case "link_removed": {
        const phrase =
          isOneOf(LINK_KINDS, data.linkKind) &&
          (data.direction === "outgoing" || data.direction === "incoming")
            ? tTask(`links.phrases.${data.linkKind}.${data.direction}`)
            : "";
        return t(entry.kind, {
          phrase,
          key: text("key"),
          title: text("title"),
        });
      }
      case "attachment_added":
      case "attachment_removed":
        return t(entry.kind, { name: text("filename") });
      case "time_logged":
        return t("time_logged", { duration: duration(Number(data.minutes)) });
      default:
        return t("unknown");
    }
  };
}
