import type { BoardColumn } from "../types";
import type { BoardMove } from "./move-in-board";

const COLUMN_PREFIX = "column:";

/** Card chrome shared by the board card and its drag overlay. */
export const TASK_CARD_CLASS = "surface-panel flex flex-col gap-2 p-3";

/** Droppable id of a column, distinct from task ids so drops on empty columns resolve. */
export function columnDropId(statusId: string): string {
  return `${COLUMN_PREFIX}${statusId}`;
}

/**
 * Where a card dropped on `overId` (a card or a column) lands: the column and
 * the card it sits below. Null when nothing would change.
 */
export function dropTarget(
  columns: BoardColumn[],
  activeId: string,
  overId: string,
): BoardMove | null {
  const source = columns.find((column) =>
    column.tasks.some((task) => task.id === activeId),
  );
  if (!source) return null;

  if (overId.startsWith(COLUMN_PREFIX)) {
    const statusId = overId.slice(COLUMN_PREFIX.length);
    const target = columns.find((column) => column.status.id === statusId);
    if (!target) return null;
    const rest = target.tasks.filter((task) => task.id !== activeId);
    return {
      taskId: activeId,
      statusId,
      afterTaskId: rest.at(-1)?.id ?? null,
    };
  }

  const target = columns.find((column) =>
    column.tasks.some((task) => task.id === overId),
  );
  if (!target || overId === activeId) return null;
  const overIndex = target.tasks.findIndex((task) => task.id === overId);
  const activeIndex = target.tasks.findIndex((task) => task.id === activeId);
  // Dragging down within a column lands below the hovered card; otherwise above it.
  const below = target === source && activeIndex < overIndex;
  const anchor = below ? target.tasks[overIndex] : target.tasks[overIndex - 1];
  return {
    taskId: activeId,
    statusId: target.status.id,
    afterTaskId: anchor && anchor.id !== activeId ? anchor.id : null,
  };
}
