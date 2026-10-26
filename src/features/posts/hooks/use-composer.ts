"use client";

import { useMemo, useState } from "react";

import type { SocialPlatform } from "@/config/platforms";
import type { MediaAsset } from "@/lib/media";

import { checkPlatformRules, type PlatformIssue } from "../lib/platform-rules";
import type { ComposerAccount, Post, PostInput, TargetOptions } from "../types";

interface SelectedTarget {
  platform: SocialPlatform;
  options: TargetOptions;
}

export interface ComposerState {
  clientId?: string;
  caption: string;
  media: MediaAsset[];
  targets: Record<string, SelectedTarget>;
}

function initialState(post?: Post, clientId?: string): ComposerState {
  if (!post) return { clientId, caption: "", media: [], targets: {} };
  return {
    clientId: post.clientId,
    caption: post.caption,
    media: post.media,
    targets: Object.fromEntries(
      post.targets
        .filter((target) => target.socialAccountId)
        .map((target) => [
          target.socialAccountId as string,
          { platform: target.platform, options: target.options },
        ]),
    ),
  };
}

/** The composer's form state, plus live per-platform checks. */
export function useComposer(post?: Post, initialClientId?: string) {
  const [state, setState] = useState(() => initialState(post, initialClientId));

  const youtubeOptions = Object.values(state.targets).find(
    (target) => target.platform === "youtube",
  )?.options;

  const issues = useMemo(() => {
    const platforms = new Set(
      Object.values(state.targets).map((target) => target.platform),
    );
    return [...platforms].map((platform) => ({
      platform,
      issues: checkPlatformRules({
        platform,
        caption: state.caption,
        media: state.media,
        options: youtubeOptions ?? {},
      }) satisfies PlatformIssue[],
    }));
  }, [state.targets, state.caption, state.media, youtubeOptions]);

  return {
    state,
    issues,
    hasTargets: Object.keys(state.targets).length > 0,
    isPublishable:
      Object.keys(state.targets).length > 0 &&
      issues.every((entry) => entry.issues.length === 0),
    youtubeOptions,
    setClient: (clientId?: string) =>
      // Accounts and media belong to a client; switching starts them over.
      setState((current) => ({ ...current, clientId, media: [], targets: {} })),
    setCaption: (caption: string) =>
      setState((current) => ({ ...current, caption })),
    setMedia: (media: MediaAsset[]) =>
      setState((current) => ({ ...current, media })),
    toggleAccount: (account: ComposerAccount, selected: boolean) =>
      setState((current) => {
        const targets = { ...current.targets };
        if (selected) {
          targets[account.id] = {
            platform: account.platform,
            options:
              account.platform === "youtube"
                ? { title: "", privacy: "private" }
                : {},
          };
        } else {
          delete targets[account.id];
        }
        return { ...current, targets };
      }),
    setYouTubeOptions: (options: TargetOptions) =>
      setState((current) => ({
        ...current,
        targets: Object.fromEntries(
          Object.entries(current.targets).map(([id, target]) => [
            id,
            target.platform === "youtube" ? { ...target, options } : target,
          ]),
        ),
      })),
    toInput: (): PostInput => ({
      caption: state.caption,
      mediaIds: state.media.map((asset) => asset.id),
      targets: Object.entries(state.targets).map(([socialAccountId, t]) => ({
        socialAccountId,
        options: t.platform === "youtube" ? t.options : undefined,
      })),
    }),
  };
}

export type Composer = ReturnType<typeof useComposer>;
