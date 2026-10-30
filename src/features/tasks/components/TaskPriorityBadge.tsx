import { useTranslations } from "next-intl";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";

import type { TaskPriority } from "../types";

const TONES: Record<TaskPriority, StatusTone> = {
  low: "neutral",
  medium: "brand",
  high: "accent",
  urgent: "danger",
};

export default function TaskPriorityBadge({
  priority,
}: {
  priority: TaskPriority;
}) {
  const t = useTranslations("tasks.priority");
  return <StatusBadge tone={TONES[priority]}>{t(priority)}</StatusBadge>;
}
