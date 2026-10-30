"use client";

import { PlusOutlined } from "@ant-design/icons";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import StatusBadge from "@/components/ui/StatusBadge";

import { columnDropId } from "../lib/board-dnd";
import type { BoardColumn as Column, Task } from "../types";
import SortableTaskCard from "./SortableTaskCard";

export interface BoardColumnProps {
  column: Column;
  canManage: boolean;
  /** Column settings menu, only for members who can configure the board. */
  menu?: ReactNode;
  onOpen: (task: Task) => void;
  onAdd: (statusId: string) => void;
}

export default function BoardColumn({
  column,
  canManage,
  menu,
  onOpen,
  onAdd,
}: BoardColumnProps) {
  const t = useTranslations("tasks");
  const { setNodeRef, isOver } = useDroppable({
    id: columnDropId(column.status.id),
    disabled: !canManage,
  });
  const hidden = column.total - column.tasks.length;

  return (
    <section
      aria-label={column.status.name}
      className={`surface-card flex w-72 shrink-0 flex-col gap-3 p-3 ${
        isOver ? "ring-2 ring-primary" : ""
      }`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <StatusBadge tone={column.status.tone}>
            {column.status.name}
          </StatusBadge>
          <span className="text-xs text-text-tertiary">{column.total}</span>
        </div>
        <div className="flex items-center">
          {canManage ? (
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              aria-label={t("addToColumn", { column: column.status.name })}
              onClick={() => onAdd(column.status.id)}
            />
          ) : null}
          {menu}
        </div>
      </header>
      <SortableContext
        id={column.status.id}
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex min-h-24 flex-col gap-2">
          {column.tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              draggable={canManage}
              onOpen={onOpen}
            />
          ))}
          {column.tasks.length === 0 ? (
            <p className="py-6 text-center text-xs text-text-tertiary">
              {t("emptyColumn")}
            </p>
          ) : null}
        </div>
      </SortableContext>
      {hidden > 0 ? (
        <p className="text-center text-xs text-text-tertiary">
          {t("hiddenTasks", { count: hidden })}
        </p>
      ) : null}
    </section>
  );
}
