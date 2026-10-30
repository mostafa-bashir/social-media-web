"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useCompleteSprint,
  useDeleteSprint,
  useSaveSprint,
  useSprints,
  useStartSprint,
} from "../api/sprints";
import type { Sprint, Task, TaskStatus } from "../types";
import CompleteSprintModal from "./CompleteSprintModal";
import SprintFormModal from "./SprintFormModal";
import SprintSection from "./SprintSection";

type Editing = { sprint?: Sprint } | null;

/** Jira-style backlog: the active and planned sprints, then everything unplanned. */
export default function BacklogView({
  statuses,
  canManage,
  onOpen,
}: {
  statuses: TaskStatus[];
  canManage: boolean;
  onOpen: (task: Task) => void;
}) {
  const t = useTranslations("tasks.sprints");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const sprints = useSprints();
  const save = useSaveSprint();
  const start = useStartSprint();
  const complete = useCompleteSprint();
  const remove = useDeleteSprint();
  const [editing, setEditing] = useState<Editing>(null);
  const [completing, setCompleting] = useState<Sprint | null>(null);
  const [deleting, setDeleting] = useState<Sprint | null>(null);
  const onError = (error: unknown) => message.error(errorMessage(error));

  if (sprints.error) {
    return (
      <Alert
        type="error"
        showIcon
        title={errorMessage(sprints.error)}
        className="m-4!"
      />
    );
  }
  const all = sprints.data ?? [];
  const open = all.filter((sprint) => sprint.state !== "completed");
  const planned = open.filter((sprint) => sprint.state === "planned");
  const hasActive = open.some((sprint) => sprint.state === "active");

  return (
    <div className="flex flex-col gap-4 p-4">
      {canManage ? (
        <Button
          icon={<PlusOutlined />}
          className="self-start rounded-full!"
          onClick={() => setEditing({})}
        >
          {t("create")}
        </Button>
      ) : null}
      {open.map((sprint) => (
        <SprintSection
          key={sprint.id}
          sprint={sprint}
          statuses={statuses}
          canManage={canManage}
          canStart={!hasActive}
          onOpen={onOpen}
          onEdit={() => setEditing({ sprint })}
          onStart={() =>
            start.mutate(sprint.id, {
              onSuccess: () => message.success(t("started")),
              onError,
            })
          }
          onComplete={() => setCompleting(sprint)}
          onDelete={() => setDeleting(sprint)}
        />
      ))}
      <SprintSection
        sprint={null}
        statuses={statuses}
        canManage={canManage}
        canStart={false}
        onOpen={onOpen}
      />
      <SprintFormModal
        open={editing !== null}
        sprint={editing?.sprint}
        suggestedName={t("defaultName", { number: all.length + 1 })}
        loading={save.isPending}
        onCancel={() => setEditing(null)}
        onSubmit={(input) =>
          save.mutate(
            { ...input, id: editing?.sprint?.id },
            { onSuccess: () => setEditing(null), onError },
          )
        }
      />
      <CompleteSprintModal
        key={completing?.id}
        sprint={completing}
        planned={planned}
        loading={complete.isPending}
        onCancel={() => setCompleting(null)}
        onConfirm={(moveOpenTo) =>
          completing &&
          complete.mutate(
            { sprintId: completing.id, moveOpenTo },
            {
              onSuccess: () => {
                setCompleting(null);
                message.success(t("completed"));
              },
              onError,
            },
          )
        }
      />
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        itemName={deleting?.name}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
            onError,
          })
        }
      />
    </div>
  );
}
