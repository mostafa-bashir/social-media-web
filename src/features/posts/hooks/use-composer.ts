"use client";

import { useMemo, useState } from "react";

import type { SocialPlatform } from "@/config/platforms";
import type { MediaAsset } from "@/lib/media";

import {
  checkPlatformRules,
  defaultFormat,
  type PlatformIssue,
  type PlatformWarning,
  platformWarnings,
} from "../lib/platform-rules";
import {
  type ComposerAccount,
  DEFAULT_YOUTUBE_CATEGORY,
  type Post,
  type PostInput,
  type RepeatRule,
  type TargetFormat,
  type TargetOptions,
} from "../types";

interface SelectedTarget {
  platform: SocialPlatform;
  accountName: string;
  format: TargetFormat;
  options: TargetOptions;
}

export interface ComposerState {
  clientId?: string;
  caption: string;
  /** Posted under each published target by a follow-up job. */
  firstComment: string;
  /** A platform's own caption, used by all its accounts instead of `caption`. */
  captionOverrides: Partial<Record<SocialPlatform, string>>;
  media: MediaAsset[];
  /** Media id → alt text. */
  altTexts: Record<string, string>;
  /** Null: doesn't repeat. */
  repeat: RepeatRule | null;
  targets: Record<string, SelectedTarget>;
}

export interface TargetCheck {
  accountId: string;
  platform: SocialPlatform;
  accountName: string;
  format: TargetFormat;
  issues: PlatformIssue[];
  warnings: PlatformWarning[];
}

const NEW_TARGET_OPTIONS: Record<SocialPlatform, TargetOptions> = {
  facebook: {},
  instagram: { shareToFeed: true },
  youtube: {
    title: "",
    privacy: "private",
    tags: [],
    categoryId: DEFAULT_YOUTUBE_CATEGORY,
    madeForKids: false,
  },
};

function initialState(post?: Post, clientId?: string): ComposerState {
  if (!post) {
    return {
      clientId,
      caption: "",
      firstComment: "",
      captionOverrides: {},
      media: [],
      altTexts: {},
      repeat: null,
      targets: {},
    };
  }
  return {
    clientId: post.clientId,
    caption: post.caption,
    firstComment: post.firstComment ?? "",
    captionOverrides: Object.fromEntries(
      post.targets
        .filter((target) => target.caption !== null)
        .map((target) => [target.platform, target.caption as string]),
    ),
    media: post.media,
    repeat:
      post.repeat && !post.repeat.stopped
        ? {
            frequency: post.repeat.frequency,
            interval: post.repeat.interval,
            ...(post.repeat.endsAfter
              ? { endsAfter: post.repeat.endsAfter }
              : {}),
            ...(post.repeat.until ? { until: post.repeat.until } : {}),
          }
        : null,
    altTexts: Object.fromEntries(
      post.media
        .filter((asset) => asset.altText)
        .map((asset) => [asset.id, asset.altText as string]),
    ),
    targets: Object.fromEntries(
      post.targets
        .filter((target) => target.socialAccountId)
        .map((target) => [
          target.socialAccountId as string,
          {
            platform: target.platform,
            accountName: target.accountName,
            format: target.format,
            options: target.options,
          },
        ]),
    ),
  };
}

/** Instagram feed and reel follow the files (a lone video can only be a reel). */
function followMedia(
  target: SelectedTarget,
  media: MediaAsset[],
): SelectedTarget {
  if (target.platform !== "instagram" || target.format === "story") {
    return target;
  }
  return { ...target, format: defaultFormat(target.platform, media) };
}

function mapTargets(
  targets: Record<string, SelectedTarget>,
  update: (target: SelectedTarget) => SelectedTarget,
): Record<string, SelectedTarget> {
  return Object.fromEntries(
    Object.entries(targets).map(([id, target]) => [id, update(target)]),
  );
}

