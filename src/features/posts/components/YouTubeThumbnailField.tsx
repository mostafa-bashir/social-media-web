"use client";

import { CloseOutlined, PictureOutlined } from "@ant-design/icons";
import { App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import MediaThumb from "@/components/ui/MediaThumb";
import type { MediaAsset } from "@/lib/media";

import MediaPickerModal from "./MediaPickerModal";

/** Mirrors the API: YouTube takes JPEG or PNG thumbnails of up to 2 MB. */
const THUMBNAIL_MIME_TYPES = ["image/jpeg", "image/png"];
const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;
const THUMB_SIZE = 72;

/** A custom thumbnail from the client's library; YouTube applies it on verified channels. */
export default function YouTubeThumbnailField({
  clientId,
  mediaId,
  onChange,
}: {
  clientId: string;
  mediaId?: string;
  onChange: (mediaId: string | undefined) => void;
}) {
  const t = useTranslations("posts.composer.youtube");
  const { message } = App.useApp();
  const [picking, setPicking] = useState(false);
  // Only known when picked in this session; a saved choice shows as a label.
  const [picked, setPicked] = useState<MediaAsset | null>(null);
  const shown = picked?.id === mediaId ? picked : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text-primary">
        {t("thumbnail")}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {shown ? <MediaThumb asset={shown} size={THUMB_SIZE} /> : null}
        {mediaId && !shown ? (
          <span className="text-sm text-text-secondary">
            {t("thumbnailChosen")}
          </span>
        ) : null}
        <Button
          icon={<PictureOutlined />}
          className="rounded-full!"
          onClick={() => setPicking(true)}
        >
          {mediaId ? t("thumbnailChange") : t("thumbnailChoose")}
        </Button>
        {mediaId ? (
          <Button
            icon={<CloseOutlined />}
            className="rounded-full!"
            onClick={() => onChange(undefined)}
          >
            {t("thumbnailRemove")}
          </Button>
        ) : null}
      </div>
      <span className="text-xs text-text-tertiary">{t("thumbnailHint")}</span>
      <MediaPickerModal
        open={picking}
        clientId={clientId}
        excludeIds={[]}
        maxPicks={1}
        onClose={() => setPicking(false)}
        onPick={([asset]) => {
          if (
            !THUMBNAIL_MIME_TYPES.includes(asset.mimeType) ||
            asset.sizeBytes > MAX_THUMBNAIL_BYTES
          ) {
            message.error(t("thumbnailInvalid"));
            return;
          }
          setPicked(asset);
          onChange(asset.id);
        }}
      />
    </div>
  );
}
