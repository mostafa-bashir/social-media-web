"use client";

import {
  DeleteOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

import RowActions, { type RowAction } from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";
import { useRoleLabel } from "@/hooks/use-role-label";

import type { Role } from "../types";

export interface RoleCardProps {
  role: Role;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export default function RoleCard({
  role,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: RoleCardProps) {
  const t = useTranslations("roles");
  const roleLabel = useRoleLabel();
  const description = role.isSystem
    ? t(`system.${role.slug}.description`)
    : role.description;

  const actions: RowAction[] = role.isSystem
    ? []
    : [
        ...(canEdit
          ? [
              {
                key: "edit",
                label: t("edit"),
                icon: <EditOutlined />,
                onClick: () => onEdit(role),
              },
            ]
          : []),
        ...(canDelete
          ? [
              {
                key: "delete",
                label: t("delete"),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => onDelete(role),
              },
            ]
          : []),
      ];

  return (
    <article className="surface-panel flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-lg text-primary-text">
          <SafetyCertificateOutlined aria-hidden />
        </span>
        <RowActions
          label={t("actionsFor", { name: roleLabel(role) })}
          actions={actions}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-text-primary">
          {roleLabel(role)}
        </h3>
        {role.isSystem ? (
          <StatusBadge tone="brand">{t("builtIn")}</StatusBadge>
        ) : null}
      </div>
      <p className="min-h-10 text-sm text-text-secondary">
        {description || t("noDescription")}
      </p>
      <div className="flex flex-wrap gap-2 border-t border-border-secondary pt-3">
        <StatusBadge tone="growth">
          {t("memberCount", { count: role.memberCount })}
        </StatusBadge>
        <StatusBadge>
          {t("permissionCount", { count: role.permissions.length })}
        </StatusBadge>
      </div>
    </article>
  );
}
