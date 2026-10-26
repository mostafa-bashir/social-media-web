"use client";

import { Input } from "antd";
import { useTranslations } from "next-intl";

import type { SocialPlatform } from "@/config/platforms";

import { PLATFORM_LIMITS } from "../lib/platform-rules";

export interface CaptionFieldProps {
  value: string;
  platforms: SocialPlatform[];
  onChange: (caption: string) => void;
}

/** Caption with a character counter for each selected platform's limit. */
export default function CaptionField({
  value,
  platforms,
  onChange,
}: CaptionFieldProps) {
  const t = useTranslations("posts.composer");
  const tPlatforms = useTranslations("common.platforms");

  return (
    <div className="flex flex-col gap-2">
      <Input.TextArea
        id="post-caption"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoSize={{ minRows: 5, maxRows: 14 }}
        placeholder={t("captionPlaceholder")}
      />
      {platforms.length > 0 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" dir="ltr">
          {platforms.map((platform) => {
            const max = PLATFORM_LIMITS[platform].maxCaption;
            const over = value.length > max;
            return (
              <li
                key={platform}
                className={over ? "text-danger-text" : "text-text-tertiary"}
              >
                {tPlatforms(platform)}: {value.length.toLocaleString()} /{" "}
                {max.toLocaleString()}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
