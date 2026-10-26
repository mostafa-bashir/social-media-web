import { Tooltip } from "antd";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";

import type { PostTarget, TargetStatus } from "../types";

const STATUS_CLASS: Record<TargetStatus, string> = {
  pending: "text-text-tertiary",
  publishing: "text-accent-text",
  published: "text-growth-text",
  failed: "text-danger-text",
};

/** Compact row of platform icons, coloured by each target's status. */
export default function PostTargetsIcons({
  targets,
}: {
  targets: PostTarget[];
}) {
  const t = useTranslations("posts.targetStatus");
  return (
    <span className="inline-flex items-center gap-1.5 text-base">
      {targets.map((target) => (
        <Tooltip
          key={target.id}
          title={`${target.accountName} · ${t(target.status)}`}
        >
          <span
            className={STATUS_CLASS[target.status]}
            aria-label={`${target.accountName}: ${t(target.status)}`}
          >
            {PLATFORM_ICONS[target.platform]}
          </span>
        </Tooltip>
      ))}
    </span>
  );
}
