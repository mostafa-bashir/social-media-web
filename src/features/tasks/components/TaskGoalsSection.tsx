"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { App, Button, Progress } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";
import { dayjs } from "@/lib/dayjs";

import { useDeleteTaskGoal } from "../api/task-social";
import type { Task, TaskGoal } from "../types";
import TaskGoalForm from "./TaskGoalForm";

const DATE_FORMAT = "D MMM YYYY, HH:mm";

function goalState(goal: TaskGoal) {
  if (goal.achievedAt) return { tone: "growth", key: "achieved" } as const;
  if (goal.missedAt) return { tone: "danger", key: "missed" } as const;
  return { tone: "brand", key: "tracking" } as const;
}

/** Metric targets summed over the task's posts (a campaign's include its items'). */
export default function TaskGoalsSection({
  task,
  canManage,
}: {
  task: Task;
  canManage: boolean;
}) {
  const t = useTranslations("tasks.goals");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const remove = useDeleteTaskGoal(task.id);
  const compact = (value: number) =>
    format.number(value, { notation: "compact", maximumFractionDigits: 1 });
  const usedMetrics = task.goals.map((goal) => goal.metric);

  if (task.goals.length === 0 && !canManage) return null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="task-goals">
      <h3 id="task-goals" className="text-sm font-semibold text-text-primary">
        {t("title")}
      </h3>
      {task.goals.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          {task.type === "campaign" ? t("emptyCampaign") : t("empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {task.goals.map((goal) => {
            const state = goalState(goal);
            const percent = Math.min(
              100,
              Math.round((goal.actual / goal.target) * 100),
            );
            const progressLabel = t("progress", {
              actual: compact(goal.actual),
              target: compact(goal.target),
              metric: t(`metrics.${goal.metric}`),
            });
            return (
              <li key={goal.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-text-primary">
                    {progressLabel}
                  </span>
                  <StatusBadge tone={state.tone}>{t(state.key)}</StatusBadge>
                  {canManage ? (
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      aria-label={t("delete", {
                        metric: t(`metrics.${goal.metric}`),
                      })}
                      onClick={() =>
                        remove.mutate(goal.id, {
                          onError: (error) =>
                            message.error(errorMessage(error)),
                        })
                      }
                    />
                  ) : null}
                </div>
                <Progress
                  percent={percent}
                  showInfo={false}
                  size="small"
                  status={state.key === "missed" ? "exception" : "normal"}
                  aria-label={progressLabel}
                />
                {goal.dueAt ? (
                  <span className="text-xs text-text-tertiary">
                    {t("due", { date: dayjs(goal.dueAt).format(DATE_FORMAT) })}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {canManage ? (
        <TaskGoalForm taskId={task.id} usedMetrics={usedMetrics} />
      ) : null}
    </section>
  );
}
