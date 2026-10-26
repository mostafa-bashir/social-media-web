"use client";

import { LinkOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import MediaThumb from "@/components/ui/MediaThumb";
import PlatformBadge from "@/components/ui/PlatformBadge";
import { toZoned } from "@/lib/dayjs";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { AnalyticsPost } from "../types";

const THUMB_SIZE = 40;
type Counter =
  "views" | "reach" | "engagements" | "likes" | "comments" | "shares" | "saves";
/** Compact keeps what fits beside a chart; full shows every counter, hiding some on narrow screens. */
const COUNTERS: Record<"compact" | "full", Counter[]> = {
  compact: ["views", "engagements", "likes", "comments"],
  full: [
    "views",
    "reach",
    "engagements",
    "likes",
    "comments",
    "shares",
    "saves",
  ],
};
const WIDE_ONLY: ReadonlySet<Counter> = new Set(["reach", "shares", "saves"]);

export interface AnalyticsPostsTableProps {
  posts: AnalyticsPost[];
  loading: boolean;
  timezone: string;
  variant: "compact" | "full";
  onOpen: (post: AnalyticsPost) => void;
  pagination?: TableProps<AnalyticsPost>["pagination"];
  filtered?: boolean;
}

/** Published posts with their counters; a post opens in the analytics drawer. */
export default function AnalyticsPostsTable({
  posts,
  loading,
  timezone,
  variant,
  onOpen,
  pagination = false,
  filtered = false,
}: AnalyticsPostsTableProps) {
  const t = useTranslations("analytics.posts");
  const tTypes = useTranslations("analytics.contentTypes");
  const format = useFormatter();
  const fmt = useMetricFormat();

  const columns: TableProps<AnalyticsPost>["columns"] = [
    {
      title: t("columns.post"),
      key: "post",
      render: (_, post) => (
        <div className="flex items-center gap-3">
          {post.thumbnail ? (
            <MediaThumb asset={post.thumbnail} size={THUMB_SIZE} />
          ) : null}
          <div className="flex min-w-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => onOpen(post)}
              className="line-clamp-2 max-w-md cursor-pointer text-start text-text-primary hover:text-primary-text"
            >
              {post.caption || (
                <span className="text-text-tertiary">{t("noCaption")}</span>
              )}
            </button>
            <span className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
              <PlatformBadge platform={post.platform} />
              {post.contentType ? (
                <span>{tTypes(post.contentType)}</span>
              ) : null}
              {post.source === "external" ? <span>{t("external")}</span> : null}
              {format.dateTime(toZoned(post.publishedAt, timezone).toDate(), {
                dateStyle: "medium",
              })}
            </span>
          </div>
        </div>
      ),
    },
    ...COUNTERS[variant].map((key) => ({
      title: t(`columns.${key}`),
      key,
      align: "end" as const,
      ...(WIDE_ONLY.has(key) ? { responsive: ["xl" as const] } : {}),
      render: (_: unknown, post: AnalyticsPost) => (
        <span className="tabular-nums">
          {fmt.count(post.metrics?.[key] ?? null)}
        </span>
      ),
    })),
    {
      title: <span className="sr-only">{t("columns.link")}</span>,
      key: "link",
      render: (_, post) =>
        post.externalUrl ? (
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("viewOnPlatform")}
            className="text-primary-text"
          >
            <LinkOutlined aria-hidden />
          </a>
        ) : null,
    },
  ];

  return (
    <ListingTable<AnalyticsPost>
      rowKey={(post) => `${post.source}:${post.id}`}
      columns={columns}
      dataSource={posts}
      loading={loading}
      emptyTitle={t("empty")}
      emptyDescription={t("emptyDescription")}
      emptyFilteredTitle={t("emptyFiltered")}
      filtered={filtered}
      pagination={pagination}
    />
  );
}
