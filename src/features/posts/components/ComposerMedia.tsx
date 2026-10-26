"use client";

import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import MediaThumb from "@/components/ui/MediaThumb";
import type { MediaAsset } from "@/lib/media";

import MediaPickerModal from "./MediaPickerModal";

const THUMB_SIZE = 120;

export default function ComposerMedia({
  clientId,
  media,
  onChange,
}: {
  clientId?: string;
  media: MediaAsset[];
  onChange: (media: MediaAsset[]) => void;
}) {
  const t = useTranslations("posts.composer");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-start gap-3">
      {media.map((asset) => (
        <div key={asset.id} className="relative">
          <MediaThumb asset={asset} size={THUMB_SIZE} />
          <Button
            size="small"
            shape="circle"
            icon={<CloseOutlined />}
            aria-label={t("removeMedia", { name: asset.originalFilename })}
            className="absolute! end-1 top-1"
            onClick={() =>
              onChange(media.filter((item) => item.id !== asset.id))
            }
          />
        </div>
      ))}
      <Button
        icon={<PlusOutlined />}
        disabled={!clientId}
        onClick={() => setPickerOpen(true)}
        className="h-[120px]! w-[120px]! rounded-lg! border-dashed!"
      >
        {media.length > 0 ? t("replaceMedia") : t("addMedia")}
      </Button>
      {clientId ? (
        <MediaPickerModal
          open={pickerOpen}
          clientId={clientId}
          onClose={() => setPickerOpen(false)}
          onPick={(asset) => onChange([asset])}
        />
      ) : null}
    </div>
  );
}
