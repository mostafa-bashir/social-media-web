"use client";

import { Alert, App, Segmented } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import type { MediaAsset, MediaKind } from "@/lib/media";

import { useMedia } from "../api/get-media";
import { useDeleteMedia } from "../api/media-mutations";
import MediaGrid from "./MediaGrid";
import MediaUploadButton from "./MediaUploadButton";

const PAGE_SIZE = 24;
type KindFilter = MediaKind | "all";

export default function MediaPage() {
  const t = useTranslations("media");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can } = usePermissions();
  const canManage = can(Permission.PostsManage);
  const [page, setPage] = useState(1);
  const [clientId, setClientId] = useState<string>();
  const [kind, setKind] = useState<KindFilter>("all");
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const media = useMedia({
    page,
    pageSize: PAGE_SIZE,
    clientId,
    kind: kind === "all" ? undefined : kind,
  });
  const remove = useDeleteMedia();

  const toolbar = (
    <ListingToolbar
      filters={
        <>
          <ClientSelect
            allowClear
            className="w-full sm:w-56!"
            placeholder={t("filters.allClients")}
            aria-label={t("filters.client")}
            value={clientId}
            onChange={(value) => {
              setClientId(value);
              setPage(1);
            }}
          />
          <Segmented<KindFilter>
            value={kind}
            options={[
              { value: "all", label: t("filters.all") },
              { value: "image", label: t("filters.images") },
              { value: "video", label: t("filters.videos") },
            ]}
            onChange={(value) => {
              setKind(value);
              setPage(1);
            }}
          />
        </>
      }
      actions={canManage ? <MediaUploadButton clientId={clientId} /> : null}
    />
  );

  return (
    <>
      <ListingShell toolbar={toolbar}>
        {media.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(media.error)}
            className="m-4!"
          />
        ) : (
          <MediaGrid
            assets={media.data?.data ?? []}
            total={media.data?.meta.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            loading={media.isFetching}
            filtered={Boolean(clientId) || kind !== "all"}
            canManage={canManage}
            onPageChange={setPage}
            onDelete={setDeleting}
          />
        )}
      </ListingShell>
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        question={t("deleteQuestion", {
          name: deleting?.originalFilename ?? "",
        })}
        warning={t("deleteWarning")}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              message.success(
                t("deleted", { name: deleting.originalFilename }),
              );
              setDeleting(null);
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
