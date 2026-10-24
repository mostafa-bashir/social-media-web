"use client";

import { Alert, Checkbox, Form, Input, Modal, Typography } from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { z } from "zod";

import { useErrorMessage } from "@/hooks/use-error-message";
import { zodRule } from "@/lib/forms/zod-rule";

import {
  type PermissionInfo,
  type Role,
  type RoleInput,
  useCreateRole,
  usePermissionCatalog,
  useUpdateRole,
} from "../api/roles-api";

const roleNameSchema = z
  .string("required")
  .trim()
  .min(2, "nameMin")
  .max(64, "roleNameMax");

function groupPermissions(
  permissions: PermissionInfo[],
): Array<[string, PermissionInfo[]]> {
  const groups = new Map<string, PermissionInfo[]>();
  for (const permission of permissions) {
    groups.set(permission.groupKey, [
      ...(groups.get(permission.groupKey) ?? []),
      permission,
    ]);
  }
  return [...groups.entries()];
}

/** Create (role = null) or edit a custom role. */
export function RoleEditorModal({
  open,
  role,
  onClose,
}: {
  open: boolean;
  role: Role | null;
  onClose: () => void;
}) {
  const t = useTranslations("roles");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const [form] = Form.useForm<RoleInput>();
  const catalog = usePermissionCatalog();
  const create = useCreateRole();
  const update = useUpdateRole();
  const mutation = role ? update : create;
  const groups = useMemo(
    () => groupPermissions(catalog.data ?? []),
    [catalog.data],
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: role?.name ?? "",
        description: role?.description ?? "",
        permissions: role?.permissions ?? [],
      });
      create.reset();
      update.reset();
    }
    // Reset only when the modal opens for a (possibly different) role.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role]);

  const onFinish = (values: RoleInput) => {
    const onSuccess = () => onClose();
    if (role) {
      update.mutate({ ...values, id: role.id }, { onSuccess });
    } else {
      create.mutate(values, { onSuccess });
    }
  };

  return (
    <Modal
      open={open}
      title={role ? t("editor.editTitle") : t("editor.createTitle")}
      okText={t("editor.save")}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={mutation.isPending}
      destroyOnHidden
      width={640}
    >
      {mutation.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(mutation.error)}
          className="!mb-4"
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
          label={t("editor.name")}
          rules={[zodRule(roleNameSchema, tValidation)]}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item name="description" label={t("editor.description")}>
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={255}
          />
        </Form.Item>
        <Form.Item name="permissions" label={t("editor.permissions")}>
          <Checkbox.Group className="!flex !w-full !flex-col !gap-4">
            {groups.map(([groupKey, permissions]) => (
              <div key={groupKey}>
                <Typography.Text strong>
                  {t(`groups.${groupKey}`)}
                </Typography.Text>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {permissions.map((permission) => (
                    <Checkbox key={permission.slug} value={permission.slug}>
                      {t(`permissions.${permission.slug.replace(".", "_")}`)}
                    </Checkbox>
                  ))}
                </div>
              </div>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
