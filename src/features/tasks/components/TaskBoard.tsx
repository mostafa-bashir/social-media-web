"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Skeleton } from "antd";
import { type ReactNode, useState } from "react";

import { dropTarget, TASK_CARD_CLASS } from "../lib/board-dnd";
import type { BoardMove } from "../lib/move-in-board";
import type { BoardColumn as Column, Task } from "../types";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";

/** Pixels the pointer travels before a press becomes a drag, so clicks still open cards. */
const DRAG_ACTIVATION_DISTANCE = 6;
const SKELETON_COLUMNS = 4;

export interface TaskBoardProps {
  columns: Column[] | undefined;
  canManage: boolean;
  columnMenu?: (column: Column) => ReactNode;
  onOpen: (task: Task) => void;
  onAdd: (statusId: string) => void;
  onMove: (move: BoardMove) => void;
}

export default function TaskBoard({
  columns,
  canManage,
  columnMenu,
  onOpen,
  onAdd,
  onMove,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    // Space picks a card up; Enter stays free to open it.
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ["Space"],
        cancel: ["Escape"],
        end: ["Space", "Enter"],
      },
    }),
  );

  if (!columns) {
    return (
      <div className="flex gap-4 overflow-x-auto p-4">
        {Array.from({ length: SKELETON_COLUMNS }, (_, index) => (
          <div key={index} className="surface-card w-72 shrink-0 p-3">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;
    const move = dropTarget(columns, String(active.id), String(over.id));
    if (move) onMove(move);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) =>
        setActiveTask(
          columns
            .flatMap((column) => column.tasks)
            .find((task) => task.id === active.id) ?? null,
        )
      }
      onDragCancel={() => setActiveTask(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-4 overflow-x-auto p-4">
        {columns.map((column) => (
          <BoardColumn
            key={column.status.id}
            column={column}
            canManage={canManage}
            menu={columnMenu?.(column)}
            onOpen={onOpen}
            onAdd={onAdd}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className={`${TASK_CARD_CLASS} shadow-lg`}>
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
