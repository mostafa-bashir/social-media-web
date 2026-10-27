"use client";

import { Form, Radio, Select } from "antd";
import { useTranslations } from "next-intl";

import {
  MAX_DAY_OF_MONTH,
  type ReportScheduleInput,
  SCHEDULE_FREQUENCIES,
} from "../api/report-schedules";
import { useScheduleLabels } from "../hooks/use-schedule-labels";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const DAYS_OF_MONTH = Array.from(
  { length: MAX_DAY_OF_MONTH },
  (_, index) => index + 1,
);

/** Frequency, then the weekday or day of the month, and the hour. */
export default function ScheduleTimingFields() {
  const t = useTranslations("analytics.schedules.form");
  const { weekdayName, hourLabel } = useScheduleLabels();
  const form = Form.useFormInstance<ReportScheduleInput>();
  const frequency = Form.useWatch("frequency", form);

  return (
    <>
      <Form.Item name="frequency" label={t("frequency")}>
        <Radio.Group
          optionType="button"
          options={SCHEDULE_FREQUENCIES.map((value) => ({
            value,
            label: t(value),
          }))}
        />
      </Form.Item>
      <div className="grid gap-x-4 sm:grid-cols-2">
        {frequency === "monthly" ? (
          <Form.Item name="dayOfMonth" label={t("dayOfMonth")}>
            <Select
              options={DAYS_OF_MONTH.map((day) => ({ value: day, label: day }))}
            />
          </Form.Item>
        ) : (
          <Form.Item name="weekday" label={t("weekday")}>
            <Select
              options={WEEKDAYS.map((day) => ({
                value: day,
                label: weekdayName(day),
              }))}
            />
          </Form.Item>
        )}
        <Form.Item name="sendHour" label={t("hour")} extra={t("hourHint")}>
          <Select
            options={HOURS.map((hour) => ({
              value: hour,
              label: hourLabel(hour),
            }))}
          />
        </Form.Item>
      </div>
    </>
  );
}
