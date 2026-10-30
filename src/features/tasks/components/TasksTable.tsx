"use client";

import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Avatar, type TableProps } from "antd";
import { useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import MemberAvatar from "@/components/ui/MemberAvatar";
import RowActions, { type RowAction } from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";

import type { Task, TaskStatus } from "../types";
import TaskDueLabel from "./TaskDueLabel";
import TaskPriorityBadge from "./TaskPriorityBadge";

const MAX_AVATARS = 3;

export interface TasksTableProps {
  tasks: Task[];
  statuses: TaskStatus[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filtered: boolean;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TasksTable({
  tasks,
  statuses,
  total,
  page,
  pageSize,
  loading,
  filtered,
  canManage,
  onPageChange,
  onOpen,
  onEdit,
  onDelete,
}: TasksTableProps) {
  const t = useTranslations("tasks");
  const statusById = new Map(statuses.map((status) => [status.id, status]));

  const actionsFor = (task: Task): RowAction[] => [
    {
      key: "view",
      label: t("view"),
      icon: <EyeOutlined />,
      onClick: () => onOpen(task),
    },
    ...(canManage
      ? [
          {
            key: "edit",
            label: t("edit"),
            icon: <EditOutlined />,
            onClick: () => onEdit(task),
          },
          {
            key: "delete",
            label: t("delete"),
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDelete(task),
          },
        ]
      : []),
  ];

  const columns: TableProps<Task>["columns"] = [
    {
      title: t("columnsTable.task"),
      key: "task",
      render: (_, task) => (
        <div className="flex flex-col">
          <span className="line-clamp-2 font-medium text-text-primary">
            {task.title}
          </span>
          {task.client ? (
            <span className="text-xs text-text-tertiary">
              {task.client.name}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: t("columnsTable.status"),
      key: "status",
      width: 140,
      render: (_, task) => {
        const status = statusById.get(task.statusId);
        return status ? (
          <StatusBadge tone={status.tone}>{status.name}</StatusBadge>
        ) : null;
      },
    },
    {
      title: t("columnsTable.priority"),
      key: "priority",
      width: 110,
      responsive: ["md"],
      render: (_, task) => <TaskPriorityBadge priority={task.priority} />,
    },
    {
      title: t("columnsTable.due"),
      key: "due",
      width: 170,
      responsive: ["lg"],
      render: (_, task) => <TaskDueLabel task={task} />,
    },
    {
      title: t("columnsTable.assignees"),
      key: "assignees",
      width: 110,
      responsive: ["xl"],
      render: (_, task) => (
        <Avatar.Group max={{ count: MAX_AVATARS }} size={24}>
          {task.assignees.map((person) => (
            <MemberAvatar
              key={person.userId}
              name={person.name}
              avatarUrl={person.avatarUrl}
            />
          ))}
        </Avatar.Group>
      ),
    },
    {
      key: "actions",
      width: 64,
      align: "end",
      render: (_, task) => (
        <RowActions actions={actionsFor(task)} label={t("actionsFor")} />
      ),
    },
  ];

  return (
    <ListingTable<Task>
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      loading={loading}
      filtered={filtered}
      emptyTitle={t("empty.title")}
      emptyDescription={t("empty.description")}
      emptyFilteredTitle={t("empty.filtered")}
      onRow={(task) => ({
        onClick: (event) => {
          // Clicks inside the actions popover shouldn't also open the drawer.
          if ((event.target as HTMLElement).closest("button")) return;
          onOpen(task);
        },
        className: "cursor-pointer",
      })}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
        hideOnSinglePage: true,
      }}
    />
  );
}
