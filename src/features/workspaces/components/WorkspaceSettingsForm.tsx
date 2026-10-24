"use client";

import { Alert, App, Button, Form, Input, Select, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";
import { LOCALES } from "@/i18n/routing";
import { nameSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";

import {
  type UpdateWorkspaceInput,
  useUpdateWorkspace,
  useWorkspaceDetails,
} from "../api/workspaces-api";
import { usePermissions } from "../hooks/use-permissions";
import { Permission } from "../permissions";

export function WorkspaceSettingsForm() {
  const t = useTranslations("settings.workspace");
  const tLocales = useTranslations("common.locales");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const details = useWorkspaceDetails();
  const update = useUpdateWorkspace();
  const { can } = usePermissions();
  const canEdit = can(Permission.WorkspaceUpdate);

  const timezoneOptions = useMemo(
    () =>
      Intl.supportedValuesOf("timeZone").map((zone) => ({
        value: zone,
        label: zone,
      })),
    [],
  );

  if (details.isLoading) {
    return <Skeleton active paragraph={{ rows: 5 }} />;
  }
  if (details.error || !details.data) {
    return <Alert type="error" showIcon title={errorMessage(details.error)} />;
  }

  return (
    <Form<UpdateWorkspaceInput>
      layout="vertical"
      requiredMark={false}
      disabled={!canEdit}
      initialValues={details.data}
      className="max-w-xl"
      onFinish={(values) =>
        update.mutate(values, {
          onSuccess: () => message.success(t("saved")),
          onError: (error) => message.error(errorMessage(error)),
        })
      }
    >
      {!canEdit ? (
        <Alert type="info" showIcon title={t("readOnly")} className="!mb-4" />
      ) : null}
      <Form.Item
        name="name"
        label={t("name")}
        rules={[zodRule(nameSchema, tValidation)]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={t("slug")} extra={t("slugHint")}>
        <Input value={details.data.slug} disabled dir="ltr" />
      </Form.Item>
      <Form.Item
        name="timezone"
        label={t("timezone")}
        extra={t("timezoneHint")}
      >
        <Select showSearch options={timezoneOptions} />
      </Form.Item>
      <Form.Item name="locale" label={t("locale")} extra={t("localeHint")}>
        <Select
          options={LOCALES.map((value) => ({
            value,
            label: tLocales(value),
          }))}
        />
      </Form.Item>
      {canEdit ? (
        <Button type="primary" htmlType="submit" loading={update.isPending}>
          {t("save")}
        </Button>
      ) : null}
    </Form>
  );
}
