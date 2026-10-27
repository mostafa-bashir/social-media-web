import { useFormatter, useTranslations } from "next-intl";

import type { ReportSchedule } from "../api/report-schedules";

/** 2024-01-01 was a Monday, so ISO weekday n is January n of 2024. */
const isoWeekdayDate = (weekday: number) => Date.UTC(2024, 0, weekday);

/** Localized weekday, hour and whole-rule labels for report schedules. */
export function useScheduleLabels() {
  const t = useTranslations("analytics.schedules");
  const format = useFormatter();

  const weekdayName = (weekday: number) =>
    format.dateTime(isoWeekdayDate(weekday), {
      weekday: "long",
      timeZone: "UTC",
    });
  const hourLabel = (hour: number) =>
    format.dateTime(Date.UTC(2024, 0, 1, hour), {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });
  const ruleLabel = (schedule: ReportSchedule) =>
    schedule.frequency === "weekly"
      ? t("weekly", {
          weekday: weekdayName(schedule.weekday ?? 1),
          time: hourLabel(schedule.sendHour),
        })
      : t("monthly", {
          day: schedule.dayOfMonth ?? 1,
          time: hourLabel(schedule.sendHour),
        });

  return { weekdayName, hourLabel, ruleLabel };
}
