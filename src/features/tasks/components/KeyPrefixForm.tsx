"use client";

import { App, Button, Form, Input } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useTaskSettings, useUpdateTaskSettings } from "../api/task-meta";

const PREFIX_PATTERN = /^[A-Za-z][A-Za-z0-9]{1,5}$/;

/** Issue-key prefix; empty restores the one derived from the workspace address. */
export default function KeyPrefixForm() {
  const t = useTranslations("tasks.keys");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const settings = useTaskSettings();
  const update = useUpdateTaskSettings();

  if (!settings.data) return null;

  return (
    <Form
      layout="vertical"
      initialValues={{ keyPrefix: settings.data.customKeyPrefix ?? "" }}
      onFinish={({ keyPrefix }: { keyPrefix: string }) =>
        update.mutate(
          { keyPrefix: keyPrefix.trim() || null },
          {
            onSuccess: () => message.success(t("saved")),
            onError: (error) => message.error(errorMessage(error)),
          },
        )
      }
    >
      <p className="mb-4 text-sm text-text-secondary">
        {t("current", { prefix: settings.data.keyPrefix })}
      </p>
      <Form.Item
        name="keyPrefix"
        label={t("prefix")}
        extra={t("help")}
        rules={[{ pattern: PREFIX_PATTERN, message: t("invalid") }]}
      >
        <Input
          maxLength={6}
          className="uppercase"
          placeholder={settings.data.keyPrefix}
        />
      </Form.Item>
      <Button
        htmlType="submit"
        type="primary"
        className="rounded-full!"
        loading={update.isPending}
      >
        {t("save")}
      </Button>
    </Form>
  );
}
