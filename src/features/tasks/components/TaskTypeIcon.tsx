import {
  BugOutlined,
  CheckSquareOutlined,
  FlagOutlined,
  NodeIndexOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

import type { TaskType } from "../types";

const ICONS: Record<TaskType, { Icon: ComponentType; className: string }> = {
  campaign: { Icon: FlagOutlined, className: "text-accent-text" },
  content: { Icon: PictureOutlined, className: "text-growth-text" },
  task: { Icon: CheckSquareOutlined, className: "text-primary-text" },
  bug: { Icon: BugOutlined, className: "text-danger-text" },
  subtask: { Icon: NodeIndexOutlined, className: "text-text-secondary" },
};

/** Jira-style type glyph; the type name is its accessible label. */
export default function TaskTypeIcon({ type }: { type: TaskType }) {
  const t = useTranslations("tasks.types");
  const { Icon, className } = ICONS[type];
  return (
    <span role="img" aria-label={t(type)} title={t(type)} className={className}>
      <Icon />
    </span>
  );
}
