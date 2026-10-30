"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useTaskBoard } from "../api/get-tasks";
import {
  useCreateTaskStatus,
  useDeleteTaskStatus,
  useMoveTask,
  useReorderTaskStatuses,
  useUpdateTaskStatus,
} from "../api/task-mutations";
import type { Task, TaskFilters, TaskStatus, TaskStatusInput } from "../types";
import ColumnMenu from "./ColumnMenu";
import DeleteStatusModal from "./DeleteStatusModal";
import StatusFormModal from "./StatusFormModal";
import TaskBoard from "./TaskBoard";

export interface TaskBoardViewProps {
  filters: TaskFilters;
  statuses: TaskStatus[];
  canManage: boolean;
  canConfigure: boolean;
  onOpen: (task: Task) => void;
  onAdd: (statusId: string) => void;
}

/** The Kanban board plus column settings (`tasks.configure`). */
export default function TaskBoardView({
  filters,
  statuses,
  canManage,
  canConfigure,
  onOpen,
  onAdd,
}: TaskBoardViewProps) {
  const t = useTranslations("tasks.columns");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const board = useTaskBoard(filters);
  const move = useMoveTask(filters);
  const create = useCreateTaskStatus();
  const update = useUpdateTaskStatus();
  const reorder = useReorderTaskStatuses();
  const remove = useDeleteTaskStatus();
  const [editing, setEditing] = useState<TaskStatus | "new" | null>(null);
  const [deleting, setDeleting] = useState<TaskStatus | null>(null);
  const onError = (error: unknown) => message.error(errorMessage(error));

  const shift = (index: number, offset: -1 | 1) => {
    const ids = statuses.map((status) => status.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    reorder.mutate(ids, { onError });
  };

  const save = (input: TaskStatusInput) => {
    const options = { onSuccess: () => setEditing(null), onError };
    if (editing === "new") create.mutate(input, options);
    else if (editing) update.mutate({ id: editing.id, ...input }, options);
  };

  if (board.error) {
    return (
      <Alert
        type="error"
        showIcon
        title={errorMessage(board.error)}
        className="m-4!"
      />
    );
  }

  return (
    <div className="flex flex-col">
      <TaskBoard
        columns={board.data}
        canManage={canManage}
        onOpen={onOpen}
        onAdd={onAdd}
        onMove={(change) => move.mutate(change, { onError })}
        columnMenu={
          canConfigure
            ? (column) => {
                const index = statuses.findIndex(
                  (s) => s.id === column.status.id,
                );
                const status = statuses[index];
                if (!status) return null;
                return (
                  <ColumnMenu
                    columnName={status.name}
                    isFirst={index === 0}
                    isLast={index === statuses.length - 1}
                    onEdit={() => setEditing(status)}
                    onShift={(offset) => shift(index, offset)}
                    onDelete={() => setDeleting(status)}
                  />
                );
              }
            : undefined
        }
      />
      {canConfigure ? (
        <div className="px-4 pb-4">
          <Button
            icon={<PlusOutlined />}
            className="rounded-full!"
            onClick={() => setEditing("new")}
          >
            {t("add")}
          </Button>
        </div>
      ) : null}
      <StatusFormModal
        open={editing !== null}
        initial={editing && editing !== "new" ? editing : undefined}
        loading={create.isPending || update.isPending}
        onCancel={() => setEditing(null)}
        onSubmit={save}
      />
      <DeleteStatusModal
        status={deleting}
        statuses={statuses}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={(moveToStatusId) =>
          deleting &&
          remove.mutate(
            { statusId: deleting.id, moveToStatusId },
            { onSuccess: () => setDeleting(null), onError },
          )
        }
      />
    </div>
  );
}
