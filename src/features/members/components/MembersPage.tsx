"use client";

import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { Alert, App, Button, Input } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import { Permission } from "@/config/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import { useMembers } from "../api/get-members";
import { useRemoveMember } from "../api/member-mutations";
import type { Member } from "../types";
import InviteMemberModal from "./InviteMemberModal";
import MembersTable from "./MembersTable";
import PendingInvitations from "./PendingInvitations";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function MembersPage() {
  const t = useTranslations("members");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const members = useMembers({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });
  const removeMember = useRemoveMember();

  const toolbar = (
    <ListingToolbar
      filters={
        <Input
          allowClear
          prefix={<SearchOutlined className="text-text-tertiary" />}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="sm:max-w-xs!"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      }
      actions={
        can(Permission.MembersInvite) ? (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            className={TOOLBAR_CREATE_BUTTON_CLASS}
            onClick={() => setInviteOpen(true)}
            aria-label={t("inviteButton")}
          >
            <span className="max-sm:hidden">{t("inviteButton")}</span>
          </Button>
        ) : null
      }
    />
  );

  return (
    <>
      <ListingShell toolbar={toolbar} fillPage={false}>
        {members.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(members.error)}
            className="m-4!"
          />
        ) : (
          <MembersTable
            members={members.data?.data ?? []}
            total={members.data?.meta.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            loading={members.isFetching}
            filtered={Boolean(debouncedSearch)}
            onPageChange={setPage}
            onRemove={setRemoving}
          />
        )}
      </ListingShell>
      {can(Permission.MembersView) ? (
        <PendingInvitations canManage={can(Permission.MembersInvite)} />
      ) : null}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
      <DeleteConfirmModal
        open={removing !== null}
        title={t("removeTitle")}
        question={t("removeQuestion", { name: removing?.name ?? "" })}
        warning={t("removeWarning")}
        confirmLabel={t("remove")}
        loading={removeMember.isPending}
        onCancel={() => setRemoving(null)}
        onConfirm={() =>
          removing &&
          removeMember.mutate(removing.userId, {
            onSuccess: () => {
              message.success(t("removed", { name: removing.name }));
              setRemoving(null);
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
