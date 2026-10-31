"use client";

import { Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { Composer } from "../../hooks/use-composer";
import { formatLabel } from "../../lib/format-label";
import type { ComposerAccount } from "../../types";
import PostPreview from "./PostPreview";

/** One preview per selected account, picked from a list. */
export default function PreviewPanel({
  composer,
  accounts,
}: {
  composer: Composer;
  accounts: ComposerAccount[];
}) {
  const t = useTranslations("posts.composer.preview");
  const tFormats = useTranslations("common.platformFormats");
  const [chosen, setChosen] = useState<string>();
  const { state, checks } = composer;

  if (checks.length === 0) {
    return <p className="text-sm text-text-tertiary">{t("pickAccounts")}</p>;
  }
  const active =
    checks.find((check) => check.accountId === chosen) ?? checks[0];
  const target = state.targets[active.accountId];
  const account = accounts.find((item) => item.id === active.accountId);

  return (
    <div className="flex flex-col gap-3">
      {checks.length > 1 ? (
        <Select<string>
          aria-label={t("choose")}
          value={active.accountId}
          options={checks.map((check) => ({
            value: check.accountId,
            label: `${check.accountName} · ${tFormats(
              formatLabel(check.platform, check.format, state.media.length),
            )}`,
          }))}
          onChange={setChosen}
        />
      ) : null}
      <PostPreview
        platform={active.platform}
        format={active.format}
        accountName={active.accountName}
        avatarUrl={account?.avatarUrl ?? null}
        caption={state.captionOverrides[active.platform] ?? state.caption}
        media={state.media}
        altTexts={state.altTexts}
        link={target?.options.link}
        title={target?.options.title}
        firstComment={state.firstComment.trim() || undefined}
      />
      <p className="text-xs text-text-tertiary">{t("disclaimer")}</p>
    </div>
  );
}
