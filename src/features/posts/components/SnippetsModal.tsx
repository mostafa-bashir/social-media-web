"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Modal, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import RowActions from "@/components/ui/RowActions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import {
  useCaptionSnippets,
  useDeleteSnippet,
  useSaveSnippet,
} from "../api/caption-snippets";
import type { CaptionSnippet } from "../types";
import SnippetForm from "./SnippetForm";

/** `null` editing: the list; `"new"` or a snippet: the form. */
type Editing = null | "new" | CaptionSnippet;

export default function SnippetsModal({
  open,
  clientId,
  onClose,
}: {
  open: boolean;
  clientId: string;
  onClose: () => void;
}) {
  const t = useTranslations("posts.composer.snippets");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const snippets = useCaptionSnippets(open ? clientId : undefined);
  const save = useSaveSnippet();
  const remove = useDeleteSnippet();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<CaptionSnippet | null>(null);

  return (
    <Modal
      open={open}
      title={t("manageTitle")}
      footer={null}
      width={560}
      destroyOnHidden
      onCancel={() => {
        setEditing(null);
        onClose();
      }}
    >
      <div className="surface-card-form">
        <div className="surface-panel flex flex-col gap-4">
          {editing ? (
            <SnippetForm
              clientId={clientId}
              snippet={editing === "new" ? undefined : editing}
              saving={save.isPending}
              onCancel={() => setEditing(null)}
              onSave={(input) =>
                save.mutate(
                  {
                    snippetId: editing === "new" ? undefined : editing.id,
                    input,
                  },
                  {
                    onSuccess: () => {
                      message.success(t("saved"));
                      setEditing(null);
                    },
                    onError: (error) => message.error(errorMessage(error)),
                  },
                )
              }
            />
          ) : (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className={`${TOOLBAR_CREATE_BUTTON_CLASS} self-start`}
                onClick={() => setEditing("new")}
              >
                {t("create")}
              </Button>
              {snippets.isLoading ? (
                <Spin className="self-center" />
              ) : (snippets.data ?? []).length === 0 ? (
                <p className="text-sm text-text-secondary">{t("empty")}</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border-default">
                  {(snippets.data ?? []).map((snippet) => (
                    <li
                      key={snippet.id}
                      className="flex items-start gap-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary">
                          {snippet.name}
                          <span className="ms-2 inline-block text-xs font-normal text-text-tertiary">
                            {t(`kinds.${snippet.kind}`)} ·{" "}
                            {snippet.clientId
                              ? t("scopeClient")
                              : t("scopeWorkspace")}
                          </span>
                        </p>
                        <p className="line-clamp-2 text-sm text-text-secondary">
                          {snippet.body}
                        </p>
                      </div>
                      <RowActions
                        label={t("actionsFor", { name: snippet.name })}
                        actions={[
                          {
                            key: "edit",
                            label: t("edit"),
                            icon: <EditOutlined />,
                            onClick: () => setEditing(snippet),
                          },
                          {
                            key: "delete",
                            label: t("delete"),
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => setDeleting(snippet),
                          },
                        ]}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
      <DeleteConfirmModal
        open={deleting !== null}
        loading={remove.isPending}
        title={t("deleteTitle")}
        itemName={deleting?.name}
        confirmLabel={t("delete")}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </Modal>
  );
}
