"use client";

import { Form, Input, Modal, Select } from "antd";
import { useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";

import {
  STATUS_CATEGORIES,
  STATUS_TONES,
  type TaskStatusInput,
} from "../types";

const MAX_NAME_LENGTH = 60;

export interface StatusFormModalProps {
  open: boolean;
  /** Present when editing an existing column. */
  initial?: TaskStatusInput;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (input: TaskStatusInput) => void;
}

export default function StatusFormModal({
  open,
  initial,
  loading,
  onCancel,
  onSubmit,
}: StatusFormModalProps) {
  const t = useTranslations("tasks.columns");
  const [form] = Form.useForm<TaskStatusInput>();

  return (
    <Modal
      open={open}
      title={initial ? t("editTitle") : t("createTitle")}
      okText={initial ? t("save") : t("create")}
      okButtonProps={{ loading, className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      {/* Destroyed when hidden, so the initial values apply afresh on every open. */}
      <Form
        form={form}
        layout="vertical"
        initialValues={
          initial ?? { name: "", tone: "neutral", category: "in_progress" }
        }
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label={t("name")}
          rules={[{ required: true, whitespace: true, max: MAX_NAME_LENGTH }]}
        >
          <Input maxLength={MAX_NAME_LENGTH} />
        </Form.Item>
        <Form.Item name="tone" label={t("tone")}>
          <Select
            options={STATUS_TONES.map((tone) => ({
              value: tone,
              label: (
                <StatusBadge tone={tone}>{t(`tones.${tone}`)}</StatusBadge>
              ),
            }))}
          />
        </Form.Item>
        <Form.Item
          name="category"
          label={t("category")}
          extra={t("categoryHelp")}
        >
          <Select
            options={STATUS_CATEGORIES.map((category) => ({
              value: category,
              label: t(`categories.${category}`),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
