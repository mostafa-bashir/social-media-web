"use client";

import { MailOutlined } from "@ant-design/icons";
import { Alert, App, Button, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  MAX_SCHEDULES_PER_CLIENT,
  type ReportSchedule,
  useDeleteReportSchedule,
  useReportSchedules,
} from "../api/report-schedules";
import type { ReportSection } from "../types/report";
import ScheduleFormModal from "./ScheduleFormModal";
import ScheduleRow from "./ScheduleRow";

/** The client's report, emailed weekly or monthly to the people listed. */
export default function SchedulesCard({
  clientId,
  timezone,
  sections,
}: {
  clientId: string;
  timezone: string | undefined;
  sections: ReportSection[];
}) {
  const t = useTranslations("analytics.schedules");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const schedules = useReportSchedules(clientId);
  const remove = useDeleteReportSchedule();
  // undefined = closed, null = creating.
  const [editing, setEditing] = useState<ReportSchedule | null | undefined>();
  const [deleting, setDeleting] = useState<ReportSchedule | null>(null);
  const atLimit = (schedules.data?.length ?? 0) >= MAX_SCHEDULES_PER_CLIENT;

  const onDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting, {
      onSuccess: () => setDeleting(null),
      onError: (error) => message.error(errorMessage(error)),
    });
  };

  return (
    <section className="surface-card flex flex-col gap-4 print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {t("title")}
          </h2>
          <p className="text-sm text-text-secondary">
            {timezone ? t("description", { timezone }) : null}
          </p>
        </div>
        <Button
          type="primary"
          icon={<MailOutlined />}
          className="rounded-full!"
          disabled={atLimit}
          onClick={() => setEditing(null)}
        >
          {t("add")}
        </Button>
      </div>
      {schedules.error ? (
        <Alert type="error" showIcon title={errorMessage(schedules.error)} />
      ) : !schedules.data ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : schedules.data.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary">
          {schedules.data.map((schedule) => (
            <ScheduleRow
              key={schedule.id}
              schedule={schedule}
              timezone={timezone}
              onEdit={() => setEditing(schedule)}
              onDelete={() => setDeleting(schedule)}
            />
          ))}
        </ul>
      )}
      <ScheduleFormModal
        open={editing !== undefined}
        clientId={clientId}
        schedule={editing ?? null}
        defaultSections={sections}
        onClose={() => setEditing(undefined)}
      />
      <DeleteConfirmModal
        open={deleting !== null}
        loading={remove.isPending}
        title={t("deleteTitle")}
        question={t("deleteQuestion")}
        confirmLabel={t("delete")}
        onCancel={() => setDeleting(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}
