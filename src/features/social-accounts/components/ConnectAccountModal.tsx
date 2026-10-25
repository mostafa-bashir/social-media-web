"use client";

import { Alert, Form, Modal, Radio } from "antd";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useClientOptions,
  usePlatformAvailability,
} from "../api/get-social-accounts";
import { useStartConnect } from "../api/social-account-mutations";
import type { SocialPlatform } from "../types";
import ClientSelect from "./ClientSelect";
import { PLATFORM_ICONS } from "./platform-icons";

interface ConnectValues {
  clientId: string;
  platform: SocialPlatform;
}

export interface ConnectAccountModalProps {
  open: boolean;
  /** Pre-selects the client (e.g. when the list is filtered by one). */
  defaultClientId?: string;
  onClose: () => void;
}

export default function ConnectAccountModal({
  open,
  defaultClientId,
  onClose,
}: ConnectAccountModalProps) {
  const t = useTranslations("accounts.connect");
  const tPlatforms = useTranslations("accounts.platforms");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const [form] = Form.useForm<ConnectValues>();
  // Unfiltered first page: only used to tell "no clients yet" apart.
  const clients = useClientOptions("");
  const platforms = usePlatformAvailability();
  const start = useStartConnect();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ clientId: defaultClientId });
    start.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultClientId]);

  const noClients = clients.isSuccess && clients.data.length === 0;

  return (
    <Modal
      open={open}
      title={t("title")}
      okText={t("continue")}
      onOk={() => form.submit()}
      onCancel={onClose}
      // Stays loading through the redirect to the platform.
      confirmLoading={start.isPending || start.isSuccess}
      okButtonProps={{ className: "rounded-full!", disabled: noClients }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      <div className="surface-card-form">
        <div className="surface-panel">
          {start.error ? (
            <Alert
              type="error"
              showIcon
              title={errorMessage(start.error)}
              className="mb-4!"
            />
          ) : null}
          {noClients ? (
            <Alert
              type="info"
              showIcon
              title={t("noClients")}
              className="mb-4!"
            />
          ) : null}
          <Form<ConnectValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={(values) => start.mutate(values)}
          >
            <Form.Item
              name="clientId"
              label={t("client")}
              rules={[{ required: true, message: tValidation("required") }]}
            >
              <ClientSelect placeholder={t("clientPlaceholder")} />
            </Form.Item>
            <Form.Item
              name="platform"
              label={t("platform")}
              className="mb-0!"
              rules={[{ required: true, message: tValidation("required") }]}
            >
              <Radio.Group className="flex! flex-col gap-2">
                {(platforms.data ?? []).map(({ platform, configured }) => (
                  <Radio
                    key={platform}
                    value={platform}
                    disabled={!configured}
                    className="me-0! w-full rounded-lg border border-border-default px-3 py-2"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden>{PLATFORM_ICONS[platform]}</span>
                      {tPlatforms(platform)}
                      {configured ? null : (
                        <span className="text-xs text-text-tertiary">
                          {t("notConfigured")}
                        </span>
                      )}
                    </span>
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Form>
          <p className="mt-4 text-xs text-text-tertiary">{t("redirectHint")}</p>
        </div>
      </div>
    </Modal>
  );
}
