"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import { useRoles } from "../api/get-roles";
import { useDeleteRole } from "../api/role-mutations";
import type { Role } from "../types";
import RoleCard from "./RoleCard";
import RoleFormModal from "./RoleFormModal";

export default function RolesPage() {
  const t = useTranslations("roles");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can } = usePermissions();
  const roles = useRoles();
  const deleteRole = useDeleteRole();
  const [editor, setEditor] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  });
  const [deleting, setDeleting] = useState<Role | null>(null);

  const toolbar = (
    <ListingToolbar
      filters={
        <span className="text-sm text-text-secondary">{t("toolbarHint")}</span>
      }
      actions={
        can(Permission.RolesCreate) ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={TOOLBAR_CREATE_BUTTON_CLASS}
            aria-label={t("create")}
            onClick={() => setEditor({ open: true, role: null })}
          >
            <span className="max-sm:hidden">{t("create")}</span>
          </Button>
        ) : null
      }
    />
  );

  return (
    <>
      <ListingShell toolbar={toolbar} contentLayout="grid" fillPage={false}>
        {roles.isLoading ? (
          <div className="surface-panel">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : roles.error ? (
          <Alert type="error" showIcon title={errorMessage(roles.error)} />
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {roles.data?.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                canEdit={can(Permission.RolesUpdate)}
                canDelete={can(Permission.RolesDelete)}
                onEdit={(selected) => setEditor({ open: true, role: selected })}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </ListingShell>
      <RoleFormModal
        open={editor.open}
        role={editor.role}
        onClose={() => setEditor({ open: false, role: null })}
      />
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        itemName={deleting?.name}
        warning={t("deleteWarning")}
        confirmLabel={t("delete")}
        loading={deleteRole.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          deleteRole.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
