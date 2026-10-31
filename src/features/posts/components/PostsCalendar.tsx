"use client";

import { Alert, Calendar } from "antd";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { type Dayjs, dayjs, toZoned } from "@/lib/dayjs";

import { usePosts } from "../api/get-posts";
import type { Post, PostStatus } from "../types";
import PostTargetsIcons from "./PostTargetsIcons";

/** The API's page-size ceiling; a month rarely holds more. */
const MAX_PAGE_SIZE = 100;
const DAY_KEY = "YYYY-MM-DD";
const VISIBLE_PER_DAY = 3;
/** The month grid also shows the edges of the previous and next months. */
const GRID_EDGE_DAYS = 7;

export interface PostsCalendarProps {
  clientId?: string;
  status?: PostStatus;
  timezone: string;
  onOpen: (post: Post) => void;
}

/** Month view of scheduled and sent posts, by day in `timezone`. */
export default function PostsCalendar({
  clientId,
  status,
  timezone,
  onOpen,
}: PostsCalendarProps) {
  const t = useTranslations("posts.calendar");
  const [month, setMonth] = useState<Dayjs>(() => dayjs());
  const range = useMemo(() => {
    const start = dayjs.tz(month.startOf("month").format(DAY_KEY), timezone);
    return {
      from: start.subtract(GRID_EDGE_DAYS, "day").toISOString(),
      to: start.add(1, "month").add(GRID_EDGE_DAYS, "day").toISOString(),
    };
  }, [month, timezone]);
  const posts = usePosts({
    page: 1,
    pageSize: MAX_PAGE_SIZE,
    clientId,
    status,
    ...range,
  });

  const byDay = useMemo(() => {
    const days = new Map<string, Post[]>();
    for (const post of posts.data?.data ?? []) {
      if (!post.scheduledAt) continue;
      const key = toZoned(post.scheduledAt, timezone).format(DAY_KEY);
      days.set(key, [...(days.get(key) ?? []), post]);
    }
    for (const list of days.values()) {
      list.sort((a, b) =>
        (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""),
      );
    }
    return days;
  }, [posts.data, timezone]);

  const renderDay = (date: Dayjs) => {
    const dayPosts = byDay.get(date.format(DAY_KEY)) ?? [];
    return (
      <ul className="flex flex-col gap-1">
        {dayPosts.slice(0, VISIBLE_PER_DAY).map((post) => (
          <li key={post.id}>
            <button
              type="button"
              onClick={() => onOpen(post)}
              className="flex w-full items-center gap-1.5 truncate rounded-md bg-primary-subtle px-1.5 py-0.5 text-start text-xs text-primary-text hover:bg-primary-border"
            >
              <span dir="ltr">
                {toZoned(post.scheduledAt as string, timezone).format("HH:mm")}
              </span>
              <PostTargetsIcons
                targets={post.targets}
                mediaCount={post.media.length}
              />
            </button>
          </li>
        ))}
        {dayPosts.length > VISIBLE_PER_DAY ? (
          <li className="text-xs text-text-tertiary">
            {t("more", { count: dayPosts.length - VISIBLE_PER_DAY })}
          </li>
        ) : null}
      </ul>
    );
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-xs text-text-tertiary">
        {t("timezone")} <span dir="ltr">{timezone}</span>
      </p>
      {(posts.data?.meta.total ?? 0) > MAX_PAGE_SIZE ? (
        <Alert
          type="warning"
          showIcon
          title={t("truncated", { count: MAX_PAGE_SIZE })}
        />
      ) : null}
      <Calendar
        value={month}
        onPanelChange={(value) => setMonth(value)}
        onSelect={(value) => setMonth(value)}
        cellRender={(date, info) =>
          info.type === "date" ? renderDay(date) : info.originNode
        }
      />
    </div>
  );
}
