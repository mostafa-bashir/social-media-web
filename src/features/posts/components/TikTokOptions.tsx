"use client";

import { Alert, Select, Switch } from "antd";
import { useTranslations } from "next-intl";

import {
  TIKTOK_PRIVACY,
  type TargetOptions,
  type TikTokPrivacy,
} from "../types";

type ToggleField =
  | "allowComment"
  | "allowDuet"
  | "allowStitch"
  | "brandOrganic"
  | "brandedContent"
  | "aiGenerated";

const INTERACTION_FIELDS: ToggleField[] = [
  "allowComment",
  "allowDuet",
  "allowStitch",
];
const DISCLOSURE_FIELDS: ToggleField[] = [
  "brandOrganic",
  "brandedContent",
  "aiGenerated",
];

/** Visibility, interactions and disclosures, shared by every TikTok account in the post. */
export default function TikTokOptions({
  value,
  onChange,
}: {
  value: TargetOptions;
  onChange: (options: TargetOptions) => void;
}) {
  const t = useTranslations("posts.composer.tiktok");
  const privacy = value.tiktokPrivacy ?? "private";

  const toggles = (heading: string, fields: ToggleField[]) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text-primary">{heading}</span>
      {fields.map((field) => (
        <label key={field} className="flex items-center gap-2 text-sm">
          <Switch
            size="small"
            checked={value[field] ?? false}
            onChange={(checked) => onChange({ ...value, [field]: checked })}
          />
          <span className="text-text-secondary">{t(`fields.${field}`)}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 sm:max-w-60">
        <span className="text-sm font-medium text-text-primary">
          {t("privacy")}
        </span>
        <Select<TikTokPrivacy>
          value={privacy}
          options={TIKTOK_PRIVACY.map((option) => ({
            value: option,
            label: t(`privacyOptions.${option}`),
          }))}
          onChange={(tiktokPrivacy) => onChange({ ...value, tiktokPrivacy })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        {toggles(t("interactions"), INTERACTION_FIELDS)}
        {toggles(t("disclosures"), DISCLOSURE_FIELDS)}
      </div>
      {value.brandedContent && privacy === "private" ? (
        <Alert type="warning" showIcon title={t("brandedPrivateNote")} />
      ) : null}
      <Alert type="info" showIcon title={t("privateNote")} />
    </div>
  );
}