/** The composer's form state, plus live checks for every selected account. */
export function useComposer(post?: Post, initialClientId?: string) {
  const [state, setState] = useState(() => initialState(post, initialClientId));
  // Only a post that repeats needs an explicit "stop" when set to never.
  const repeatedBefore = Boolean(post?.repeat && !post.repeat.stopped);

  const checks = useMemo<TargetCheck[]>(
    () =>
      Object.entries(state.targets).map(([accountId, target]) => {
        const input = {
          platform: target.platform,
          format: target.format,
          caption: state.captionOverrides[target.platform] ?? state.caption,
          media: state.media,
          options: target.options,
        };
        return {
          accountId,
          platform: target.platform,
          accountName: target.accountName,
          format: target.format,
          issues: checkPlatformRules(input),
          warnings: platformWarnings(input),
        };
      }),
    [state.targets, state.caption, state.captionOverrides, state.media],
  );

  /** The options shared by every target of `platform` (and `format`), if any is selected. */
  const sharedOptions = (platform: SocialPlatform, format?: TargetFormat) =>
    Object.values(state.targets).find(
      (target) =>
        target.platform === platform && (!format || target.format === format),
    )?.options;

  return {
    state,
    checks,
    hasTargets: checks.length > 0,
    isPublishable:
      checks.length > 0 && checks.every((check) => check.issues.length === 0),
    youtubeOptions: sharedOptions("youtube"),
    facebookFeedOptions: sharedOptions("facebook", "feed"),
    instagramReelOptions: sharedOptions("instagram", "reel"),
    /** Feed posts and reels take collaborators; stories don't. */
    instagramPostOptions: Object.values(state.targets).find(
      (target) => target.platform === "instagram" && target.format !== "story",
    )?.options,
    setClient: (clientId?: string) =>
      // Accounts and media belong to a client; switching starts them over.
      setState((current) => ({
        ...current,
        clientId,
        media: [],
        altTexts: {},
        targets: {},
      })),
    setCaption: (caption: string) =>
      setState((current) => ({ ...current, caption })),
    setFirstComment: (firstComment: string) =>
      setState((current) => ({ ...current, firstComment })),
    setRepeat: (repeat: RepeatRule | null) =>
      setState((current) => ({ ...current, repeat })),
    /** `undefined` goes back to the shared caption. */
    setCaptionOverride: (platform: SocialPlatform, caption?: string) =>
      setState((current) => {
        const captionOverrides = { ...current.captionOverrides };
        if (caption === undefined) delete captionOverrides[platform];
        else captionOverrides[platform] = caption;
        return { ...current, captionOverrides };
      }),
    setAltText: (mediaId: string, altText: string) =>
      setState((current) => ({
        ...current,
        altTexts: { ...current.altTexts, [mediaId]: altText },
      })),
    setMedia: (media: MediaAsset[]) =>
      setState((current) => ({
        ...current,
        media,
        targets: mapTargets(current.targets, (target) =>
          followMedia(target, media),
        ),
      })),
    toggleAccount: (account: ComposerAccount, selected: boolean) =>
      setState((current) => {
        const targets = { ...current.targets };
        if (selected) {
          targets[account.id] = {
            platform: account.platform,
            accountName: account.displayName,
            format: defaultFormat(account.platform, current.media),
            options: NEW_TARGET_OPTIONS[account.platform],
          };
        } else {
          delete targets[account.id];
        }
        return { ...current, targets };
      }),
    setFormat: (accountId: string, format: TargetFormat) =>
      setState((current) => {
        const target = current.targets[accountId];
        if (!target) return current;
        return {
          ...current,
          targets: { ...current.targets, [accountId]: { ...target, format } },
        };
      }),
    /** Platform options are shared by every account of that platform in the post. */
    setPlatformOptions: (platform: SocialPlatform, options: TargetOptions) =>
      setState((current) => ({
        ...current,
        targets: mapTargets(current.targets, (target) =>
          target.platform === platform
            ? { ...target, options: { ...target.options, ...options } }
            : target,
        ),
      })),
    toInput: (): PostInput => ({
      caption: state.caption,
      firstComment: state.firstComment.trim() || null,
      repeat: state.repeat ?? (repeatedBefore ? null : undefined),
      mediaIds: state.media.map((asset) => asset.id),
      altTexts: state.media.flatMap((asset) => {
        const altText = state.altTexts[asset.id]?.trim();
        return altText ? [{ mediaId: asset.id, altText }] : [];
      }),
      targets: Object.entries(state.targets).map(([socialAccountId, t]) => {
        // An emptied link field means "no link", not an invalid URL.
        const { link, ...options } = t.options;
        return {
          socialAccountId,
          format: t.format,
          caption: state.captionOverrides[t.platform] ?? null,
          options: link?.trim() ? { ...options, link: link.trim() } : options,
        };
      }),
    }),
  };
}

export type Composer = ReturnType<typeof useComposer>;
