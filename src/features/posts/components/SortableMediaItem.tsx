"use client";

import { CloseOutlined, HolderOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "antd";
import { useTranslations } from "next-intl";

import MediaThumb from "@/components/ui/MediaThumb";
import type { MediaAsset } from "@/lib/media";

import { mediaShapeLabel } from "../lib/media-shape";
import AltTextButton from "./AltTextButton";

export interface SortableMediaItemProps {
  asset: MediaAsset;
  position: number;
  size: number;
  sortable: boolean;
  altText: string;
  onAltTextChange: (altText: string) => void;
  onRemove: () => void;
}

/** One file of the post: drag (or Space + arrows) the handle to reorder. */
export default function SortableMediaItem({
  asset,
  position,
  size,
  sortable,
  altText,
  onAltTextChange,
  onRemove,
}: SortableMediaItemProps) {
  const t = useTranslations("posts.composer");
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id, disabled: !sortable });
  const shape = mediaShapeLabel(asset);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${isDragging ? "z-10 opacity-60" : ""}`}
    >
      <MediaThumb asset={asset} size={size} />
      {sortable ? (
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={t("moveMedia", {
            name: asset.originalFilename,
            position: position + 1,
          })}
          className="absolute start-1 top-1 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-surface text-text-secondary shadow-sm focus-visible:outline-2 focus-visible:outline-primary"
        >
          <HolderOutlined aria-hidden />
        </button>
      ) : null}
      <Button
        size="small"
        shape="circle"
        icon={<CloseOutlined />}
        aria-label={t("removeMedia", { name: asset.originalFilename })}
        className="absolute! end-1 top-1"
        onClick={onRemove}
      />
      {shape ? (
        <span
          dir="ltr"
          className="absolute bottom-1 start-1 rounded bg-surface/90 px-1.5 text-xs text-text-secondary"
        >
          {shape}
        </span>
      ) : null}
      {asset.kind === "image" ? (
        <AltTextButton
          fileName={asset.originalFilename}
          value={altText}
          onChange={onAltTextChange}
        />
      ) : null}
    </li>
  );
}
