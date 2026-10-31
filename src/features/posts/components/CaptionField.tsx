"use client";

import { Input } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";

import type { SocialPlatform } from "@/config/platforms";

import {
  captionLimit,
  countHashtags,
  INSTAGRAM_MAX_HASHTAGS,
} from "../lib/platform-rules";

export interface CaptionFieldProps {
  id: string;
  label: string;
  value: string;
  /** Platforms this text goes to; each gets a character counter. */
  platforms: SocialPlatform[];
  textAreaRef: RefObject<TextAreaRef | null>;
  onChange: (caption: string) => void;
}

/** A caption box with counters for each platform it goes to. */
export default function CaptionField({
  id,
  label,
  value,
  platforms,
  textAreaRef,
  onChange,
}: CaptionFieldProps) {
  const t = useTranslations("posts.composer");
  const tPlatforms = useTranslations("common.platforms");
  const hashtags = countHashtags(value);

  return (
    <div className="flex flex-col gap-2">
      <Input.TextArea
        id={id}
        ref={textAreaRef}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoSize={{ minRows: 5, maxRows: 14 }}
        placeholder={t("captionPlaceholder")}
      />
      {platforms.length > 0 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" dir="ltr">
          {platforms.map((platform) => {
            const max = captionLimit(platform);
            return (
              <li
                key={platform}
                className={
                  value.length > max ? "text-danger-text" : "text-text-tertiary"
                }
              >
                {tPlatforms(platform)}: {value.length.toLocaleString()} /{" "}
                {max.toLocaleString()}
              </li>
            );
          })}
          {platforms.includes("instagram") ? (
            <li
              className={
                hashtags > INSTAGRAM_MAX_HASHTAGS
                  ? "text-danger-text"
                  : "text-text-tertiary"
              }
            >
              {t("hashtagCount", {
                count: hashtags,
                max: INSTAGRAM_MAX_HASHTAGS,
              })}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
