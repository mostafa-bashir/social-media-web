"use client";

import { Alert, App, Form, Input, Modal, Select } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";
import { emailSchema, nameSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";

import { type InviteAdminInput, useInviteAdmin } from "../api/admins";
import { ADMIN_ROLES } from "../types";

export default function InviteAdminModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.admins.invite");
  const tRoles = useTranslations("admin.roles");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [form] = Form.useForm<InviteAdminInput>();
  const invite = useInviteAdmin();

  const close = () => {
    form.resetFields();
    invite.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      okText={t("send")}
      onOk={() => form.submit()}
      onCancel={close}
      confirmLoading={invite.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      <div className="surface-card-form">
        <div className="surface-panel">
          {invite.error ? (
            <Alert
              type="error"
              showIcon
              title={errorMessage(invite.error)}
              className="mb-4!"
            />
          ) : null}
          <Form<InviteAdminInput>
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ role: "support" }}
            onFinish={(values) =>
              invite.mutate(values, {
                onSuccess: () => {
                  message.success(t("sent", { email: values.email }));
                  close();
                },
              })
            }
          >
            <Form.Item
              name="name"
              label={t("name")}
              rules={[zodRule(nameSchema, tValidation)]}
            >
              <Input autoFocus />
            </Form.Item>
            <Form.Item
              name="email"
              label={t("email")}
              rules={[zodRule(emailSchema, tValidation)]}
            >
              <Input type="email" />
            </Form.Item>
            <Form.Item
              name="role"
              label={t("role")}
              extra={t("roleHint")}
              className="mb-0!"
            >
              <Select
                options={ADMIN_ROLES.map((role) => ({
                  value: role,
                  label: tRoles(role),
                }))}
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
