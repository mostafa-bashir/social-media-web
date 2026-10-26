"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useAnalyticsOverview, useAnalyticsPosts } from "../api/get-analytics";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import { usePostDrawer } from "../hooks/use-post-drawer";
import { usePostsFilters } from "../hooks/use-posts-filters";
import {
  CONTENT_TYPES,
  type ContentType,
  POST_SORTS,
  type PostSort,
} from "../types";
import AnalyticsPostsTable from "./AnalyticsPostsTable";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/** Every post in the range, searchable and sortable by any counter. */
export default function PostsTab() {
  const t = useTranslations("analytics.posts");
  const tTypes = useTranslations("analytics.contentTypes");
  const { scope, compare } = useAnalyticsFilters();
  const { filters, update } = usePostsFilters();
  const drawer = usePostDrawer();
  const accounts = useAnalyticsOverview(scope, compare).data?.accounts ?? [];
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const request = { ...filters, search: debouncedSearch || undefined };
  // Any change of scope or filters starts again at page 1.
  const listKey = JSON.stringify([scope, request]);
  const [paging, setPaging] = useState({ listKey, page: 1 });
  const page = paging.listKey === listKey ? paging.page : 1;
  const posts = useAnalyticsPosts(scope, {
    ...request,
    page,
    pageSize: PAGE_SIZE,
  });

  const toolbar = (
    <ListingToolbar
      filters={
        <>
          <Input
            allowClear
            className="w-full sm:w-64!"
            prefix={<SearchOutlined aria-hidden />}
            placeholder={t("search")}
            aria-label={t("search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select<string>
            allowClear
            className="w-full sm:w-52!"
            placeholder={t("allAccounts")}
            aria-label={t("account")}
            value={filters.accountId}
            options={accounts.map((account) => ({
              value: account.id,
              label: account.displayName,
            }))}
            onChange={(accountId) => update({ accountId })}
          />
          <Select<ContentType>
            allowClear
            className="w-full sm:w-40!"
            placeholder={t("allTypes")}
            aria-label={t("type")}
            value={filters.contentType}
            options={CONTENT_TYPES.map((value) => ({
              value,
              label: tTypes(value),
            }))}
            onChange={(contentType) => update({ contentType })}
          />
          <Select<PostSort>
            className="w-full sm:w-48!"
            aria-label={t("sort")}
            value={filters.sort}
            options={POST_SORTS.map((value) => ({
              value,
              label: t("sortBy", { sort: t(`sorts.${value}`) }),
            }))}
            onChange={(sort) => update({ sort })}
          />
        </>
      }
    />
  );

  return (
    <ListingShell toolbar={toolbar} fillPage={false}>
      <AnalyticsPostsTable
        variant="full"
        posts={posts.data?.data ?? []}
        loading={posts.isFetching}
        timezone={scope.timezone}
        filtered={Boolean(
          request.accountId || request.contentType || request.search,
        )}
        onOpen={(post) => drawer.open({ source: post.source, id: post.id })}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: posts.data?.meta.total ?? 0,
          hideOnSinglePage: true,
          showSizeChanger: false,
          onChange: (next) => setPaging({ listKey, page: next }),
        }}
      />
    </ListingShell>
  );
}
