"use client";

import { Alert, App, Form, Input, Modal, Select } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";
import { useRoleLabel } from "@/hooks/use-role-label";
import { emailSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";

import { useRoleOptions } from "../api/get-members";
import { useInviteMember } from "../api/member-mutations";

interface InviteValues {
  email: string;
  roleId: string;
}

export interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({
  open,
  onClose,
}: InviteMemberModalProps) {
  const t = useTranslations("members.invite");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [form] = Form.useForm<InviteValues>();
  const roles = useRoleOptions();
  const invite = useInviteMember();
  const roleLabel = useRoleLabel();

  // The owner role can't be granted by invitation.
  const roleOptions = useMemo(
    () =>
      (roles.data ?? [])
        .filter((role) => role.slug !== "owner")
        .map((role) => ({ value: role.id, label: roleLabel(role) })),
    [roles.data, roleLabel],
  );
  const defaultRoleId = roles.data?.find((role) => role.slug === "member")?.id;

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
          <Form<InviteValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ roleId: defaultRoleId }}
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
              name="email"
              label={t("email")}
              rules={[zodRule(emailSchema, tValidation)]}
            >
              <Input type="email" autoFocus />
            </Form.Item>
            <Form.Item
              name="roleId"
              label={t("role")}
              className="mb-0!"
              rules={[{ required: true, message: tValidation("required") }]}
            >
              <Select options={roleOptions} loading={roles.isLoading} />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
