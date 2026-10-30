"use client";

import { Alert } from "antd";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useTasks } from "../api/get-tasks";
import type { Task, TaskFilters, TaskStatus } from "../types";
import TasksTable from "./TasksTable";

const PAGE_SIZE = 20;

export interface TaskListViewProps {
  filters: TaskFilters;
  statuses: TaskStatus[];
  canManage: boolean;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskListView({
  filters,
  statuses,
  canManage,
  onOpen,
  onEdit,
  onDelete,
}: TaskListViewProps) {
  const errorMessage = useErrorMessage();
  const [page, setPage] = useState(1);
  const tasks = useTasks({ ...filters, page, pageSize: PAGE_SIZE });

  if (tasks.error) {
    return (
      <Alert
        type="error"
        showIcon
        title={errorMessage(tasks.error)}
        className="m-4!"
      />
    );
  }
  return (
    <TasksTable
      tasks={tasks.data?.data ?? []}
      statuses={statuses}
      total={tasks.data?.meta.total ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      loading={tasks.isFetching}
      filtered={Object.values(filters).some(Boolean)}
      canManage={canManage}
      onPageChange={setPage}
      onOpen={onOpen}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
