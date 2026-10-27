"use client";

import { Alert, DatePicker, Form, InputNumber, Modal, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  GOAL_METRICS,
  type Goal,
  type GoalMetric,
  MAX_GOAL_DAYS,
  useSaveGoal,
} from "../api/goals";

const DAY_FORMAT = "YYYY-MM-DD";

interface GoalFormValues {
  metric: GoalMetric;
  target: number;
  period: [Dayjs, Dayjs];
}

/** Create (`goal` null) or edit a client goal. */
export default function GoalFormModal({
  open,
  clientId,
  goal,
  onClose,
}: {
  open: boolean;
  clientId: string;
  goal: Goal | null;
  onClose: () => void;
}) {
  const t = useTranslations("analytics.goals.form");
  const tMetrics = useTranslations("analytics.goals.metrics");
  const errorMessage = useErrorMessage();
  const [form] = Form.useForm<GoalFormValues>();
  const save = useSaveGoal();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(
      goal
        ? {
            metric: goal.metric,
            target: goal.target,
            period: [dayjs(goal.startDate), dayjs(goal.endDate)],
          }
        : {
            metric: "views",
            target: undefined,
            period: [dayjs().startOf("month"), dayjs().endOf("month")],
          },
    );
    save.reset();
    // Reset only when the modal opens for a (possibly different) goal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal]);

  const onFinish = ({ metric, target, period }: GoalFormValues) =>
    save.mutate(
      {
        id: goal?.id,
        clientId,
        metric,
        target,
        startDate: period[0].format(DAY_FORMAT),
        endDate: period[1].format(DAY_FORMAT),
      },
      { onSuccess: onClose },
    );

  return (
    <Modal
      open={open}
      title={goal ? t("editTitle") : t("createTitle")}
      okText={t("save")}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={save.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      {save.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(save.error)}
          className="mb-4!"
        />
      ) : null}
      <Form<GoalFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
      >
        <Form.Item name="metric" label={t("metric")} extra={t("metricHint")}>
          <Select
            options={GOAL_METRICS.map((value) => ({
              value,
              label: tMetrics(value),
            }))}
          />
        </Form.Item>
        <Form.Item
          name="target"
          label={t("target")}
          rules={[{ required: true, message: t("targetRequired") }]}
        >
          <InputNumber min={1} precision={0} className="w-full!" />
        </Form.Item>
        <Form.Item
          name="period"
          label={t("period")}
          extra={t("periodHint", { max: MAX_GOAL_DAYS })}
          rules={[
            { required: true, message: t("periodRequired") },
            {
              validator: (_rule, value: [Dayjs, Dayjs] | undefined) =>
                !value || value[1].diff(value[0], "day") < MAX_GOAL_DAYS
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(t("periodTooLong", { max: MAX_GOAL_DAYS })),
                    ),
            },
          ]}
        >
          <DatePicker.RangePicker className="w-full!" allowClear={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
