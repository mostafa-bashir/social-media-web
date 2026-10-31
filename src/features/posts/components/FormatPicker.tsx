"use client";

import { Segmented } from "antd";
import { useTranslations } from "next-intl";

import type { SocialPlatform } from "@/config/platforms";

import { formatLabel } from "../lib/format-label";
import { platformFormats } from "../lib/platform-rules";
import type { TargetFormat } from "../types";

/** How one account publishes the post: feed post, reel, story, short… */
export default function FormatPicker({
  platform,
  accountName,
  value,
  mediaCount,
  onChange,
}: {
  platform: SocialPlatform;
  accountName: string;
  value: TargetFormat;
  mediaCount: number;
  onChange: (format: TargetFormat) => void;
}) {
  const t = useTranslations("posts.composer");
  const tFormats = useTranslations("common.platformFormats");

  return (
    <Segmented<TargetFormat>
      size="small"
      block
      aria-label={t("formatFor", { name: accountName })}
      value={value}
      options={platformFormats(platform).map((format) => ({
        value: format,
        label: tFormats(formatLabel(platform, format, mediaCount)),
      }))}
      onChange={onChange}
    />
  );
}
