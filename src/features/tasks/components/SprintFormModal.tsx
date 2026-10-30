"use client";

import { DatePicker, Form, Input, Modal } from "antd";
import { useTranslations } from "next-intl";

import { type Dayjs, dayjs } from "@/lib/dayjs";

import type { Sprint, SprintInput } from "../types";

const MAX_NAME_LENGTH = 60;
const MAX_GOAL_LENGTH = 500;

interface FormValues {
  name: string;
  goal?: string;
  dates?: [Dayjs | null, Dayjs | null] | null;
}

export interface SprintFormModalProps {
  open: boolean;
  /** Present when editing. */
  sprint?: Sprint;
  /** Suggested name for a new sprint, e.g. "Sprint 4". */
  suggestedName: string;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (input: SprintInput) => void;
}

/** Name, goal and (optional) dates; dates are picked in the viewer's zone. */
export default function SprintFormModal({
  open,
  sprint,
  suggestedName,
  loading,
  onCancel,
  onSubmit,
}: SprintFormModalProps) {
  const t = useTranslations("tasks.sprints.form");
  const [form] = Form.useForm<FormValues>();

  return (
    <Modal
      open={open}
      title={sprint ? t("editTitle") : t("createTitle")}
      okText={sprint ? t("save") : t("create")}
      okButtonProps={{ loading, className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: sprint?.name ?? suggestedName,
          goal: sprint?.goal ?? "",
          dates: sprint?.startAt
            ? [dayjs(sprint.startAt), sprint.endAt ? dayjs(sprint.endAt) : null]
            : null,
        }}
        onFinish={({ name, goal, dates }) =>
          onSubmit({
            name,
            goal: goal?.trim() || null,
            startAt: dates?.[0]?.startOf("day").toISOString() ?? null,
            endAt: dates?.[1]?.endOf("day").toISOString() ?? null,
          })
        }
      >
        <Form.Item
          name="name"
          label={t("name")}
          rules={[{ required: true, whitespace: true, max: MAX_NAME_LENGTH }]}
        >
          <Input maxLength={MAX_NAME_LENGTH} />
        </Form.Item>
        <Form.Item name="goal" label={t("goal")}>
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={MAX_GOAL_LENGTH}
            placeholder={t("goalPlaceholder")}
          />
        </Form.Item>
        <Form.Item name="dates" label={t("dates")} extra={t("datesHint")}>
          <DatePicker.RangePicker
            className="w-full"
            allowEmpty={[true, true]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
