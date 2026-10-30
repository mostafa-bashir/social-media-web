import { useTranslations } from "next-intl";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";

import type { WorkflowStage } from "../types";

export const STAGE_TONES: Record<WorkflowStage, StatusTone> = {
  no_post: "neutral",
  draft: "neutral",
  in_review: "accent",
  changes_requested: "danger",
  scheduled: "brand",
  publishing: "accent",
  published: "growth",
  measuring: "brand",
  goal_reached: "growth",
  goal_missed: "danger",
  failed: "danger",
};

export default function WorkflowStageBadge({
  stage,
}: {
  stage: WorkflowStage;
}) {
  const t = useTranslations("tasks.stages");
  return <StatusBadge tone={STAGE_TONES[stage]}>{t(stage)}</StatusBadge>;
}
