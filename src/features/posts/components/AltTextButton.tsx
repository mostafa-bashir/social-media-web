"use client";

import { Button, Input, Popover } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

const MAX_ALT_TEXT = 1_000;

/** "ALT" badge on an image: describes it for people using screen readers. */
export default function AltTextButton({
  fileName,
  value,
  onChange,
}: {
  fileName: string;
  value: string;
  onChange: (altText: string) => void;
}) {
  const t = useTranslations("posts.composer.altText");
  const [open, setOpen] = useState(false);
  const filled = value.trim().length > 0;

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      title={t("title")}
      content={
        <div className="flex w-64 flex-col gap-2">
          <Input.TextArea
            autoFocus
            aria-label={t("label", { name: fileName })}
            value={value}
            maxLength={MAX_ALT_TEXT}
            showCount
            autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder={t("placeholder")}
            onChange={(event) => onChange(event.target.value)}
          />
          <p className="text-xs text-text-tertiary">{t("hint")}</p>
        </div>
      }
    >
      <Button
        size="small"
        aria-label={t(filled ? "edit" : "add", { name: fileName })}
        className={`absolute! end-1 bottom-1 h-6! rounded-full! px-2! text-xs! font-semibold ${
          filled ? "border-primary! text-primary-text!" : ""
        }`}
      >
        ALT
      </Button>
    </Popover>
  );
}
