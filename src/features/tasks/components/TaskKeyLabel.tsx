import type { TaskType } from "../types";
import TaskTypeIcon from "./TaskTypeIcon";

/** Type icon followed by the issue key, e.g. "▣ ACME-42". */
export default function TaskKeyLabel({
  type,
  taskKey,
}: {
  type: TaskType;
  taskKey: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
      <TaskTypeIcon type={type} />
      <span dir="ltr">{taskKey}</span>
    </span>
  );
}
