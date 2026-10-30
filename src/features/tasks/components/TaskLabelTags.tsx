import StatusBadge from "@/components/ui/StatusBadge";

import type { TaskLabel } from "../types";

export default function TaskLabelTags({ labels }: { labels: TaskLabel[] }) {
  if (labels.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <li key={label.id}>
          <StatusBadge tone={label.tone}>{label.name}</StatusBadge>
        </li>
      ))}
    </ul>
  );
}
