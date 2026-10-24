"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Form, Input, Typography } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useSwitchWorkspace } from "@/hooks/use-switch-workspace";
import { nameSchema, workspaceSlugSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { getSlugAvailabilityQueryOptions } from "../api/get-slug-availability";
import {
  type CreateWorkspaceInput,
  useCreateWorkspace,
} from "../api/workspace-mutations";
import { slugify } from "../utils/slugify";

const SLUG_CHECK_DEBOUNCE_MS = 400;

function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export default function CreateWorkspaceForm() {
  const t = useTranslations("workspaces.create");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const [form] = Form.useForm<CreateWorkspaceInput>();
  const [slugEdited, setSlugEdited] = useState(false);
  const create = useCreateWorkspace();
  const { switchTo } = useSwitchWorkspace();

  const slug = Form.useWatch("slug", form) ?? "";
  const debouncedSlug = useDebouncedValue(slug, SLUG_CHECK_DEBOUNCE_MS);
  const slugValid = workspaceSlugSchema.safeParse(debouncedSlug).success;
  const availability = useQuery({
    ...getSlugAvailabilityQueryOptions(debouncedSlug),
    enabled: slugValid,
  });

  const onFinish = (values: CreateWorkspaceInput) => {
    create.mutate(
      { ...values, locale, timezone: browserTimezone() },
      { onSuccess: (workspace) => void switchTo(workspace.slug) },
    );
  };

  const slugStatus =
    slugValid && availability.data
      ? availability.data.available
        ? { status: "success" as const, help: t("slugAvailable") }
        : {
            status: "error" as const,
            help: t(`slugUnavailable.${availability.data.reason ?? "taken"}`),
          }
      : { status: undefined, help: undefined };

  return (
    <>
      <Typography.Title level={3} className="mb-1!">
        {t("title")}
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        {t("subtitle")}
      </Typography.Paragraph>
      {create.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(create.error)}
          className="mb-4!"
        />
      ) : null}
      <Form<CreateWorkspaceInput>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        onValuesChange={(changed: Partial<CreateWorkspaceInput>) => {
          if (changed.name !== undefined && !slugEdited) {
            form.setFieldValue("slug", slugify(changed.name));
          }
        }}
      >
        <Form.Item
          name="name"
          label={t("name")}
          rules={[zodRule(nameSchema, tValidation)]}
        >
          <Input autoFocus placeholder={t("namePlaceholder")} />
        </Form.Item>
        <Form.Item
          name="slug"
          label={t("slug")}
          rules={[zodRule(workspaceSlugSchema, tValidation)]}
          validateStatus={slugStatus.status}
          help={slugStatus.help}
          extra={t("slugHint")}
        >
          <Input
            dir="ltr"
            prefix={<span className="text-app-muted">/{locale}/</span>}
            onChange={() => setSlugEdited(true)}
            autoCapitalize="off"
            spellCheck={false}
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className={PRIMARY_PILL_BUTTON_CLASS}
          block
          loading={create.isPending || create.isSuccess}
          disabled={availability.data?.available === false}
        >
          {t("submit")}
        </Button>
      </Form>
    </>
  );
}
