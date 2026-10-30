import type { BoardColumn } from "../types";

export interface BoardMove {
  taskId: string;
  statusId: string;
  /** Task directly above the new spot; null = top of the column. */
  afterTaskId: string | null;
}

/** The board as it looks after `move`, for optimistic updates (the API stays the source of truth). */
export function moveInBoard(
  columns: BoardColumn[],
  move: BoardMove,
): BoardColumn[] {
  const task = columns
    .flatMap((column) => column.tasks)
    .find((item) => item.id === move.taskId);
  if (!task) return columns;

  return columns.map((column) => {
    const wasHere = column.tasks.some((item) => item.id === move.taskId);
    const rest = column.tasks.filter((item) => item.id !== move.taskId);
    if (column.status.id !== move.statusId) {
      return wasHere
        ? { ...column, tasks: rest, total: column.total - 1 }
        : column;
    }
    const anchorIndex = move.afterTaskId
      ? rest.findIndex((item) => item.id === move.afterTaskId)
      : -1;
    const tasks = [...rest];
    tasks.splice(anchorIndex + 1, 0, { ...task, statusId: move.statusId });
    return {
      ...column,
      tasks,
      total: wasHere ? column.total : column.total + 1,
    };
  });
}
