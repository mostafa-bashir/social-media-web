"use client";

import { LinkOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";

import type { PostTarget } from "../types";
import TargetStatusBadge from "./TargetStatusBadge";

export interface PostTargetRowProps {
  target: PostTarget;
  canRetry: boolean;
  retrying: boolean;
  onRetry: () => void;
}

export default function PostTargetRow({
  target,
  canRetry,
  retrying,
  onRetry,
}: PostTargetRowProps) {
  const t = useTranslations("posts.detail");
  const privateOnYouTube =
    target.platform === "youtube" && target.status === "published";

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border-default p-3">
      <div className="flex items-center gap-3">
        <span className="text-lg text-text-secondary" aria-hidden>
          {PLATFORM_ICONS[target.platform]}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-text-primary">
          {target.accountName}
          {target.socialAccountId ? null : (
            <span className="ms-2 text-xs text-text-tertiary">
              {t("disconnected")}
            </span>
          )}
        </span>
        <TargetStatusBadge status={target.status} />
      </div>
      {target.lastError ? (
        <p className="text-sm text-danger-text">{target.lastError}</p>
      ) : null}
      {privateOnYouTube ? (
        <p className="text-xs text-text-tertiary">{t("youtubePrivate")}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {target.externalUrl ? (
          <a
            href={target.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary-text hover:underline"
          >
            <LinkOutlined aria-hidden /> {t("viewOnPlatform")}
          </a>
        ) : null}
        {canRetry && target.status === "failed" && target.socialAccountId ? (
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={retrying}
            className="rounded-full!"
            onClick={onRetry}
          >
            {t("retry")}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
