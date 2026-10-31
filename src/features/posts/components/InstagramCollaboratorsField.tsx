"use client";

import { Select } from "antd";
import { useTranslations } from "next-intl";
import { useId } from "react";

import type { TargetOptions } from "../types";

/** Mirrors the API's limits. */
const MAX_COLLABORATORS = 3;
const INSTAGRAM_USERNAME = /^[A-Za-z0-9._]{1,30}$/;

/** Usernames invited to co-author the post; it shows on their profile once they accept. */
export default function InstagramCollaboratorsField({
  value,
  onChange,
}: {
  value: TargetOptions;
  onChange: (options: TargetOptions) => void;
}) {
  const t = useTranslations("posts.composer.instagram");
  const id = useId();
  const usernames = value.collaborators ?? [];

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {t("collaborators")}
      </label>
      <Select<string[]>
        id={id}
        mode="tags"
        open={false}
        value={usernames}
        tokenSeparators={[",", " "]}
        placeholder={t("collaboratorsPlaceholder")}
        onChange={(next) =>
          onChange({
            collaborators: next
              .map((name) => name.trim().replace(/^@/, ""))
              .filter((name) => INSTAGRAM_USERNAME.test(name))
              .slice(0, MAX_COLLABORATORS),
          })
        }
      />
      <span className="text-xs text-text-tertiary">
        {t("collaboratorsHint", { max: MAX_COLLABORATORS })}
      </span>
    </div>
  );
}
