"use client";

import { App, Button, DatePicker, Form, InputNumber, Select } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";
import type { Dayjs } from "@/lib/dayjs";

import { useAddTaskGoal } from "../api/task-social";
import { GOAL_METRICS, type GoalMetric } from "../types";

const MAX_TARGET = 1_000_000_000_000;

interface FormValues {
  metric?: GoalMetric;
  target?: number;
  dueAt?: Dayjs | null;
}

/** Inline "add goal": one goal per metric, optional deadline (viewer's time zone). */
export default function TaskGoalForm({
  taskId,
  usedMetrics,
}: {
  taskId: string;
  usedMetrics: GoalMetric[];
}) {
  const t = useTranslations("tasks.goals");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const add = useAddTaskGoal(taskId);
  const [form] = Form.useForm<FormValues>();
  const free = GOAL_METRICS.filter((metric) => !usedMetrics.includes(metric));

  if (free.length === 0) return null;

  return (
    <Form
      form={form}
      layout="inline"
      className="gap-y-2"
      onFinish={({ metric, target, dueAt }) =>
        metric &&
        target &&
        add.mutate(
          { metric, target, dueAt: dueAt ? dueAt.toISOString() : null },
          {
            onSuccess: () => form.resetFields(),
            onError: (error) => message.error(errorMessage(error)),
          },
        )
      }
    >
      <Form.Item name="metric" rules={[{ required: true, message: "" }]}>
        <Select
          className="w-36!"
          placeholder={t("metric")}
          aria-label={t("metric")}
          options={free.map((metric) => ({
            value: metric,
            label: t(`metrics.${metric}`),
          }))}
        />
      </Form.Item>
      <Form.Item name="target" rules={[{ required: true, message: "" }]}>
        <InputNumber
          className="w-32!"
          min={1}
          max={MAX_TARGET}
          precision={0}
          placeholder={t("target")}
          aria-label={t("target")}
        />
      </Form.Item>
      <Form.Item name="dueAt">
        <DatePicker
          showTime={{ format: "HH:mm" }}
          format="YYYY-MM-DD HH:mm"
          placeholder={t("dueBy")}
          aria-label={t("dueBy")}
        />
      </Form.Item>
      <Button
        htmlType="submit"
        className="rounded-full!"
        loading={add.isPending}
      >
        {t("add")}
      </Button>
    </Form>
  );
}
