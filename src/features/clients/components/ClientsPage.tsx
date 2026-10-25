"use client";

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, App, Button, Input, Segmented } from "antd";
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

import { useArchiveClient, useRestoreClient } from "../api/client-mutations";
import { useClients } from "../api/get-clients";
import type { Client } from "../types";
import ClientFormModal from "./ClientFormModal";
import ClientsTable from "./ClientsTable";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function ClientsPage() {
  const t = useTranslations("clients");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can } = usePermissions();
  const canManage = can(Permission.ClientsManage);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [archiving, setArchiving] = useState<Client | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const clients = useClients({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    archived,
  });
  const archive = useArchiveClient();
  const restore = useRestoreClient();

  const openForm = (client: Client | null) => {
    setEditing(client);
    setFormOpen(true);
  };

  const toolbar = (
    <ListingToolbar
      filters={
        <>
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
          <Segmented
            value={archived ? "archived" : "active"}
            options={[
              { value: "active", label: t("filters.active") },
              { value: "archived", label: t("filters.archived") },
            ]}
            onChange={(value) => {
              setArchived(value === "archived");
              setPage(1);
            }}
          />
        </>
      }
      actions={
        canManage ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={TOOLBAR_CREATE_BUTTON_CLASS}
            onClick={() => openForm(null)}
            aria-label={t("create")}
          >
            <span className="max-sm:hidden">{t("create")}</span>
          </Button>
        ) : null
      }
    />
  );

  return (
    <>
      <ListingShell toolbar={toolbar}>
        {clients.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(clients.error)}
            className="m-4!"
          />
        ) : (
          <ClientsTable
            clients={clients.data?.data ?? []}
            total={clients.data?.meta.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            loading={clients.isFetching}
            filtered={Boolean(debouncedSearch)}
            archived={archived}
            canManage={canManage}
            onPageChange={setPage}
            onEdit={openForm}
            onArchive={setArchiving}
            onRestore={(client) =>
              restore.mutate(client.id, {
                onSuccess: () =>
                  message.success(t("restored", { name: client.name })),
                onError: (error) => message.error(errorMessage(error)),
              })
            }
          />
        )}
      </ListingShell>
      <ClientFormModal
        open={formOpen}
        client={editing}
        onClose={() => setFormOpen(false)}
      />
      <DeleteConfirmModal
        open={archiving !== null}
        title={t("archiveTitle")}
        question={t("archiveQuestion", { name: archiving?.name ?? "" })}
        warning={t("archiveWarning")}
        confirmLabel={t("archive")}
        loading={archive.isPending}
        onCancel={() => setArchiving(null)}
        onConfirm={() =>
          archiving &&
          archive.mutate(archiving.id, {
            onSuccess: () => {
              message.success(t("archived", { name: archiving.name }));
              setArchiving(null);
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
