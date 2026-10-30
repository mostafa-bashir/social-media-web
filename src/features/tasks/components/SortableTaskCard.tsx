"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TASK_CARD_CLASS } from "../lib/board-dnd";
import type { Task } from "../types";
import TaskCard from "./TaskCard";

export interface SortableTaskCardProps {
  task: Task;
  draggable: boolean;
  onOpen: (task: Task) => void;
}

/** The whole card is the drag handle (Space picks it up by keyboard, Enter opens it). */
export default function SortableTaskCard({
  task,
  draggable,
  onOpen,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !draggable });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={task.title}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        listeners?.onKeyDown?.(event);
        if (event.key === "Enter" && !event.defaultPrevented) onOpen(task);
      }}
      className={`${TASK_CARD_CLASS} cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <TaskCard task={task} />
    </article>
  );
}
