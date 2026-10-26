"use client";

import { CalendarOutlined, SendOutlined } from "@ant-design/icons";
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
  pending: boolean;
  onSave: () => void;
  onPublishNow: () => void;
  onSchedule: () => void;
}

export default function ComposerActions({
  status,
  canSave,
  canSend,
  pending,
  onSave,
  onPublishNow,
  onSchedule,
}: ComposerActionsProps) {
  const t = useTranslations("posts.composer.actions");
  const scheduled = status === "scheduled";

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="primary"
        icon={<CalendarOutlined />}
        disabled={!canSend}
        loading={pending}
        className={PRIMARY_PILL_BUTTON_CLASS}
        onClick={onSchedule}
      >
        {scheduled ? t("reschedule") : t("schedule")}
      </Button>
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
