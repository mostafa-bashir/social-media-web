"use client";

import { DeleteOutlined, PictureOutlined } from "@ant-design/icons";
import { Button, Pagination, Spin } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import ListingEmptyState from "@/components/ui/ListingEmptyState";
import MediaThumb from "@/components/ui/MediaThumb";
import type { MediaAsset } from "@/lib/media";

const THUMB_SIZE = 160;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;

export interface MediaGridProps {
  assets: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filtered: boolean;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onDelete: (asset: MediaAsset) => void;
}

export default function MediaGrid({
  assets,
  total,
  page,
  pageSize,
  loading,
  filtered,
  canManage,
  onPageChange,
  onDelete,
}: MediaGridProps) {
  const t = useTranslations("media");
  const format = useFormatter();

  const formatSize = (bytes: number) =>
    bytes < BYTES_PER_MB
      ? format.number(bytes / BYTES_PER_KB, {
          style: "unit",
          unit: "kilobyte",
          maximumFractionDigits: 0,
        })
      : format.number(bytes / BYTES_PER_MB, {
          style: "unit",
          unit: "megabyte",
          maximumFractionDigits: 1,
        });

  if (assets.length === 0) {
    return loading ? (
      <div className="flex h-40 items-center justify-center">
        <Spin />
      </div>
    ) : (
      <ListingEmptyState
        icon={<PictureOutlined />}
        title={filtered ? t("empty.filtered") : t("empty.title")}
        description={filtered ? undefined : t("empty.description")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="surface-panel flex flex-col gap-2 rounded-xl p-2"
          >
            <MediaThumb asset={asset} size={THUMB_SIZE} />
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">
                  {asset.originalFilename}
                </p>
                <p className="text-xs text-text-tertiary">
                  {formatSize(asset.sizeBytes)}
                </p>
              </div>
              {canManage ? (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={t("deleteFor", { name: asset.originalFilename })}
                  onClick={() => onDelete(asset)}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {total > pageSize ? (
        <Pagination
          className="self-center"
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger={false}
          onChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
