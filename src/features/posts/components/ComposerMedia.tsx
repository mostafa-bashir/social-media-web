"use client";

import { PlusOutlined } from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { MediaAsset } from "@/lib/media";

import { MAX_MEDIA } from "../lib/platform-rules";
import MediaPickerModal from "./MediaPickerModal";
import SortableMediaItem from "./SortableMediaItem";

const THUMB_SIZE = 120;
// A click on the handle shouldn't start a drag.
const DRAG_ACTIVATION_DISTANCE = 4;

/** The post's files in publishing order (carousel and album order). */
export default function ComposerMedia({
  clientId,
  media,
  altTexts,
  onChange,
  onAltTextChange,
}: {
  clientId?: string;
  media: MediaAsset[];
  altTexts: Record<string, string>;
  onChange: (media: MediaAsset[]) => void;
  onAltTextChange: (mediaId: string, altText: string) => void;
}) {
  const t = useTranslations("posts.composer");
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = media.findIndex((asset) => asset.id === active.id);
    const to = media.findIndex((asset) => asset.id === over.id);
    onChange(arrayMove(media, from, to));
  };

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={media.map((asset) => asset.id)}
          strategy={horizontalListSortingStrategy}
        >
          <ul className="flex flex-wrap items-start gap-3">
            {media.map((asset, position) => (
              <SortableMediaItem
                key={asset.id}
                asset={asset}
                position={position}
                size={THUMB_SIZE}
                sortable={media.length > 1}
                altText={altTexts[asset.id] ?? ""}
                onAltTextChange={(altText) =>
                  onAltTextChange(asset.id, altText)
                }
                onRemove={() =>
                  onChange(media.filter((item) => item.id !== asset.id))
                }
              />
            ))}
            <li>
              <Button
                icon={<PlusOutlined />}
                disabled={!clientId || media.length >= MAX_MEDIA}
                onClick={() => setPickerOpen(true)}
                className="h-[120px]! w-[120px]! rounded-lg! border-dashed!"
              >
                {t("addMedia")}
              </Button>
            </li>
          </ul>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-text-tertiary">
        {t("mediaHint", { max: MAX_MEDIA })}
      </p>
      {clientId ? (
        <MediaPickerModal
          open={pickerOpen}
          clientId={clientId}
          excludeIds={media.map((asset) => asset.id)}
          maxPicks={MAX_MEDIA - media.length}
          onClose={() => setPickerOpen(false)}
          onPick={(assets) => onChange([...media, ...assets])}
        />
      ) : null}
    </div>
  );
}
