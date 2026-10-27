"use client";

import { Alert, Checkbox, Form, Modal, Select } from "antd";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { z } from "zod";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  MAX_RECIPIENTS,
  type ReportSchedule,
  type ReportScheduleInput,
  SCHEDULE_LOCALES,
  toScheduleInput,
  useCreateReportSchedule,
  useUpdateReportSchedule,
} from "../api/report-schedules";
import { REPORT_SECTIONS, type ReportSection } from "../types/report";
import ScheduleTimingFields from "./ScheduleTimingFields";

const DEFAULT_SEND_HOUR = 9;
const emailSchema = z.email();

/** Create (`schedule` null) or edit an emailed report schedule. */
export default function ScheduleFormModal({
  open,
  clientId,
  schedule,
  defaultSections,
  onClose,
}: {
  open: boolean;
  clientId: string;
  schedule: ReportSchedule | null;
  defaultSections: ReportSection[];
  onClose: () => void;
}) {
  const t = useTranslations("analytics.schedules.form");
  const tSections = useTranslations("analytics.report.sections");
  const errorMessage = useErrorMessage();
  const [form] = Form.useForm<ReportScheduleInput>();
  const create = useCreateReportSchedule();
  const update = useUpdateReportSchedule();
  const mutation = schedule ? update : create;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(
      schedule
        ? toScheduleInput(schedule)
        : {
            frequency: "weekly",
            weekday: 1,
            dayOfMonth: 1,
            sendHour: DEFAULT_SEND_HOUR,
            recipients: [],
            locale: "en",
            sections: defaultSections,
          },
    );
    create.reset();
    update.reset();
    // Reset only when the modal opens for a (possibly different) schedule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, schedule]);

  const onFinish = (values: ReportScheduleInput) => {
    if (schedule) {
      update.mutate(
        { ...values, id: schedule.id, active: schedule.active },
        { onSuccess: onClose },
      );
    } else {
      create.mutate({ ...values, clientId }, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      open={open}
      title={schedule ? t("editTitle") : t("createTitle")}
      okText={t("save")}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={mutation.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      {mutation.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(mutation.error)}
          className="mb-4!"
        />
      ) : null}
      <Form<ReportScheduleInput>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
      >
        <ScheduleTimingFields />
        <Form.Item
          name="recipients"
          label={t("recipients")}
          extra={t("recipientsHint", { max: MAX_RECIPIENTS })}
          rules={[
            {
              validator: (_rule, value: string[] = []) =>
                value.length === 0
                  ? Promise.reject(new Error(t("recipientsRequired")))
                  : value.length > MAX_RECIPIENTS
                    ? Promise.reject(
                        new Error(t("tooMany", { max: MAX_RECIPIENTS })),
                      )
                    : value.every(
                          (email) => emailSchema.safeParse(email).success,
                        )
                      ? Promise.resolve()
                      : Promise.reject(new Error(t("invalidEmail"))),
            },
          ]}
        >
          <Select
            mode="tags"
            open={false}
            suffixIcon={null}
            tokenSeparators={[",", " ", ";"]}
          />
        </Form.Item>
        <Form.Item name="locale" label={t("language")}>
          <Select
            options={SCHEDULE_LOCALES.map((value) => ({
              value,
              label: t(`languages.${value}`),
            }))}
          />
        </Form.Item>
        <Form.Item
          name="sections"
          label={t("sections")}
          rules={[{ required: true, message: t("sectionsRequired") }]}
        >
          <Checkbox.Group
            options={REPORT_SECTIONS.map((section) => ({
              value: section,
              label: tSections(section),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
