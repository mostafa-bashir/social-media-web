"use client";

import { InputNumber, Switch } from "antd";
import { useTranslations } from "next-intl";
import { useId } from "react";

import type { TargetOptions } from "../types";

const MS_PER_SECOND = 1_000;
// The longest Instagram reel.
const MAX_COVER_SECONDS = 15 * 60;

/** Grid sharing and cover frame, shared by every Instagram reel in the post. */
export default function InstagramReelOptions({
  value,
  onChange,
}: {
  value: TargetOptions;
  onChange: (options: TargetOptions) => void;
}) {
  const t = useTranslations("posts.composer.instagram");
  const shareId = useId();
  const coverId = useId();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <div className="flex items-center gap-3">
        <Switch
          id={shareId}
          checked={value.shareToFeed ?? true}
          onChange={(shareToFeed) => onChange({ shareToFeed })}
        />
        <label htmlFor={shareId} className="text-sm text-text-primary">
          {t("shareToFeed")}
        </label>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={coverId}
          className="text-sm font-medium text-text-primary"
        >
          {t("cover")}
        </label>
        <InputNumber
          id={coverId}
          min={0}
          max={MAX_COVER_SECONDS}
          step={0.5}
          className="w-40!"
          suffix={t("seconds")}
          value={
            value.thumbOffsetMs === undefined
              ? null
              : value.thumbOffsetMs / MS_PER_SECOND
          }
          onChange={(seconds) =>
            onChange({
              thumbOffsetMs:
                seconds === null
                  ? undefined
                  : Math.round(seconds * MS_PER_SECOND),
            })
          }
        />
      </div>
    </div>
  );
}
