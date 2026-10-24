"use client";

import { Alert, App, Button, Form, Input, Select, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { LOCALES } from "@/i18n/routing";
import { nameSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { useWorkspaceDetails } from "../api/get-workspace";
import {
  type UpdateWorkspaceInput,
  useUpdateWorkspace,
} from "../api/workspace-mutations";
import DeleteWorkspaceSection from "./DeleteWorkspaceSection";

export default function WorkspaceSettingsForm() {
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
    return (
      <div className="surface-card">
        <div className="surface-panel">
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </div>
    );
  }
  if (details.error || !details.data) {
    return <Alert type="error" showIcon title={errorMessage(details.error)} />;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <section className="surface-card">
        <h2 className="px-3 pb-2 pt-1 text-sm font-semibold text-text-secondary">
          {t("sectionTitle")}
        </h2>
        <div className="surface-panel">
          {!canEdit ? (
            <Alert
              type="info"
              showIcon
              title={t("readOnly")}
              className="mb-4!"
            />
          ) : null}
          <Form<UpdateWorkspaceInput>
            layout="vertical"
            requiredMark={false}
            disabled={!canEdit}
            initialValues={details.data}
            onFinish={(values) =>
              update.mutate(values, {
                onSuccess: () => message.success(t("saved")),
                onError: (error) => message.error(errorMessage(error)),
              })
            }
          >
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
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
              <Form.Item
                name="locale"
                label={t("locale")}
                extra={t("localeHint")}
              >
                <Select
                  options={LOCALES.map((value) => ({
                    value,
                    label: tLocales(value),
                  }))}
                />
              </Form.Item>
            </div>
            {canEdit ? (
              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={update.isPending}
                  className={PRIMARY_PILL_BUTTON_CLASS}
                >
                  {t("save")}
                </Button>
              </div>
            ) : null}
          </Form>
        </div>
      </section>
      {can(Permission.WorkspaceDelete) ? (
        <DeleteWorkspaceSection
          slug={details.data.slug}
          name={details.data.name}
        />
      ) : null}
    </div>
  );
}
