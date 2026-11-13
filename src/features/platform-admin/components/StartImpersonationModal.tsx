"use client";

import { Alert, Form, Input, Modal } from "antd";
import { useLocale, useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useStartImpersonation } from "../api/impersonations";
import type { AdminTenantDetail } from "../types/tenants";

const REASON_MIN = 10;
const REASON_MAX = 500;

/**
 * Asks why, then opens the app as the workspace owner. The reason is emailed
 * to the owner and kept in both audit trails.
 */
export default function StartImpersonationModal({
  tenant,
  open,
  onClose,
}: {
  tenant: AdminTenantDetail;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.impersonation");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const [form] = Form.useForm<{ reason: string }>();
  const start = useStartImpersonation();

  const close = () => {
    form.resetFields();
    start.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t("title", { name: tenant.name })}
      okText={t("open")}
      onOk={() => form.submit()}
      onCancel={close}
      confirmLoading={start.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      <div className="surface-card-form">
        <div className="surface-panel">
          <Alert
            type="warning"
            showIcon
            className="mb-4!"
            title={t("warning", { email: tenant.ownerEmail ?? "" })}
          />
          {start.error ? (
            <Alert
              type="error"
              showIcon
              title={errorMessage(start.error)}
              className="mb-4!"
            />
          ) : null}
          <Form<{ reason: string }>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={({ reason }) =>
              start.mutate(
                { tenantId: tenant.id, reason: reason.trim() },
                {
                  // Same tab: a new tab opened after an await is a blocked popup.
                  // The banner's "End session" brings the admin back here.
                  onSuccess: ({ code }) =>
                    window.location.assign(
                      `/${locale}${routes.impersonate}?code=${encodeURIComponent(code)}`,
                    ),
                },
              )
            }
          >
            <Form.Item
              name="reason"
              label={t("reason")}
              extra={t("reasonHint")}
              className="mb-0!"
              rules={[
                { required: true, message: tValidation("required") },
                {
                  min: REASON_MIN,
                  max: REASON_MAX,
                  message: t("reasonLength", {
                    min: REASON_MIN,
                    max: REASON_MAX,
                  }),
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                maxLength={REASON_MAX}
                showCount
                autoFocus
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
