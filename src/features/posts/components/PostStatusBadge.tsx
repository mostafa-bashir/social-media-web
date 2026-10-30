import { useTranslations } from "next-intl";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";

import type { PostStatus } from "../types";

const TONES: Record<PostStatus, StatusTone> = {
  draft: "neutral",
  in_review: "accent",
  changes_requested: "danger",
  scheduled: "brand",
  publishing: "accent",
  published: "growth",
  partially_failed: "accent",
  failed: "danger",
};

export default function PostStatusBadge({ status }: { status: PostStatus }) {
  const t = useTranslations("posts.status");
  return <StatusBadge tone={TONES[status]}>{t(status)}</StatusBadge>;
}
