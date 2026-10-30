"use client";

import { Progress } from "antd";
import { useTranslations } from "next-intl";

import { useDuration } from "../hooks/use-duration";
import type { Task } from "../types";

/** Logged vs estimated time; over the estimate shows in the danger tone. */
export default function TaskTimeField({ task }: { task: Task }) {
  const t = useTranslations("tasks.time");
  const duration = useDuration();
  const { estimateMinutes: estimate, loggedMinutes: logged } = task;

  if (!estimate && logged === 0) return <>—</>;
  const label = estimate
    ? t("loggedOf", { logged: duration(logged), estimate: duration(estimate) })
    : t("logged", { logged: duration(logged) });

  return (
    <div className="flex flex-col gap-1">
      <span>{label}</span>
      {estimate ? (
        <Progress
          percent={Math.min(100, Math.round((logged / estimate) * 100))}
          status={logged > estimate ? "exception" : "normal"}
          showInfo={false}
          size="small"
          aria-label={label}
        />
      ) : null}
    </div>
  );
}
