"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export interface DeleteConfirmModalProps {
  open: boolean;
  loading?: boolean;
  title: string;
  /** Name interpolated into the shared "delete …?" question. */
  itemName?: string;
  /** Replaces the shared question for non-delete actions (remove, revoke…). */
  question?: string;
  /** Extra consequence text below the question. */
  warning?: string;
  confirmLabel: string;
  /** Extra content (e.g. a "type the name to confirm" input). */
  children?: ReactNode;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** The only destructive-action confirmation in the app — no per-feature delete modals. */
export default function DeleteConfirmModal({
  open,
  loading = false,
  title,
  itemName,
  question,
  warning,
  confirmLabel,
  children,
  confirmDisabled = false,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const t = useTranslations("common.deleteConfirm");

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={null}
      footer={null}
      centered
      closable={false}
      width={440}
      destroyOnHidden
    >
      <div className="pt-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-danger-subtle text-2xl text-danger">
          <DeleteOutlined aria-hidden />
        </div>
        <h3 className="mb-1.5 text-lg font-bold text-text-primary">{title}</h3>
        <div className="mb-5 space-y-1 text-sm leading-relaxed text-text-secondary">
          {question ? (
            <p>{question}</p>
          ) : itemName ? (
            <p>{t("question", { name: itemName })}</p>
          ) : null}
          {warning ? <p>{warning}</p> : null}
        </div>
      </div>
      {children ? <div className="mb-5">{children}</div> : null}
      <div className="flex gap-3">
        <Button
          size="large"
          className="h-11! flex-1 rounded-full!"
          onClick={onCancel}
          disabled={loading}
        >
          {t("back")}
        </Button>
        <Button
          type="primary"
          danger
          size="large"
          className="h-11! flex-[2] rounded-full!"
          loading={loading}
          disabled={confirmDisabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
