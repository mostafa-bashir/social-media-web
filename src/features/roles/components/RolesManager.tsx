"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Popconfirm,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Permission, usePermissions } from "@/features/workspaces";
import { useErrorMessage } from "@/hooks/use-error-message";

import { type Role, useDeleteRole, useRoles } from "../api/roles-api";
import { useRoleLabel } from "../hooks/use-role-label";
import { RoleEditorModal } from "./RoleEditorModal";

export function RolesManager() {
  const t = useTranslations("roles");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const roles = useRoles();
  const deleteRole = useDeleteRole();
  const { can } = usePermissions();
  const roleLabel = useRoleLabel();
  const [editor, setEditor] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  });

  if (roles.isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }
  if (roles.error) {
    return <Alert type="error" showIcon title={errorMessage(roles.error)} />;
  }

  const roleDescription = (role: Role) =>
    role.isSystem ? t(`system.${role.slug}.description`) : role.description;

  return (
    <>
      {can(Permission.RolesCreate) ? (
        <div className="mb-4 flex justify-end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditor({ open: true, role: null })}
          >
            {t("create")}
          </Button>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.data?.map((role) => (
          <Card
            key={role.id}
            size="small"
            title={
              <span className="flex items-center gap-2">
                {roleLabel(role)}
                {role.isSystem ? <Tag>{t("builtIn")}</Tag> : null}
              </span>
            }
            actions={
              role.isSystem
                ? undefined
                : [
                    can(Permission.RolesUpdate) ? (
                      <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setEditor({ open: true, role })}
                      >
                        {t("edit")}
                      </Button>
                    ) : null,
                    can(Permission.RolesDelete) ? (
                      <Popconfirm
                        key="delete"
                        title={t("deleteConfirm", { name: role.name })}
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                          deleteRole.mutateAsync(role.id).catch((error) => {
                            message.error(errorMessage(error));
                          })
                        }
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          {t("delete")}
                        </Button>
                      </Popconfirm>
                    ) : null,
                  ].filter(Boolean)
            }
          >
            <Typography.Paragraph type="secondary" className="!mb-2">
              {roleDescription(role) || t("noDescription")}
            </Typography.Paragraph>
            <Typography.Text type="secondary" className="text-xs">
              {t("summary", {
                members: role.memberCount,
                permissions: role.permissions.length,
              })}
            </Typography.Text>
          </Card>
        ))}
      </div>
      <RoleEditorModal
        open={editor.open}
        role={editor.role}
        onClose={() => setEditor({ open: false, role: null })}
      />
    </>
  );
}
