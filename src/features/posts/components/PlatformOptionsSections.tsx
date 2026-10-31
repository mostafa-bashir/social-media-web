"use client";

import { useTranslations } from "next-intl";

import type { Composer } from "../hooks/use-composer";
import type { ComposerAccount, TargetOptions } from "../types";
import ComposerSection from "./ComposerSection";
import FacebookLinkOption from "./FacebookLinkOption";
import FirstCommentField from "./FirstCommentField";
import InstagramCollaboratorsField from "./InstagramCollaboratorsField";
import InstagramReelOptions from "./InstagramReelOptions";
import RepeatField from "./RepeatField";
import YouTubeOptions from "./YouTubeOptions";

/** Settings that only some platforms and formats take, shown when one is selected. */
export default function PlatformOptionsSections({
  composer,
  clientId,
  accounts,
}: {
  composer: Composer;
  clientId: string;
  accounts: ComposerAccount[];
}) {
  const t = useTranslations("posts.composer");
  const {
    facebookFeedOptions,
    instagramPostOptions,
    instagramReelOptions,
    youtubeOptions,
  } = composer;
  const setInstagram = (options: TargetOptions) =>
    composer.setPlatformOptions("instagram", options);

  return (
    <>
      {composer.hasTargets ? (
        <ComposerSection title={t("firstComment.heading")}>
          <FirstCommentField
            composer={composer}
            clientId={clientId}
            accounts={accounts}
          />
        </ComposerSection>
      ) : null}
      {composer.hasTargets ? (
        <ComposerSection title={t("repeat.heading")}>
          <RepeatField
            value={composer.state.repeat}
            onChange={composer.setRepeat}
          />
        </ComposerSection>
      ) : null}
      {facebookFeedOptions && composer.state.media.length === 0 ? (
        <ComposerSection title={t("facebook.heading")}>
          <FacebookLinkOption
            value={facebookFeedOptions}
            onChange={(options) =>
              composer.setPlatformOptions("facebook", options)
            }
          />
        </ComposerSection>
      ) : null}
      {instagramPostOptions ? (
        <ComposerSection title={t("instagram.heading")}>
          <div className="flex flex-col gap-4">
            <InstagramCollaboratorsField
              value={instagramPostOptions}
              onChange={setInstagram}
            />
            {instagramReelOptions ? (
              <InstagramReelOptions
                value={instagramReelOptions}
                onChange={setInstagram}
              />
            ) : null}
          </div>
        </ComposerSection>
      ) : null}
      {youtubeOptions ? (
        <ComposerSection title={t("youtube.heading")}>
          <YouTubeOptions
            clientId={clientId}
            value={youtubeOptions}
            onChange={(options) =>
              composer.setPlatformOptions("youtube", options)
            }
          />
        </ComposerSection>
      ) : null}
    </>
  );
}
