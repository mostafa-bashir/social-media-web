"use client";

import {
  MailOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Permission } from "@/config/permissions";
import { usePermissions } from "@/hooks/use-permissions";

import {
  useMemberCount,
  usePendingInvitationCount,
  useRoleCount,
} from "../api/get-dashboard-stats";

/** Team KPIs — each tile only for members allowed to see the underlying data. */
export default function DashboardStats() {
  const t = useTranslations("dashboard.stats");
  const { can } = usePermissions();
  const canViewMembers = can(Permission.MembersView);
  const canViewRoles = can(Permission.RolesView);

  const members = useMemberCount(canViewMembers);
  const pending = usePendingInvitationCount(canViewMembers);
  const roles = useRoleCount(canViewRoles);

  if (!canViewMembers && !canViewRoles) {
    return null;
  }

  return (
    <div className="surface-card mb-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {canViewMembers ? (
          <StatCard
            label={t("members")}
            value={members.data ?? 0}
            loading={members.isLoading}
            icon={<TeamOutlined />}
          />
        ) : null}
        {canViewMembers ? (
          <StatCard
            label={t("invitations")}
            value={pending.data ?? 0}
            loading={pending.isLoading}
            icon={<MailOutlined />}
            footer={
              pending.data ? (
                <span>
                  <StatusBadge tone="accent">
                    {t("pendingBadge", { count: pending.data })}
                  </StatusBadge>
                </span>
              ) : null
            }
          />
        ) : null}
        {canViewRoles ? (
          <StatCard
            label={t("roles")}
            value={roles.data ?? 0}
            loading={roles.isLoading}
            icon={<SafetyCertificateOutlined />}
          />
        ) : null}
      </div>
    </div>
  );
}
