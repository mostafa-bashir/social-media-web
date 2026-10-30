"use client";

import { useTranslations } from "next-intl";

import type { Task, TaskStatus } from "../types";
import TaskActivityTabs from "./TaskActivityTabs";
import TaskAttachmentsSection from "./TaskAttachmentsSection";
import TaskChecklist from "./TaskChecklist";
import TaskChildren from "./TaskChildren";
import TaskGoalsSection from "./TaskGoalsSection";
import TaskLinksSection from "./TaskLinksSection";
import TaskPostsSection from "./TaskPostsSection";
import WorkflowStepper from "./WorkflowStepper";

export interface TaskDetailMainProps {
  task: Task;
  statuses: TaskStatus[];
  userId: string | undefined;
  canManage: boolean;
  onOpen: (taskId: string) => void;
}

/** The "work" column of the task view: workflow, content, goals, breakdown, discussion. */
export default function TaskDetailMain({
  task,
  statuses,
  userId,
  canManage,
  onOpen,
}: TaskDetailMainProps) {
  const t = useTranslations("tasks");
  const isSubtask = task.type === "subtask";

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {task.type === "content" && task.workflowStage ? (
        <WorkflowStepper
          stage={task.workflowStage}
          hasGoals={task.goals.length > 0}
        />
      ) : null}
      <section aria-label={t("form.description")}>
        {task.description ? (
          <p className="whitespace-pre-wrap wrap-break-word text-sm text-text-primary">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-text-tertiary">
            {t("detail.noDescription")}
          </p>
        )}
      </section>
      {isSubtask ? null : (
        <TaskPostsSection task={task} canManage={canManage} />
      )}
      {isSubtask ? null : (
        <TaskGoalsSection task={task} canManage={canManage} />
      )}
      {isSubtask ? null : (
        <TaskChildren
          task={task}
          statuses={statuses}
          canManage={canManage}
          onOpen={onOpen}
        />
      )}
      <TaskChecklist taskId={task.id} canManage={canManage} />
      <TaskLinksSection
        taskId={task.id}
        canManage={canManage}
        onOpen={onOpen}
      />
      <TaskAttachmentsSection taskId={task.id} canManage={canManage} />
      <TaskActivityTabs
        taskId={task.id}
        userId={userId}
        canManage={canManage}
      />
    </div>
  );
}
