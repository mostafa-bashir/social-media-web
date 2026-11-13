"use client";

import { Alert, App, Button, Form, InputNumber, Skeleton, Switch } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useAdminSessionQuery } from "../api/admin-session";
import {
  useTenantEntitlements,
  useUpdateEntitlements,
} from "../api/entitlements";
import {
  FEATURES,
  type Feature,
  LIMIT_KINDS,
  type Limits,
} from "../types/entitlements";

interface PlanValues {
  enabled: Record<Feature, boolean>;
  limits: Limits;
}

/**
 * Which modules this workspace can use and how much it may add. Empty limit =
 * unlimited. Lowering a limit never deletes anything; it only stops new adds.
 */
export default function TenantPlanTab({ tenantId }: { tenantId: string }) {
  const t = useTranslations("admin.plan");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const canEdit = useAdminSessionQuery().data?.admin.role === "super_admin";
  const entitlements = useTenantEntitlements(tenantId);
  const save = useUpdateEntitlements(tenantId);

  if (entitlements.error) {
    return (
      <Alert type="error" showIcon title={errorMessage(entitlements.error)} />
    );
  }
  if (!entitlements.data) {
    return <Skeleton active />;
  }
  const data = entitlements.data;
  const initialValues: PlanValues = {
    enabled: Object.fromEntries(
      FEATURES.map((feature) => [
        feature,
        !data.disabledFeatures.includes(feature),
      ]),
    ) as Record<Feature, boolean>,
    limits: data.limits,
  };

  const onFinish = ({ enabled, limits }: PlanValues) =>
    save.mutate(
      {
        disabledFeatures: FEATURES.filter((feature) => !enabled[feature]),
        limits: Object.fromEntries(
          LIMIT_KINDS.map((kind) => [kind, limits[kind] ?? null]),
        ) as Limits,
      },
      {
        onSuccess: () => message.success(t("saved")),
        onError: (error) => message.error(errorMessage(error)),
      },
    );

  return (
    <Form<PlanValues>
      layout="vertical"
      initialValues={initialValues}
      disabled={!canEdit}
      onFinish={onFinish}
      className="flex flex-col gap-4"
    >
      <section className="surface-panel">
        <h2 className="mb-1 text-sm font-semibold text-text-primary">
          {t("featuresTitle")}
        </h2>
        <p className="mb-3 text-xs text-text-tertiary">{t("featuresHint")}</p>
        <div className="grid gap-x-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Form.Item
              key={feature}
              name={["enabled", feature]}
              valuePropName="checked"
              label={t(`features.${feature}`)}
              className="mb-3!"
            >
              <Switch />
            </Form.Item>
          ))}
        </div>
      </section>
      <section className="surface-panel">
        <h2 className="mb-1 text-sm font-semibold text-text-primary">
          {t("limitsTitle")}
        </h2>
        <p className="mb-3 text-xs text-text-tertiary">{t("limitsHint")}</p>
        <div className="grid gap-x-6 sm:grid-cols-2">
          {LIMIT_KINDS.map((kind) => (
            <Form.Item
              key={kind}
              name={["limits", kind]}
              label={t(`limits.${kind}`)}
              extra={t("inUse", { count: data.usage[kind] })}
              className="mb-3!"
            >
              <InputNumber
                min={kind === "members" ? 1 : 0}
                precision={0}
                placeholder={t("unlimited")}
                className="w-full!"
              />
            </Form.Item>
          ))}
        </div>
      </section>
      {canEdit ? (
        <Button
          type="primary"
          htmlType="submit"
          loading={save.isPending}
          className="self-start rounded-full!"
        >
          {t("save")}
        </Button>
      ) : (
        <p className="text-xs text-text-tertiary">{t("readOnly")}</p>
      )}
    </Form>
  );
}
