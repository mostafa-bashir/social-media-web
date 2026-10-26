"use client";

import type { TableProps } from "antd";
import { useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { ContentInsights } from "../types/content";

type Hashtag = ContentInsights["hashtags"][number];

/** Most-used hashtags; the bar shows each one's average engagement against the best. */
export default function HashtagTable({ hashtags }: { hashtags: Hashtag[] }) {
  const t = useTranslations("analytics.content.hashtags");
  const fmt = useMetricFormat();
  const best = Math.max(1, ...hashtags.map((tag) => tag.avgEngagements));

  const columns: TableProps<Hashtag>["columns"] = [
    {
      title: t("columns.tag"),
      key: "tag",
      render: (_, tag) => (
        <span className="font-medium text-text-primary" dir="auto">
          #{tag.tag}
        </span>
      ),
    },
    {
      title: t("columns.posts"),
      key: "posts",
      align: "end",
      render: (_, tag) => <span className="tabular-nums">{tag.posts}</span>,
    },
    {
      title: t("columns.avgEngagements"),
      key: "avg",
      render: (_, tag) => (
        <div className="flex min-w-40 items-center gap-2">
          <span className="w-12 shrink-0 text-end tabular-nums">
            {fmt.count(tag.avgEngagements)}
          </span>
          <span aria-hidden className="h-2 flex-1">
            <span
              className="block h-full rounded-e-sm bg-chart-1"
              style={{ width: `${(tag.avgEngagements / best) * 100}%` }}
            />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="surface-panel overflow-x-auto p-0!">
      <ListingTable<Hashtag>
        rowKey="tag"
        columns={columns}
        dataSource={hashtags}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        emptyTitle={t("empty")}
      />
    </div>
  );
}
