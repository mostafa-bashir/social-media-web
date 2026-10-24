"use client";

import { Alert, App, Form, Input, Modal, Select } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useRoleLabel, useRoles } from "@/features/roles";
import { useErrorMessage } from "@/hooks/use-error-message";
import { emailSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";

import { useInviteMember } from "../api/members-api";

interface InviteValues {
  email: string;
  roleId: string;
}

export function InviteMemberModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("members.invite");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [form] = Form.useForm<InviteValues>();
  const roles = useRoles();
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
      destroyOnHidden
    >
      {invite.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(invite.error)}
          className="!mb-4"
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
          rules={[{ required: true, message: tValidation("required") }]}
        >
          <Select options={roleOptions} loading={roles.isLoading} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
