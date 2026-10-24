"use client";

import { Alert, Form, Input, Modal } from "antd";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { z } from "zod";

import { useErrorMessage } from "@/hooks/use-error-message";
import { zodRule } from "@/lib/forms/zod-rule";

import { usePermissionCatalog } from "../api/get-roles";
import { useCreateRole, useUpdateRole } from "../api/role-mutations";
import type { Role, RoleInput } from "../types";
import PermissionChecklist from "./PermissionChecklist";

const roleNameSchema = z
  .string("required")
  .trim()
  .min(2, "nameMin")
  .max(64, "roleNameMax");

export interface RoleFormModalProps {
  open: boolean;
  /** null = create a new role. */
  role: Role | null;
  onClose: () => void;
}

export default function RoleFormModal({
  open,
  role,
  onClose,
}: RoleFormModalProps) {
  const t = useTranslations("roles.editor");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const [form] = Form.useForm<RoleInput>();
  const catalog = usePermissionCatalog();
  const create = useCreateRole();
  const update = useUpdateRole();
  const mutation = role ? update : create;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? [],
    });
    create.reset();
    update.reset();
    // Reset only when the modal opens for a (possibly different) role.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role]);

  const onFinish = (values: RoleInput) => {
    if (role) {
      update.mutate({ ...values, id: role.id }, { onSuccess: onClose });
    } else {
      create.mutate(values, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      open={open}
      title={role ? t("editTitle") : t("createTitle")}
      okText={t("save")}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={mutation.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
      width={640}
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
          <Form<RoleInput>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label={t("name")}
              rules={[zodRule(roleNameSchema, tValidation)]}
            >
              <Input autoFocus />
            </Form.Item>
            <Form.Item name="description" label={t("description")}>
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={255}
              />
            </Form.Item>
            <Form.Item
              name="permissions"
              label={t("permissions")}
              className="mb-0!"
            >
              <PermissionChecklist permissions={catalog.data ?? []} />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
