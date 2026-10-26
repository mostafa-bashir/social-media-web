"use client";

import { LinkOutlined } from "@ant-design/icons";
import { Segmented, type TableProps } from "antd";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import ListingTable from "@/components/ui/ListingTable";
import MediaThumb from "@/components/ui/MediaThumb";
import PlatformBadge from "@/components/ui/PlatformBadge";
import { toZoned } from "@/lib/dayjs";

import { useAnalyticsPosts } from "../api/get-analytics";
import { useMetricFormat } from "../hooks/use-metric-format";
import {
  type AnalyticsPost,
  type AnalyticsScope,
  POST_SORTS,
  type PostSort,
} from "../types";

const PAGE_SIZE = 10;
const THUMB_SIZE = 40;

/** Posts published in the range, best first by the chosen measure. */
export default function TopPostsTable({ scope }: { scope: AnalyticsScope }) {
  const t = useTranslations("analytics.posts");
  const format = useFormatter();
  const fmt = useMetricFormat();
  const [sort, setSort] = useState<PostSort>("views");
  const [page, setPage] = useState(1);
  const posts = useAnalyticsPosts(scope, sort, page, PAGE_SIZE);
  const metric = (
    post: AnalyticsPost,
    key: "views" | "engagements" | "likes" | "comments",
  ) => fmt.count(post.metrics?.[key] ?? null);

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
            <span className="line-clamp-2 max-w-md text-text-primary">
              {post.caption || (
                <span className="text-text-tertiary">{t("noCaption")}</span>
              )}
            </span>
            <span className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
              <PlatformBadge platform={post.platform} />
              {post.source === "external" ? <span>{t("external")}</span> : null}
              {format.dateTime(
                toZoned(post.publishedAt, scope.timezone).toDate(),
                { dateStyle: "medium" },
              )}
            </span>
          </div>
        </div>
      ),
    },
    ...(["views", "engagements", "likes", "comments"] as const).map((key) => ({
      title: t(`columns.${key}`),
      key,
      align: "end" as const,
      render: (_: unknown, post: AnalyticsPost) => (
        <span className="tabular-nums">{metric(post, key)}</span>
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
    <section className="surface-card flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          {t("title")}
        </h2>
        <Segmented<PostSort>
          aria-label={t("sort")}
          className="max-w-full overflow-x-auto"
          value={sort}
          options={POST_SORTS.map((value) => ({
            value,
            label: t(`sorts.${value}`),
          }))}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </div>
      <div className="surface-panel overflow-x-auto p-0!">
        <ListingTable<AnalyticsPost>
          rowKey="id"
          columns={columns}
          dataSource={posts.data?.data ?? []}
          loading={posts.isFetching}
          emptyTitle={t("empty")}
          emptyDescription={t("emptyDescription")}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: posts.data?.meta.total ?? 0,
            hideOnSinglePage: true,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </div>
    </section>
  );
}
