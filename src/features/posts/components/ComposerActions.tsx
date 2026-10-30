"use client";

import {
  AuditOutlined,
  CalendarOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { useTranslations } from "next-intl";

import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import type { PostStatus } from "../types";

const SECONDARY_PILL_CLASS = "h-11! rounded-full! px-6!";

export interface ComposerActionsProps {
  /** Undefined for a post that hasn't been saved yet. */
  status?: PostStatus;
  canSave: boolean;
  canSend: boolean;
  /** The client needs approval and this user can't approve: submit instead of send. */
  reviewMode: boolean;
  pending: boolean;
  onSave: () => void;
  onPublishNow: () => void;
  /** Opens the time picker: schedule, or (review mode) request that time. */
  onSchedule: () => void;
  /** Review mode only: submit to be published as soon as it's approved. */
  onSubmitForApproval: () => void;
}

export default function ComposerActions({
  status,
  canSave,
  canSend,
  reviewMode,
  pending,
  onSave,
  onPublishNow,
  onSchedule,
  onSubmitForApproval,
}: ComposerActionsProps) {
  const t = useTranslations("posts.composer.actions");
  const scheduled = status === "scheduled";

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="primary"
        icon={reviewMode ? <AuditOutlined /> : <CalendarOutlined />}
        disabled={!canSend}
        loading={pending}
        className={PRIMARY_PILL_BUTTON_CLASS}
        onClick={onSchedule}
      >
        {reviewMode
          ? t("submitWithTime")
          : scheduled
            ? t("reschedule")
            : t("schedule")}
      </Button>
      {reviewMode ? (
        <Button
          icon={<SendOutlined />}
          disabled={!canSend}
          loading={pending}
          className={SECONDARY_PILL_CLASS}
          onClick={onSubmitForApproval}
        >
          {t("submitPublishOnApproval")}
        </Button>
      ) : (
        <Popconfirm
          title={t("publishNowConfirm")}
          okText={t("publishNow")}
          disabled={!canSend}
          onConfirm={onPublishNow}
        >
          <Button
            icon={<SendOutlined />}
            disabled={!canSend}
            loading={pending}
            className={SECONDARY_PILL_CLASS}
          >
            {t("publishNow")}
          </Button>
        </Popconfirm>
      )}
      <Button
        type="text"
        disabled={!canSave}
        loading={pending}
        className={SECONDARY_PILL_CLASS}
        onClick={onSave}
      >
        {scheduled ? t("saveChanges") : t("saveDraft")}
      </Button>
    </div>
  );
}
