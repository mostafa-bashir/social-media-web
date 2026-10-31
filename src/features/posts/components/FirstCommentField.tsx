"use client";

import { Alert, Input } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import { useCaptionInsert } from "../hooks/use-caption-insert";
import type { Composer } from "../hooks/use-composer";
import type { ComposerAccount } from "../types";
import CaptionToolbar from "./CaptionToolbar";

/** Mirrors the API: Instagram's comment limit, the smallest of the three. */
const MAX_FIRST_COMMENT = 2_200;

/**
 * Posted under each published post, e.g. to keep hashtags or a link out of
 * the caption. Says up front which accounts won't get it.
 */
export default function FirstCommentField({
  composer,
  clientId,
  accounts,
}: {
  composer: Composer;
  clientId: string;
  accounts: ComposerAccount[];
}) {
  const t = useTranslations("posts.composer.firstComment");
  const tPlatforms = useTranslations("common.platforms");
  const slug = useActiveWorkspaceSlug() ?? "";
  const { firstComment, targets } = composer.state;
  const { textAreaRef, insert } = useCaptionInsert(
    firstComment,
    composer.setFirstComment,
  );
  const selected = Object.entries(targets);
  // Accounts on different platforms often share a name.
  const nameOf = (target: (typeof selected)[number][1]) =>
    `${target.accountName} (${tPlatforms(target.platform)})`;
  const stories = selected
    .filter(([, target]) => target.format === "story")
    .map(([, target]) => nameOf(target));
  const withoutPermission = selected
    .filter(([id, target]) => {
      const account = accounts.find((item) => item.id === id);
      return target.format !== "story" && account?.engagementEnabled === false;
    })
    .map(([, target]) => nameOf(target));

  return (
    <div className="flex flex-col gap-2">
      <CaptionToolbar
        clientId={clientId}
        utmSource={selected[0]?.[1].platform ?? "social"}
        onInsert={insert}
      />
      <Input.TextArea
        // Room for the character count drawn under the box.
        className="mb-5!"
        ref={textAreaRef}
        aria-label={t("label")}
        value={firstComment}
        maxLength={MAX_FIRST_COMMENT}
        showCount
        autoSize={{ minRows: 2, maxRows: 8 }}
        placeholder={t("placeholder")}
        onChange={(event) => composer.setFirstComment(event.target.value)}
      />
      {firstComment.trim() && stories.length > 0 ? (
        <p className="text-xs text-text-tertiary">
          {t("skipsStories", { names: stories.join(", ") })}
        </p>
      ) : null}
      {firstComment.trim() && withoutPermission.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          title={t("needsReconnect", { names: withoutPermission.join(", ") })}
          action={
            <Link
              href={routes.workspace(slug).accounts}
              className="text-sm text-primary-text hover:underline"
            >
              {t("reconnect")}
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
