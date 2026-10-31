"use client";

import { Input, Modal } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { buildUtmLink, type UtmForm, utmFormSchema } from "../lib/utm-link";

const DEFAULT_MEDIUM = "social";

/** Builds a tracked link so analytics tools can tell which post sent the visit. */
export default function UtmLinkModal({
  open,
  defaultSource,
  onClose,
  onInsert,
}: {
  open: boolean;
  /** The platform being written for, e.g. "instagram". */
  defaultSource: string;
  onClose: () => void;
  onInsert: (link: string) => void;
}) {
  const t = useTranslations("posts.composer.utm");
  const [form, setForm] = useState<UtmForm>({
    url: "",
    source: defaultSource,
    medium: DEFAULT_MEDIUM,
    campaign: "",
  });
  const parsed = utmFormSchema.safeParse(form);
  const link = parsed.success ? buildUtmLink(parsed.data) : null;
  const field = (key: keyof UtmForm, label: string, placeholder?: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <Input
        dir="ltr"
        value={form[key]}
        placeholder={placeholder}
        status={
          key === "url" && form.url && !parsed.success ? "error" : undefined
        }
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
      />
    </label>
  );

  return (
    <Modal
      open={open}
      title={t("title")}
      destroyOnHidden
      okText={t("insert")}
      okButtonProps={{ disabled: !link, className: PRIMARY_PILL_BUTTON_CLASS }}
      cancelButtonProps={{ className: "rounded-full!" }}
      onCancel={onClose}
      onOk={() => {
        if (!link) return;
        onInsert(link);
        onClose();
      }}
    >
      <div className="surface-card-form">
        <div className="surface-panel flex flex-col gap-3">
          {field("url", t("url"), "https://")}
          <div className="grid gap-3 sm:grid-cols-3">
            {field("source", t("source"))}
            {field("medium", t("medium"))}
            {field("campaign", t("campaign"), t("campaignPlaceholder"))}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">
              {t("result")}
            </span>
            <p
              dir="ltr"
              aria-live="polite"
              className="rounded-lg bg-background-subtle p-2 text-sm break-all text-text-secondary"
            >
              {link ?? t("resultEmpty")}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
