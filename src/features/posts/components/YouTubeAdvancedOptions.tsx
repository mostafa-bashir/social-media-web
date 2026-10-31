"use client";

import { Radio, Select } from "antd";
import { useTranslations } from "next-intl";
import { useId } from "react";

import {
  YOUTUBE_MAX_TAGS_LENGTH,
  youtubeTagsLength,
} from "../lib/platform-rules";
import {
  DEFAULT_YOUTUBE_CATEGORY,
  type TargetOptions,
  YOUTUBE_CATEGORY_IDS,
} from "../types";
import YouTubeThumbnailField from "./YouTubeThumbnailField";

/** Tags, category, audience and thumbnail, shared by every YouTube channel in the post. */
export default function YouTubeAdvancedOptions({
  clientId,
  value,
  onChange,
}: {
  clientId: string;
  value: TargetOptions;
  onChange: (options: TargetOptions) => void;
}) {
  const t = useTranslations("posts.composer.youtube");
  const tagsId = useId();
  const categoryId = useId();
  const tags = value.tags ?? [];
  const tagsLength = youtubeTagsLength(tags);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={tagsId}
          className="text-sm font-medium text-text-primary"
        >
          {t("tags")}
        </label>
        <Select<string[]>
          id={tagsId}
          mode="tags"
          open={false}
          value={tags}
          tokenSeparators={[","]}
          placeholder={t("tagsPlaceholder")}
          onChange={(next) =>
            onChange({
              tags: next.map((tag) => tag.trim()).filter((tag) => tag),
            })
          }
        />
        <span
          dir="ltr"
          className={`self-end text-xs ${
            tagsLength > YOUTUBE_MAX_TAGS_LENGTH
              ? "text-danger-text"
              : "text-text-tertiary"
          }`}
        >
          {tagsLength} / {YOUTUBE_MAX_TAGS_LENGTH}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={categoryId}
            className="text-sm font-medium text-text-primary"
          >
            {t("category")}
          </label>
          <Select<string>
            id={categoryId}
            value={value.categoryId ?? DEFAULT_YOUTUBE_CATEGORY}
            options={YOUTUBE_CATEGORY_IDS.map((id) => ({
              value: id,
              label: t(`categories.${id}`),
            }))}
            onChange={(next) => onChange({ categoryId: next })}
          />
        </div>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-medium text-text-primary">
            {t("madeForKids")}
          </legend>
          <Radio.Group
            value={value.madeForKids ?? false}
            options={[
              { value: false, label: t("notForKids") },
              { value: true, label: t("forKids") },
            ]}
            onChange={(event) =>
              onChange({ madeForKids: event.target.value as boolean })
            }
          />
        </fieldset>
      </div>
      <YouTubeThumbnailField
        clientId={clientId}
        mediaId={value.thumbnailMediaId}
        onChange={(thumbnailMediaId) => onChange({ thumbnailMediaId })}
      />
    </div>
  );
}
