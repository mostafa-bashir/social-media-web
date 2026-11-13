"use client";

import { Alert, ColorPicker, Form, Input, Modal, Select, Switch } from "antd";
import type { Color } from "antd/es/color-picker";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

import { Feature } from "@/config/features";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { nameSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";

import { useCreateClient, useUpdateClient } from "../api/client-mutations";
import type { Client, ClientInput } from "../types";
import ClientLogoField from "./ClientLogoField";
import TargetCountriesSelect from "./TargetCountriesSelect";

const MAX_NOTES_LENGTH = 2000;
const OPAQUE_HEX_LENGTH = "#rrggbb".length;

/** The API stores opaque `#rrggbb`; a cleared picker means no colour. */
const toHexColor = (color: Color | null): string | null =>
  color && !color.cleared
    ? color.toHexString().slice(0, OPAQUE_HEX_LENGTH)
    : null;

interface ClientFormValues {
  name: string;
  timezone?: string;
  color: string | null;
  notes?: string;
  targetCountries: string[];
  requireApproval: boolean;
  isProspect: boolean;
}

export interface ClientFormModalProps {
  open: boolean;
  /** null = create a new client. */
  client: Client | null;
  onClose: () => void;
}

export default function ClientFormModal({
  open,
  client,
  onClose,
}: ClientFormModalProps) {
  const t = useTranslations("clients.form");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const [form] = Form.useForm<ClientFormValues>();
  const create = useCreateClient();
  const update = useUpdateClient();
  const mutation = client ? update : create;
  const { featureEnabled } = usePermissions();
  const canMarkProspect = !client && featureEnabled(Feature.ProspectAudits);
  const timezoneOptions = useMemo(
    () =>
      Intl.supportedValuesOf("timeZone").map((zone) => ({
        value: zone,
        label: zone,
      })),
    [],
  );

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: client?.name ?? "",
      timezone: client?.timezone,
      color: client?.color ?? null,
      notes: client?.notes ?? "",
      targetCountries: client?.targetCountries ?? [],
      requireApproval: client?.requireApproval ?? false,
      isProspect: false,
    });
    create.reset();
    update.reset();
    // Reset only when the modal opens for a (possibly different) client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client]);

  const onFinish = ({ isProspect, ...values }: ClientFormValues) => {
    const input: ClientInput = {
      ...values,
      notes: values.notes?.trim() || null,
    };
    if (client) {
      // Prospect status changes only through "Convert to client".
      update.mutate({ ...input, id: client.id }, { onSuccess: onClose });
    } else {
      create.mutate({ ...input, isProspect }, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      open={open}
      title={client ? t("editTitle") : t("createTitle")}
      okText={t("save")}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={mutation.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      <div className="surface-card-form">
        <div className="surface-panel">
          {mutation.error ? (
            <Alert
              type="error"
              showIcon
              title={errorMessage(mutation.error)}
              className="mb-4!"
            />
          ) : null}
          {client ? (
            <div className="mb-4">
              <ClientLogoField client={client} />
            </div>
          ) : null}
          <Form<ClientFormValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label={t("name")}
              rules={[zodRule(nameSchema, tValidation)]}
            >
              <Input autoFocus />
            </Form.Item>
            {canMarkProspect ? (
              <Form.Item
                name="isProspect"
                label={t("isProspect")}
                extra={t("isProspectHint")}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            ) : null}
            <Form.Item
              name="timezone"
              label={t("timezone")}
              extra={t("timezoneHint")}
            >
              <Select
                showSearch
                allowClear={!client}
                placeholder={t("timezonePlaceholder")}
                options={timezoneOptions}
              />
            </Form.Item>
            <Form.Item
              name="color"
              label={t("color")}
              getValueFromEvent={toHexColor}
            >
              <ColorPicker allowClear format="hex" />
            </Form.Item>
            <Form.Item
              name="targetCountries"
              label={t("targetCountries")}
              extra={t("targetCountriesHint")}
            >
              <TargetCountriesSelect
                placeholder={t("targetCountriesPlaceholder")}
              />
            </Form.Item>
            <Form.Item
              name="requireApproval"
              label={t("requireApproval")}
              extra={t("requireApprovalHint")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item name="notes" label={t("notes")} className="mb-0!">
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 5 }}
                maxLength={MAX_NOTES_LENGTH}
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
