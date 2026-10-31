"use client";

import { Segmented, Switch } from "antd";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import type { SocialPlatform } from "@/config/platforms";

import { useCaptionInsert } from "../hooks/use-caption-insert";
import type { Composer } from "../hooks/use-composer";
import { FORMAT_RULES } from "../lib/platform-rules";
import CaptionField from "./CaptionField";
import CaptionToolbar from "./CaptionToolbar";

type Tab = "all" | SocialPlatform;

/**
 * One caption for every account, with an optional per-platform version
 * (e.g. a shorter Instagram caption with hashtags).
 */
export default function CaptionEditor({
  composer,
  clientId,
}: {
  composer: Composer;
  clientId: string;
}) {
  const t = useTranslations("posts.composer");
  const tPlatforms = useTranslations("common.platforms");
  const switchId = useId();
  const [chosenTab, setChosenTab] = useState<Tab>("all");
  // Stories don't show a caption, so only other formats get a tab and counter.
  const platforms = [
    ...new Set(
      composer.checks
        .filter(
          (check) => FORMAT_RULES[check.platform][check.format]?.captionUsed,
        )
        .map((check) => check.platform),
    ),
  ];
  const { caption, captionOverrides } = composer.state;
  // A deselected platform's tab falls back to the shared caption.
  const tab: Tab =
    chosenTab !== "all" && platforms.includes(chosenTab) ? chosenTab : "all";
  const override = tab === "all" ? undefined : captionOverrides[tab];
  const editing = tab === "all" || override !== undefined;
  const value = tab === "all" ? caption : (override ?? caption);
  const onChange = (next: string) =>
    tab === "all"
      ? composer.setCaption(next)
      : composer.setCaptionOverride(tab, next);
  const { textAreaRef, insert } = useCaptionInsert(value, onChange);
  const sharedPlatforms = platforms.filter(
    (platform) => captionOverrides[platform] === undefined,
  );

  return (
    <div className="flex flex-col gap-3">
      {platforms.length > 0 ? (
        <Segmented<Tab>
          aria-label={t("captionFor")}
          value={tab}
          options={[
            { value: "all", label: t("allAccounts") },
            ...platforms.map((platform) => ({
              value: platform,
              label:
                captionOverrides[platform] === undefined
                  ? tPlatforms(platform)
                  : `${tPlatforms(platform)} •`,
            })),
          ]}
          onChange={setChosenTab}
          className="self-start"
        />
      ) : null}
      {tab === "all" ? null : (
        <div className="flex items-center gap-3">
          <Switch
            id={switchId}
            checked={editing}
            onChange={(on) =>
              composer.setCaptionOverride(tab, on ? caption : undefined)
            }
          />
          <label htmlFor={switchId} className="text-sm text-text-primary">
            {t("customizeFor", { platform: tPlatforms(tab) })}
          </label>
        </div>
      )}
      {editing ? (
        <>
          <CaptionToolbar
            clientId={clientId}
            utmSource={tab === "all" ? (platforms[0] ?? "social") : tab}
            onInsert={insert}
          />
          <CaptionField
            id={`post-caption-${tab}`}
            label={
              tab === "all"
                ? t("caption")
                : t("captionForPlatform", { platform: tPlatforms(tab) })
            }
            value={value}
            platforms={tab === "all" ? sharedPlatforms : [tab]}
            textAreaRef={textAreaRef}
            onChange={onChange}
          />
        </>
      ) : (
        <p className="rounded-lg bg-background-subtle p-3 text-sm whitespace-pre-wrap text-text-secondary">
          {caption || t("sharedCaptionEmpty")}
        </p>
      )}
    </div>
  );
}
