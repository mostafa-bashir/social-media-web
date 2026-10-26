import { useTranslations } from "next-intl";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";

import type { TargetStatus } from "../types";

const TONES: Record<TargetStatus, StatusTone> = {
  pending: "neutral",
  publishing: "accent",
  published: "growth",
  failed: "danger",
};

export default function TargetStatusBadge({
  status,
}: {
  status: TargetStatus;
}) {
  const t = useTranslations("posts.targetStatus");
  return <StatusBadge tone={TONES[status]}>{t(status)}</StatusBadge>;
}
