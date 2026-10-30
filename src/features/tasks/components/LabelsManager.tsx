"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useCreateTaskLabel,
  useDeleteTaskLabel,
  useTaskLabels,
  useUpdateTaskLabel,
} from "../api/task-meta";
import {
  STATUS_TONES,
  type StatusTone,
  type TaskLabelInput,
  type TaskLabelWithCount,
} from "../types";

const MAX_NAME_LENGTH = 40;

/** Workspace labels: add, recolour and delete (deleting unlinks it from tasks). */
export default function LabelsManager() {
  const t = useTranslations("tasks.labels");
  const tTone = useTranslations("tasks.columns.tones");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const labels = useTaskLabels();
  const create = useCreateTaskLabel();
  const update = useUpdateTaskLabel();
  const remove = useDeleteTaskLabel();
  const [form] = Form.useForm<TaskLabelInput>();
  const [deleting, setDeleting] = useState<TaskLabelWithCount | null>(null);
  const onError = (error: unknown) => message.error(errorMessage(error));
  const toneSelect = {
    options: STATUS_TONES.map((tone) => ({ value: tone, label: tTone(tone) })),
    optionRender: (option: { value?: unknown; label?: unknown }) => (
      <StatusBadge tone={option.value as StatusTone}>
        {String(option.label)}
      </StatusBadge>
    ),
  };

  return (
    <div className="flex flex-col gap-4">
      <Form
        form={form}
        layout="inline"
        className="gap-y-2"
        initialValues={{ name: "", tone: "neutral" }}
        onFinish={(input) =>
          create.mutate(input, { onSuccess: () => form.resetFields(), onError })
        }
      >
        <Form.Item name="name" rules={[{ required: true, whitespace: true }]}>
          <Input
            maxLength={MAX_NAME_LENGTH}
            placeholder={t("name")}
            aria-label={t("name")}
          />
        </Form.Item>
        <Form.Item name="tone">
          <Select className="w-32!" aria-label={t("tone")} {...toneSelect} />
        </Form.Item>
        <Button
          htmlType="submit"
          type="primary"
          className="rounded-full!"
          loading={create.isPending}
        >
          {t("add")}
        </Button>
      </Form>
      {labels.data?.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("empty")}</p>
      ) : null}
      <ul className="flex flex-col divide-y divide-border-secondary">
        {(labels.data ?? []).map((label) => (
          <li key={label.id} className="flex items-center gap-3 py-2">
            <StatusBadge tone={label.tone}>{label.name}</StatusBadge>
            <span className="flex-1 text-xs text-text-tertiary">
              {t("taskCount", { count: label.taskCount })}
            </span>
            <Select
              size="small"
              className="w-32!"
              aria-label={t("toneFor", { label: label.name })}
              value={label.tone}
              {...toneSelect}
              onChange={(tone) =>
                update.mutate({ id: label.id, tone }, { onError })
              }
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={t("deleteLabel", { label: label.name })}
              onClick={() => setDeleting(label)}
            />
          </li>
        ))}
      </ul>
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        itemName={deleting?.name}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
            onError,
          })
        }
      />
    </div>
  );
}
