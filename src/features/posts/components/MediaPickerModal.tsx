"use client";

import { CheckCircleFilled, UploadOutlined } from "@ant-design/icons";
import { App, Button, Modal, Pagination, Spin, Upload } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import MediaThumb from "@/components/ui/MediaThumb";
import { useErrorMessage } from "@/hooks/use-error-message";
import {
  IMAGE_MIME_TYPES,
  type MediaAsset,
  uploadProblem,
  VIDEO_MIME_TYPES,
} from "@/lib/media";

import { PICKER_PAGE_SIZE, useClientMedia } from "../api/get-posts";
import { useUploadPostMedia } from "../api/post-mutations";

const ACCEPT = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES].join(",");
const THUMB_SIZE = 112;

export interface MediaPickerModalProps {
  open: boolean;
  clientId: string;
  onClose: () => void;
  onPick: (asset: MediaAsset) => void;
}

/** One file per post in v1: picking replaces the current one. */
export default function MediaPickerModal({
  open,
  clientId,
  onClose,
  onPick,
}: MediaPickerModalProps) {
  const t = useTranslations("posts.composer.picker");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const media = useClientMedia(open ? clientId : undefined, page);
  const upload = useUploadPostMedia();
  const assets = media.data?.data ?? [];

  const pick = (asset: MediaAsset) => {
    onPick(asset);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      footer={null}
      width={720}
      destroyOnHidden
      onCancel={onClose}
    >
      <div className="surface-card-form">
        <div className="surface-panel flex flex-col gap-4">
          <Upload
            accept={ACCEPT}
            showUploadList={false}
            beforeUpload={(file) => {
              const problem = uploadProblem(file);
              if (problem) {
                message.error(t(`problems.${problem}`, { name: file.name }));
                return Upload.LIST_IGNORE;
              }
              upload.mutate(
                { clientId, file },
                {
                  onSuccess: pick,
                  onError: (error) => message.error(errorMessage(error)),
                },
              );
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} loading={upload.isPending}>
              {t("upload")}
            </Button>
          </Upload>
          {media.isLoading ? (
            <Spin className="self-center" />
          ) : assets.length === 0 ? (
            <p className="text-sm text-text-secondary">{t("empty")}</p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">
              {assets.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => pick(asset)}
                    aria-label={t("pick", { name: asset.originalFilename })}
                    className="group relative block rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <MediaThumb asset={asset} size={THUMB_SIZE} />
                    <CheckCircleFilled className="absolute end-2 top-2 text-xl text-primary opacity-0 group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {(media.data?.meta.total ?? 0) > PICKER_PAGE_SIZE ? (
            <Pagination
              className="self-center"
              size="small"
              current={page}
              pageSize={PICKER_PAGE_SIZE}
              total={media.data?.meta.total}
              onChange={setPage}
            />
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
