"use client";

import { Alert, Input, Select } from "antd";
import { useTranslations } from "next-intl";

import { PLATFORM_LIMITS } from "../lib/platform-rules";
import {
  type TargetOptions,
  YOUTUBE_PRIVACY,
  type YouTubePrivacy,
} from "../types";

/** Title and visibility, shared by every YouTube channel in the post. */
export default function YouTubeOptions({
  value,
  onChange,
}: {
  value: TargetOptions;
  onChange: (options: TargetOptions) => void;
}) {
  const t = useTranslations("posts.composer.youtube");

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">
            {t("title")}
          </span>
          <Input
            value={value.title}
            maxLength={PLATFORM_LIMITS.youtube.maxTitle}
            showCount
            placeholder={t("titlePlaceholder")}
            onChange={(event) =>
              onChange({ ...value, title: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">
            {t("privacy")}
          </span>
          <Select<YouTubePrivacy>
            value={value.privacy ?? "private"}
            options={YOUTUBE_PRIVACY.map((privacy) => ({
              value: privacy,
              label: t(`privacyOptions.${privacy}`),
            }))}
            onChange={(privacy) => onChange({ ...value, privacy })}
          />
        </label>
      </div>
      <Alert type="info" showIcon title={t("privateNote")} />
    </div>
  );
}
