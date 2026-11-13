"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingTable from "@/components/ui/ListingTable";
import ListingToolbar from "@/components/ui/ListingToolbar";
import PageHeader from "@/components/ui/PageHeader";
import { useErrorMessage } from "@/hooks/use-error-message";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import { useAdminSessionQuery } from "../api/admin-session";
import { useAnnouncements, useDeleteAnnouncement } from "../api/announcements";
import { useAnnouncementColumns } from "../hooks/use-announcement-columns";
import type { AdminAnnouncement } from "../types/announcements";
import AnnouncementFormModal from "./AnnouncementFormModal";

/** Banners shown inside agency workspaces (all, or chosen ones). */
export default function AnnouncementsPage() {
  const t = useTranslations("admin.announcements");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const canEdit = useAdminSessionQuery().data?.admin.role === "super_admin";
  const announcements = useAnnouncements();
  const remove = useDeleteAnnouncement();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAnnouncement | null>(null);
  const [deleting, setDeleting] = useState<AdminAnnouncement | null>(null);
  const columns = useAnnouncementColumns({
    canEdit,
    onEdit: (row) => {
      setEditing(row);
      setFormOpen(true);
    },
    onDelete: setDeleting,
  });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ListingShell
        fillPage={false}
        toolbar={
          <ListingToolbar
            actions={
              canEdit ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className={TOOLBAR_CREATE_BUTTON_CLASS}
                  aria-label={t("create")}
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <span className="max-sm:hidden">{t("create")}</span>
                </Button>
              ) : null
            }
          />
        }
      >
        {announcements.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(announcements.error)}
            className="m-4!"
          />
        ) : (
          <ListingTable<AdminAnnouncement>
            rowKey="id"
            columns={columns}
            dataSource={announcements.data ?? []}
            loading={announcements.isFetching}
            pagination={false}
            emptyTitle={t("empty")}
          />
        )}
      </ListingShell>
      <AnnouncementFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
      />
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        itemName={deleting?.title}
        warning={t("deleteWarning")}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              message.success(t("deleted"));
              setDeleting(null);
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
