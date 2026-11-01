"use client";

import { useTranslations } from "next-intl";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import { PLATFORM_ICONS } from "@/components/ui/platform-icons";
import type { PostStatus } from "@/config/post-statuses";
import { Link } from "@/i18n/navigation";

import type { UpcomingPost } from "../api/get-upcoming-posts";

// Every status, so a new one fails the type check instead of rendering untoned.
const STATUS_TONES: Record<PostStatus, StatusTone> = {
  draft: "neutral",
  in_review: "accent",
  changes_requested: "danger",
  scheduled: "brand",
  publishing: "accent",
  published: "growth",
  partially_failed: "accent",
  failed: "danger",
};

export interface UpcomingPostRowProps {
  post: UpcomingPost;
  time: string;
  /** Past its slot but not out yet: in flight, or stuck. */
  late: boolean;
  href: string;
}

export default function UpcomingPostRow({
  post,
  time,
  late,
  href,
}: UpcomingPostRowProps) {
  const t = useTranslations("posts.status");
  const tPlatforms = useTranslations("common.platforms");
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-primary"
      >
        {/* Late times carry a date, so they may wrap; the group heading says "Late". */}
        <span
          className={`w-18 shrink-0 pt-0.5 text-sm font-medium tabular-nums ${late ? "text-danger-text" : "whitespace-nowrap text-text-primary"}`}
        >
          {time}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm text-text-primary">
            {post.captionExcerpt || "—"}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <span className="truncate">{post.clientName}</span>
            <span className="flex items-center gap-1 text-sm">
              {post.targets.map((target, index) => (
                <span
                  key={`${target.platform}-${index}`}
                  role="img"
                  aria-label={`${tPlatforms(target.platform)} · ${target.accountName}`}
                  title={target.accountName}
                >
                  {PLATFORM_ICONS[target.platform]}
                </span>
              ))}
            </span>
          </span>
        </span>
        <StatusBadge tone={STATUS_TONES[post.status]}>
          {t(post.status)}
        </StatusBadge>
      </Link>
    </li>
  );
}
