"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { App, Avatar, Select, type TableProps } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import RowActions from "@/components/ui/RowActions";
import StatusBadge from "@/components/ui/StatusBadge";
import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { useRoleLabel } from "@/hooks/use-role-label";

import { useRoleOptions } from "../api/get-members";
import { useChangeMemberRole } from "../api/member-mutations";
import type { Member } from "../types";

export interface MembersTableProps {
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filtered: boolean;
  onPageChange: (page: number) => void;
  onRemove: (member: Member) => void;
}

export default function MembersTable({
  members,
  total,
  page,
  pageSize,
  loading,
  filtered,
  onPageChange,
  onRemove,
}: MembersTableProps) {
  const t = useTranslations("members");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can, userId: currentUserId } = usePermissions();
  const roleLabel = useRoleLabel();
  const roles = useRoleOptions();
  const changeRole = useChangeMemberRole();

  const roleOptions = (roles.data ?? [])
    .filter((role) => role.slug !== "owner")
    .map((role) => ({ value: role.id, label: roleLabel(role) }));
  const isManageable = (member: Member) =>
    !member.isOwner && member.userId !== currentUserId;

  const columns: TableProps<Member>["columns"] = [
    {
      title: t("columns.member"),
      key: "member",
      render: (_, member) => (
        <div className="flex items-center gap-3">
          <Avatar src={member.avatarUrl ?? undefined} className="bg-primary!">
            {member.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate font-medium text-text-primary">
              {member.name}
              {member.userId === currentUserId ? (
                <StatusBadge>{t("you")}</StatusBadge>
              ) : null}
            </div>
            <div className="truncate text-xs text-text-tertiary" dir="ltr">
              {member.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("columns.role"),
      key: "role",
      width: 220,
      render: (_, member) =>
        can(Permission.MembersUpdate) && isManageable(member) ? (
          <Select
            className="w-full"
            value={member.role.id}
            options={roleOptions}
            aria-label={t("changeRoleFor", { name: member.name })}
            onChange={(roleId) =>
              changeRole.mutate(
                { userId: member.userId, roleId },
                {
                  onSuccess: () => message.success(t("roleChanged")),
                  onError: (error) => message.error(errorMessage(error)),
                },
              )
            }
          />
        ) : (
          <StatusBadge tone={member.isOwner ? "brand" : "neutral"}>
            {roleLabel(member.role)}
          </StatusBadge>
        ),
    },
    {
      title: t("columns.joined"),
      dataIndex: "joinedAt",
      width: 140,
      responsive: ["md"],
      render: (value: string) => dayjs(value).format("YYYY-MM-DD"),
    },
    {
      key: "actions",
      width: 64,
      align: "end",
      render: (_, member) =>
        can(Permission.MembersRemove) && isManageable(member) ? (
          <RowActions
            label={t("actionsFor", { name: member.name })}
            actions={[
              {
                key: "remove",
                label: t("remove"),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => onRemove(member),
              },
            ]}
          />
        ) : null,
    },
  ];

  return (
    <ListingTable<Member>
      rowKey="userId"
      columns={columns}
      dataSource={members}
      loading={loading}
      filtered={filtered}
      emptyTitle={t("empty.title")}
      emptyFilteredTitle={t("empty.filtered")}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: false,
        hideOnSinglePage: true,
      }}
    />
  );
}
