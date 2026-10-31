import { Tooltip } from "antd";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";

import { formatLabel } from "../lib/format-label";
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
  mediaCount,
}: {
  targets: PostTarget[];
  mediaCount: number;
}) {
  const t = useTranslations("posts.targetStatus");
  const tFormats = useTranslations("common.platformFormats");
  return (
    <span className="inline-flex items-center gap-1.5 text-base">
      {targets.map((target) => {
        const format = tFormats(
          formatLabel(target.platform, target.format, mediaCount),
        );
        return (
          <Tooltip
            key={target.id}
            title={`${target.accountName} · ${format} · ${t(target.status)}`}
          >
            <span
              className={STATUS_CLASS[target.status]}
              aria-label={`${target.accountName} (${format}): ${t(target.status)}`}
            >
              {PLATFORM_ICONS[target.platform]}
            </span>
          </Tooltip>
        );
      })}
    </span>
  );
}
