"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { App, Switch } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import RowActions from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  type ReportSchedule,
  toScheduleInput,
  useUpdateReportSchedule,
} from "../api/report-schedules";
import { useScheduleLabels } from "../hooks/use-schedule-labels";

/** One schedule: its rule, recipients, last outcome, and pause/edit/delete. */
export default function ScheduleRow({
  schedule,
  timezone,
  onEdit,
  onDelete,
}: {
  schedule: ReportSchedule;
  /** The client's; send times read as the rule says ("9:00 AM"). */
  timezone: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("analytics.schedules");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { ruleLabel } = useScheduleLabels();
  const update = useUpdateReportSchedule();
  const when = (iso: string) =>
    format.dateTime(new Date(iso), {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    });
  const rule = ruleLabel(schedule);

  const setActive = (active: boolean) =>
    update.mutate(
      { ...toScheduleInput(schedule), id: schedule.id, active },
      { onError: (error) => message.error(errorMessage(error)) },
    );

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium text-text-primary">{rule}</span>
        <span className="break-all text-xs text-text-secondary" dir="ltr">
          {schedule.recipients.join(", ")}
        </span>
        <span className="text-xs text-text-tertiary">
          {schedule.active
            ? t("next", { when: when(schedule.nextRunAt) })
            : null}
          {schedule.active ? " · " : null}
          {schedule.lastSentAt
            ? t("lastSent", { when: when(schedule.lastSentAt) })
            : t("neverSent")}
        </span>
        {schedule.lastError ? (
          <span role="status" className="text-xs text-danger">
            {t("failed", { reason: schedule.lastError })}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge tone={schedule.active ? "growth" : "neutral"}>
          {t(schedule.active ? "active" : "paused")}
        </StatusBadge>
        <Switch
          size="small"
          checked={schedule.active}
          loading={update.isPending}
          onChange={setActive}
          aria-label={t(schedule.active ? "pause" : "resume")}
        />
        <RowActions
          label={t("actionsFor", { rule })}
          actions={[
            {
              key: "edit",
              label: t("edit"),
              icon: <EditOutlined />,
              onClick: onEdit,
            },
            {
              key: "delete",
              label: t("delete"),
              icon: <DeleteOutlined />,
              danger: true,
              onClick: onDelete,
            },
          ]}
        />
      </div>
    </li>
  );
}
