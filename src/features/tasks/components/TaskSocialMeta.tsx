"use client";

import { AimOutlined } from "@ant-design/icons";
import { useFormatter, useTranslations } from "next-intl";

import type { Task } from "../types";
import WorkflowStageBadge from "./WorkflowStageBadge";

/** Card line for the social side: workflow stage and the first goal's progress. */
export default function TaskSocialMeta({ task }: { task: Task }) {
  const t = useTranslations("tasks.goals");
  const format = useFormatter();
  const [goal] = task.goals;
  if (!task.workflowStage && !goal) return null;
  const compact = (value: number) =>
    format.number(value, { notation: "compact", maximumFractionDigits: 1 });
  const goalLabel = goal
    ? t("progress", {
        actual: compact(goal.actual),
        target: compact(goal.target),
        metric: t(`metrics.${goal.metric}`),
      })
    : "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {task.workflowStage ? (
        <WorkflowStageBadge stage={task.workflowStage} />
      ) : null}
      {goal ? (
        <span
          className="inline-flex items-center gap-1 text-xs text-text-tertiary"
          title={goalLabel}
        >
          <AimOutlined aria-hidden />
          {goalLabel}
          {task.goals.length > 1 ? ` +${task.goals.length - 1}` : null}
        </span>
      ) : null}
    </div>
  );
}
