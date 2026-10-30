"use client";

import { Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

import type { TaskStatus } from "../types";

export interface DeleteStatusModalProps {
  status: TaskStatus | null;
  statuses: TaskStatus[];
  loading: boolean;
  onCancel: () => void;
  onConfirm: (moveToStatusId?: string) => void;
}

/** A column with tasks needs a destination for them before it can go. */
export default function DeleteStatusModal({
  status,
  statuses,
  loading,
  onCancel,
  onConfirm,
}: DeleteStatusModalProps) {
  const t = useTranslations("tasks.columns");
  const [moveTo, setMoveTo] = useState<string>();
  const hasTasks = (status?.taskCount ?? 0) > 0;

  const close = () => {
    setMoveTo(undefined);
    onCancel();
  };

  return (
    <DeleteConfirmModal
      open={status !== null}
      title={t("deleteTitle")}
      itemName={status?.name}
      warning={
        hasTasks
          ? t("deleteWarning", { count: status?.taskCount ?? 0 })
          : undefined
      }
      confirmLabel={t("delete")}
      confirmDisabled={hasTasks && !moveTo}
      loading={loading}
      onCancel={close}
      onConfirm={() => onConfirm(hasTasks ? moveTo : undefined)}
    >
      {hasTasks ? (
        <Select
          className="w-full"
          aria-label={t("moveTo")}
          placeholder={t("moveTo")}
          value={moveTo}
          onChange={setMoveTo}
          options={statuses
            .filter((item) => item.id !== status?.id)
            .map((item) => ({ value: item.id, label: item.name }))}
        />
      ) : null}
    </DeleteConfirmModal>
  );
}
