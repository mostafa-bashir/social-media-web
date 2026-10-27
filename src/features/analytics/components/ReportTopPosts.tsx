"use client";

import { useFormatter, useTranslations } from "next-intl";

import MediaThumb from "@/components/ui/MediaThumb";
import PlatformBadge from "@/components/ui/PlatformBadge";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { AnalyticsPost } from "../types";

const THUMB_SIZE = 48;

/** The best posts of the range, as a plain list that prints well. */
export default function ReportTopPosts({ posts }: { posts: AnalyticsPost[] }) {
  const t = useTranslations("analytics.report");
  const format = useFormatter();
  const fmt = useMetricFormat();

  if (posts.length === 0) {
    return <p className="text-sm text-text-tertiary">{t("noPosts")}</p>;
  }
  return (
    <ol className="flex flex-col divide-y divide-border-secondary">
      {posts.map((post) => (
        <li
          key={post.id}
          className="flex items-center gap-3 py-3 break-inside-avoid"
        >
          {post.thumbnail ? (
            <MediaThumb asset={post.thumbnail} size={THUMB_SIZE} />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm text-text-primary" dir="auto">
              {post.caption || t("noCaption")}
            </p>
            <p className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
              <PlatformBadge platform={post.platform} />
              {format.dateTime(new Date(post.publishedAt), {
                dateStyle: "medium",
              })}
            </p>
          </div>
          <dl className="grid shrink-0 grid-cols-2 gap-x-4 text-end text-xs">
            <dt className="text-text-tertiary">{t("views")}</dt>
            <dd className="font-medium text-text-primary tabular-nums">
              {fmt.count(post.metrics?.views ?? null)}
            </dd>
            <dt className="text-text-tertiary">{t("engagements")}</dt>
            <dd className="font-medium text-text-primary tabular-nums">
              {fmt.count(post.metrics?.engagements ?? null)}
            </dd>
          </dl>
        </li>
      ))}
    </ol>
  );
}
