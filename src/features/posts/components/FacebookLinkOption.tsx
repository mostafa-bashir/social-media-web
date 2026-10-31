"use client";

import { Input } from "antd";
import { useTranslations } from "next-intl";

import type { TargetOptions } from "../types";

/** Optional link for Facebook feed posts; Facebook shows it as a preview card. */
export default function FacebookLinkOption({
  value,
  onChange,
}: {
  value: TargetOptions;
  onChange: (options: TargetOptions) => void;
}) {
  const t = useTranslations("posts.composer.facebook");

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{t("link")}</span>
      <Input
        type="url"
        inputMode="url"
        dir="ltr"
        value={value.link ?? ""}
        placeholder="https://"
        onChange={(event) => onChange({ link: event.target.value })}
      />
      <span className="text-xs text-text-tertiary">{t("linkHint")}</span>
    </label>
  );
}
