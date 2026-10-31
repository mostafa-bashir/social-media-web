"use client";

import { UploadOutlined } from "@ant-design/icons";
import { App, Button, Modal, Pagination, Spin, Upload } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";
import {
  IMAGE_MIME_TYPES,
  type MediaAsset,
  uploadProblem,
  VIDEO_MIME_TYPES,
} from "@/lib/media";

import { PICKER_PAGE_SIZE, useClientMedia } from "../api/get-posts";
import { useUploadPostMedia } from "../api/post-mutations";
import PickableMedia from "./PickableMedia";

const ACCEPT = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES].join(",");

export interface MediaPickerModalProps {
  open: boolean;
  clientId: string;
  /** Files already in the post; they can't be picked twice. */
  excludeIds: string[];
  maxPicks: number;
  onClose: () => void;
  onPick: (assets: MediaAsset[]) => void;
}

/** Pick one or more files, in click order; a fresh upload is picked too. */
export default function MediaPickerModal({
  open,
  clientId,
  excludeIds,
  maxPicks,
  onClose,
  onPick,
}: MediaPickerModalProps) {
  const t = useTranslations("posts.composer.picker");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<MediaAsset[]>([]);
  const media = useClientMedia(open ? clientId : undefined, page);
  const upload = useUploadPostMedia();
  const assets = (media.data?.data ?? []).filter(
    (asset) => !excludeIds.includes(asset.id),
  );
  const full = picked.length >= maxPicks;

  const toggle = (asset: MediaAsset) =>
    setPicked((current) => {
      if (current.some((item) => item.id === asset.id)) {
        return current.filter((item) => item.id !== asset.id);
      }
      return current.length >= maxPicks ? current : [...current, asset];
    });

  const close = () => {
    setPicked([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t("title")}
      width={720}
      destroyOnHidden
      onCancel={close}
      footer={
        <Button
          type="primary"
          className={PRIMARY_PILL_BUTTON_CLASS}
          disabled={picked.length === 0}
          onClick={() => {
            onPick(picked);
            close();
          }}
        >
          {t("addPicked", { count: picked.length })}
        </Button>
      }
    >
      <div className="surface-card-form">
        <div className="surface-panel flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Upload
              accept={ACCEPT}
              showUploadList={false}
              disabled={full}
              beforeUpload={(file) => {
                const problem = uploadProblem(file);
                if (problem) {
                  message.error(t(`problems.${problem}`, { name: file.name }));
                  return Upload.LIST_IGNORE;
                }
                upload.mutate(
                  { clientId, file },
                  {
                    onSuccess: toggle,
                    onError: (error) => message.error(errorMessage(error)),
                  },
                );
                return false;
              }}
            >
              <Button
                icon={<UploadOutlined />}
                loading={upload.isPending}
                disabled={full}
              >
                {t("upload")}
              </Button>
            </Upload>
            <span className="text-sm text-text-secondary" aria-live="polite">
              {t("pickedCount", { count: picked.length, max: maxPicks })}
            </span>
          </div>
          {media.isLoading ? (
            <Spin className="self-center" />
          ) : assets.length === 0 ? (
            <p className="text-sm text-text-secondary">{t("empty")}</p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">
              {assets.map((asset) => {
                const order = picked.findIndex((item) => item.id === asset.id);
                return (
                  <PickableMedia
                    key={asset.id}
                    asset={asset}
                    order={order >= 0 ? order + 1 : null}
                    disabled={full && order < 0}
                    onToggle={() => toggle(asset)}
                  />
                );
              })}
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
