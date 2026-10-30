"use client";

import { PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import { useTaskStatuses } from "../api/get-tasks";
import {
  useCreateTask,
  useDeleteTask,
  useMoveTask,
  useUpdateTask,
} from "../api/task-mutations";
import { useBlockedWarning } from "../hooks/use-blocked-warning";
import { useTaskFilters } from "../hooks/use-task-filters";
import type { Task, TaskInput } from "../types";
import BoardSettingsModal from "./BoardSettingsModal";
import TaskDrawer from "./TaskDrawer";
import TaskFiltersBar from "./TaskFiltersBar";
import TaskFormModal from "./TaskFormModal";
import TaskViewSwitch from "./TaskViewSwitch";

type FormState =
  { mode: "create"; statusId?: string } | { mode: "edit"; task: Task };

export default function TasksPage() {
  const t = useTranslations("tasks");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can, userId } = usePermissions();
  const canManage = can(Permission.TasksManage);
  const canConfigure = can(Permission.TasksConfigure);
  const { state, filters, update } = useTaskFilters();
  const statuses = useTaskStatuses().data ?? [];
  const create = useCreateTask();
  const edit = useUpdateTask();
  const remove = useDeleteTask();
  const move = useMoveTask(filters);
  const warnIfBlocked = useBlockedWarning(statuses);
  const [form, setForm] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const onError = (error: unknown) => message.error(errorMessage(error));

  const open = (task: Task) => update({ task: task.id });
  const submit = (input: TaskInput) => {
    if (form?.mode === "edit") {
      edit.mutate(
        { id: form.task.id, ...input },
        {
          onSuccess: () => {
            message.success(t("saved"));
            setForm(null);
          },
          onError,
        },
      );
    } else {
      create.mutate(input, {
        onSuccess: () => {
          message.success(t("created"));
          setForm(null);
        },
        onError,
      });
    }
  };

  const toolbar = (
    <ListingToolbar
      filters={<TaskFiltersBar state={state} onChange={update} />}
      actions={
        <>
          {canConfigure ? (
            <Button
              shape="circle"
              icon={<SettingOutlined />}
              aria-label={t("settings.title")}
              title={t("settings.title")}
              onClick={() => setSettingsOpen(true)}
            />
          ) : null}
          {canManage ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className={TOOLBAR_CREATE_BUTTON_CLASS}
              aria-label={t("create")}
              onClick={() => setForm({ mode: "create" })}
            >
              <span className="max-sm:hidden">{t("create")}</span>
            </Button>
          ) : null}
        </>
      }
    />
  );

  return (
    <>
      <ListingShell toolbar={toolbar}>
        <TaskViewSwitch
          view={state.view}
          filters={filters}
          statuses={statuses}
          canManage={canManage}
          canConfigure={canConfigure}
          onOpen={open}
          onAdd={(statusId) => setForm({ mode: "create", statusId })}
          onEdit={(task) => setForm({ mode: "edit", task })}
          onDelete={setDeleting}
        />
      </ListingShell>
      <TaskDrawer
        taskId={state.task}
        statuses={statuses}
        userId={userId ?? undefined}
        canManage={canManage}
        onClose={() => update({ task: undefined })}
        onOpen={(taskId) => update({ task: taskId })}
        onEdit={(task) => setForm({ mode: "edit", task })}
        onDelete={setDeleting}
        onStatusChange={(task, statusId) => {
          warnIfBlocked(task, statusId);
          return move.mutateAsync({
            taskId: task.id,
            statusId,
            afterTaskId: null,
          });
        }}
      />
      <TaskFormModal
        open={form !== null}
        task={form?.mode === "edit" ? form.task : undefined}
        statuses={statuses}
        defaults={{
          statusId: form?.mode === "create" ? form.statusId : undefined,
          clientId: state.clientId,
        }}
        loading={create.isPending || edit.isPending}
        onCancel={() => setForm(null)}
        onSubmit={submit}
      />
      <BoardSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        itemName={deleting?.title}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              message.success(t("deleted"));
              setDeleting(null);
              update({ task: undefined });
            },
            onError,
          })
        }
      />
    </>
  );
}
