"use client";

import { Button, Mentions } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMemberOptions } from "@/hooks/use-member-options";

import type { CommentInput } from "../types";

const MAX_COMMENT_LENGTH = 5_000;
const SEARCH_DEBOUNCE_MS = 300;

export interface CommentComposerProps {
  initialBody?: string;
  submitLabel: string;
  loading: boolean;
  /** Resolves true once saved; the text is kept when it fails. */
  onSubmit: (input: CommentInput) => Promise<boolean>;
  onCancel?: () => void;
}

/** Comment box with @member mentions; only mentions still in the text are sent. */
export default function CommentComposer({
  initialBody = "",
  submitLabel,
  loading,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const t = useTranslations("tasks.comments");
  const [body, setBody] = useState(initialBody);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Map<string, string>());
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const members = useMemberOptions(debouncedSearch, search !== "");

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    const mentionedUserIds = [...picked]
      .filter(([, name]) => text.includes(`@${name}`))
      .map(([userId]) => userId);
    if (await onSubmit({ body: text, mentionedUserIds })) {
      setBody("");
      setPicked(new Map());
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Mentions
        aria-label={t("label")}
        placeholder={t("placeholder")}
        autoSize={{ minRows: 2, maxRows: 6 }}
        maxLength={MAX_COMMENT_LENGTH}
        value={body}
        onChange={setBody}
        onSearch={setSearch}
        loading={members.isFetching}
        options={(members.data ?? []).map((member) => ({
          key: member.userId,
          value: member.name,
          label: member.name,
        }))}
        onSelect={(option) => {
          const member = members.data?.find((m) => m.userId === option.key);
          if (member)
            setPicked(new Map(picked).set(member.userId, member.name));
        }}
      />
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button className="rounded-full!" onClick={onCancel}>
            {t("cancel")}
          </Button>
        ) : null}
        <Button
          type="primary"
          className="rounded-full!"
          loading={loading}
          disabled={!body.trim()}
          onClick={() => void submit()}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
