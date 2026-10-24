"use client";

import { UserAddOutlined } from "@ant-design/icons";
import {
  Alert,
  App,
  Avatar,
  Button,
  Input,
  Popconfirm,
  Select,
  Table,
  type TableProps,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useRoleLabel, useRoles } from "@/features/roles";
import { Permission, usePermissions } from "@/features/workspaces";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  type Member,
  useChangeMemberRole,
  useMembers,
  useRemoveMember,
} from "../api/members-api";

import { InviteMemberModal } from "./InviteMemberModal";
import { PendingInvitations } from "./PendingInvitations";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function MembersManager() {
  const t = useTranslations("members");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const currentUserId = useSession().data?.user.id;
  const { can } = usePermissions();
  const roleLabel = useRoleLabel();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const members = useMembers({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });
  const roles = useRoles();
  const changeRole = useChangeMemberRole();
  const removeMember = useRemoveMember();

  const assignableRoles = (roles.data ?? [])
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
          <Avatar src={member.avatarUrl ?? undefined}>
            {member.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium">
              {member.name}
              {member.userId === currentUserId ? (
                <Tag className="!ms-2">{t("you")}</Tag>
              ) : null}
            </div>
            <div className="truncate text-xs text-app-muted" dir="ltr">
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
            options={assignableRoles}
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
          <Tag color={member.isOwner ? "gold" : undefined}>
            {roleLabel(member.role)}
          </Tag>
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
      width: 110,
      render: (_, member) =>
        can(Permission.MembersRemove) && isManageable(member) ? (
          <Popconfirm
            title={t("removeConfirm", { name: member.name })}
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              removeMember.mutateAsync(member.userId).catch((error) => {
                message.error(errorMessage(error));
              })
            }
          >
            <Button type="link" danger>
              {t("remove")}
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input.Search
          allowClear
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="sm:max-w-xs"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        {can(Permission.MembersInvite) ? (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setInviteOpen(true)}
          >
            {t("inviteButton")}
          </Button>
        ) : null}
      </div>
      {members.error ? (
        <Alert type="error" showIcon title={errorMessage(members.error)} />
      ) : (
        <Table<Member>
          rowKey="userId"
          columns={columns}
          dataSource={members.data?.data}
          loading={members.isFetching}
          scroll={{ x: true }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: members.data?.meta.total ?? 0,
            onChange: setPage,
            showSizeChanger: false,
            hideOnSinglePage: true,
          }}
        />
      )}
      {can(Permission.MembersView) ? (
        <PendingInvitations canManage={can(Permission.MembersInvite)} />
      ) : null}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  );
}
