"use client";

import { ArrowRightOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import { useAnalyticsPosts } from "../api/get-analytics";
import { usePostDrawer } from "../hooks/use-post-drawer";
import type { AnalyticsScope, PostSort } from "../types";
import AnalyticsPostsTable from "./AnalyticsPostsTable";

const TOP_COUNT = 5;
const TOP_SORTS = ["engagements", "views", "engagementRate"] as const;
type TopSort = (typeof TOP_SORTS)[number] & PostSort;

/** The few best posts of the range, with a way into the full list. */
export default function TopPostsCard({ scope }: { scope: AnalyticsScope }) {
  const t = useTranslations("analytics.posts");
  const slug = useActiveWorkspaceSlug() ?? "";
  const params = useSearchParams();
  const drawer = usePostDrawer();
  const [sort, setSort] = useState<TopSort>("engagements");
  const posts = useAnalyticsPosts(scope, {
    sort,
    page: 1,
    pageSize: TOP_COUNT,
  });
  const query = Object.fromEntries(params.entries());

  return (
    <section className="surface-card flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">
          {t("topTitle")}
        </h2>
        <Segmented<TopSort>
          aria-label={t("sort")}
          className="max-w-full overflow-x-auto"
          value={sort}
          options={TOP_SORTS.map((value) => ({
            value,
            label: t(`sorts.${value}`),
          }))}
          onChange={setSort}
        />
      </div>
      <div className="surface-panel overflow-x-auto p-0!">
        <AnalyticsPostsTable
          variant="compact"
          posts={posts.data?.data ?? []}
          loading={posts.isFetching}
          timezone={scope.timezone}
          onOpen={(post) => drawer.open({ source: post.source, id: post.id })}
        />
      </div>
      {(posts.data?.meta.total ?? 0) > TOP_COUNT ? (
        <Link
          href={{
            pathname: routes.workspace(slug).analyticsPosts,
            query: scope.accountId
              ? { ...query, accountId: scope.accountId }
              : query,
          }}
          className="flex items-center gap-1 self-end text-sm font-medium text-primary-text"
        >
          {t("seeAll", { count: posts.data?.meta.total ?? 0 })}
          <ArrowRightOutlined aria-hidden className="rtl:rotate-180" />
        </Link>
      ) : null}
    </section>
  );
}
