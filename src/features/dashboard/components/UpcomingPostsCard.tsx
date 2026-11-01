"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";

import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePermissions } from "@/hooks/use-permissions";
import { Link } from "@/i18n/navigation";
import { browserTimezone, dayjs, toZoned } from "@/lib/dayjs";

import { type UpcomingPost, useUpcomingPosts } from "../api/get-upcoming-posts";
import { useDashboardClient, withClient } from "../hooks/use-dashboard-client";
import DashboardCard from "./DashboardCard";
import UpcomingPostRow from "./UpcomingPostRow";

const DAY_KEY = "YYYY-MM-DD";

interface DayGroup {
  day: string;
  posts: UpcomingPost[];
}

/** Groups by calendar day in `zone`; posts arrive soonest first. */
function groupByDay(posts: UpcomingPost[], zone: string): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const post of posts) {
    const day = toZoned(post.scheduledAt, zone).format(DAY_KEY);
    const last = groups.at(-1);
    if (last?.day === day) last.posts.push(post);
    else groups.push({ day, posts: [post] });
  }
  return groups;
}

const GROUP_HEADING_CLASS =
  "px-2 pb-1 text-xs font-semibold uppercase tracking-wide";

/** Late posts first, then the next week, in the viewer's own time zone. */
export default function UpcomingPostsCard() {
  const t = useTranslations("dashboard.upcoming");
  const format = useFormatter();
  const slug = useActiveWorkspaceSlug() ?? "";
  const { can } = usePermissions();
  const { clientId } = useDashboardClient();
  const allowed = can(Permission.PostsView);
  const posts = useUpcomingPosts(allowed, clientId);
  const zone = browserTimezone();
  const late = posts.data?.late ?? [];
  const lateTotal = posts.data?.lateTotal ?? 0;
  const days = useMemo(
    () => groupByDay(posts.data?.upcoming ?? [], zone),
    [posts.data, zone],
  );

  if (!allowed) return null;
  const today = dayjs().tz(zone);
  const dayLabel = (day: string) => {
    if (day === today.format(DAY_KEY)) return t("today");
    if (day === today.add(1, "day").format(DAY_KEY)) return t("tomorrow");
    return format.dateTime(dayjs.tz(day, zone).toDate(), {
      weekday: "long",
      day: "numeric",
      month: "short",
      timeZone: zone,
    });
  };
  const timeOf = (post: UpcomingPost, withDate: boolean) =>
    format.dateTime(new Date(post.scheduledAt), {
      ...(withDate ? { day: "numeric", month: "short" } : {}),
      hour: "numeric",
      minute: "2-digit",
      timeZone: zone,
    });
  const rows = (list: UpcomingPost[], isLate: boolean) => (
    <ul className="flex flex-col">
      {list.map((post) => (
        <UpcomingPostRow
          key={post.id}
          post={post}
          // A late post may be days old, so it shows its date too.
          time={timeOf(post, isLate)}
          late={isLate}
          href={routes.workspace(slug).post(post.id)}
        />
      ))}
    </ul>
  );

  return (
    <DashboardCard
      title={t("title")}
      href={withClient(routes.workspace(slug).posts, clientId)}
      loading={posts.isLoading}
      error={posts.isError}
    >
      {late.length === 0 && days.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-text-secondary">{t("empty")}</p>
          {can(Permission.PostsManage) ? (
            <Link
              href={routes.workspace(slug).newPost}
              className="text-sm font-medium text-primary-text hover:underline"
            >
              {t("schedule")}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {late.length > 0 ? (
            <div>
              <h3 className={`${GROUP_HEADING_CLASS} text-danger-text`}>
                {t("lateGroup")}
              </h3>
              {rows(late, true)}
              {lateTotal > late.length ? (
                <p className="px-2 text-xs text-text-tertiary">
                  {t("moreLate", { count: lateTotal - late.length })}
                </p>
              ) : null}
            </div>
          ) : null}
          {days.map((group) => (
            <div key={group.day}>
              <h3 className={`${GROUP_HEADING_CLASS} text-text-tertiary`}>
                {dayLabel(group.day)}
              </h3>
              {rows(group.posts, false)}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
