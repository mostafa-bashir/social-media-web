"use client";

import { Alert, Collapse, Input, Select } from "antd";
import { useTranslations } from "next-intl";

import { YOUTUBE_MAX_TITLE } from "../lib/platform-rules";
import {
  type TargetOptions,
  YOUTUBE_PRIVACY,
  type YouTubePrivacy,
} from "../types";
import YouTubeAdvancedOptions from "./YouTubeAdvancedOptions";

/** Title and visibility, shared by every YouTube channel in the post. */
export default function YouTubeOptions({
  clientId,
  value,
  onChange,
}: {
  clientId: string;
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
            maxLength={YOUTUBE_MAX_TITLE}
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
      <Collapse
        size="small"
        items={[
          {
            key: "more",
            label: t("more"),
            children: (
              <YouTubeAdvancedOptions
                clientId={clientId}
                value={value}
                onChange={onChange}
              />
            ),
          },
        ]}
      />
      <Alert type="info" showIcon title={t("privateNote")} />
    </div>
  );
}
