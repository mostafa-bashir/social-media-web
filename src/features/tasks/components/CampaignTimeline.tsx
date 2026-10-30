"use client";

import { Progress, Skeleton } from "antd";
import { useTranslations } from "next-intl";

import { type Dayjs, dayjs } from "@/lib/dayjs";

import { useTasks } from "../api/get-tasks";
import type { Task } from "../types";
import TaskKeyLabel from "./TaskKeyLabel";

const CAMPAIGN_LIMIT = 100;
const MONTH_FORMAT = "MMM YYYY";

interface Span {
  task: Task;
  start: Dayjs;
  end: Dayjs;
}

/**
 * Campaigns as bars across the months they run (start → due), with their
 * items' progress; undated campaigns are listed under the chart.
 */
export default function CampaignTimeline({
  onOpen,
}: {
  onOpen: (task: Task) => void;
}) {
  const t = useTranslations("tasks.timeline");
  const campaigns = useTasks({
    type: "campaign",
    page: 1,
    pageSize: CAMPAIGN_LIMIT,
  });

  if (campaigns.isLoading) {
    return <Skeleton active className="p-4" paragraph={{ rows: 6 }} />;
  }
  const all = campaigns.data?.data ?? [];
  const spans: Span[] = all.flatMap((task) => {
    const start = task.startAt ?? task.dueAt;
    const end = task.dueAt ?? task.startAt;
    return start && end ? [{ task, start: dayjs(start), end: dayjs(end) }] : [];
  });
  const undated = all.filter((task) => !task.startAt && !task.dueAt);

  if (all.length === 0) {
    return <p className="p-4 text-sm text-text-tertiary">{t("empty")}</p>;
  }
  const from = spans.length
    ? spans
        .reduce(
          (min, span) => (span.start.isBefore(min) ? span.start : min),
          spans[0].start,
        )
        .startOf("month")
    : dayjs().startOf("month");
  const to = spans.length
    ? spans
        .reduce(
          (max, span) => (span.end.isAfter(max) ? span.end : max),
          spans[0].end,
        )
        .endOf("month")
    : dayjs().endOf("month");
  const total = to.diff(from);
  const percent = (at: Dayjs) => (at.diff(from) / total) * 100;
  const months: Dayjs[] = [];
  for (let month = from; month.isBefore(to); month = month.add(1, "month")) {
    months.push(month);
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {spans.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="min-w-[640px]" dir="ltr">
            <div className="relative ms-56 flex h-6 border-b border-border-secondary">
              {months.map((month) => (
                <span
                  key={month.toISOString()}
                  className="absolute text-xs text-text-tertiary"
                  style={{ left: `${percent(month)}%` }}
                >
                  {month.format(MONTH_FORMAT)}
                </span>
              ))}
            </div>
            <ul className="flex flex-col">
              {spans.map(({ task, start, end }) => {
                const left = percent(start);
                const width = Math.max(1, percent(end.endOf("day")) - left);
                const { done, total: items } = task.children;
                return (
                  <li key={task.id} className="flex h-10 items-center">
                    <button
                      type="button"
                      className="flex w-56 shrink-0 items-center gap-2 pe-2 text-start hover:text-primary-text"
                      onClick={() => onOpen(task)}
                    >
                      <TaskKeyLabel type={task.type} taskKey={task.key} />
                      <span className="truncate text-sm">{task.title}</span>
                    </button>
                    <div className="relative h-full flex-1">
                      <button
                        type="button"
                        aria-label={t("bar", {
                          title: task.title,
                          start: start.format("D MMM"),
                          end: end.format("D MMM"),
                          done,
                          total: items,
                        })}
                        className="absolute top-2 h-6 overflow-hidden rounded bg-primary-subtle hover:ring-2 hover:ring-primary"
                        style={{ left: `${left}%`, width: `${width}%` }}
                        onClick={() => onOpen(task)}
                      >
                        <span
                          className="block h-full bg-primary"
                          style={{
                            width: items ? `${(done / items) * 100}%` : 0,
                          }}
                        />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
      {undated.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-text-primary">
            {t("undated")}
          </h3>
          <ul className="flex flex-col gap-2">
            {undated.map((task) => (
              <li key={task.id} className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-start hover:text-primary-text"
                  onClick={() => onOpen(task)}
                >
                  <TaskKeyLabel type={task.type} taskKey={task.key} />
                  <span className="truncate text-sm">{task.title}</span>
                </button>
                {task.children.total > 0 ? (
                  <Progress
                    className="w-32!"
                    size="small"
                    percent={Math.round(
                      (task.children.done / task.children.total) * 100,
                    )}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
