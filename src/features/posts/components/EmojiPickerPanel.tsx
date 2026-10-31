"use client";

import { EmojiPicker } from "frimousse";
import { useTranslations } from "next-intl";

const COLUMNS = 8;

/** Searchable emoji grid; emoji names are English (Emojibase has no Arabic). */
export default function EmojiPickerPanel({
  onPick,
}: {
  onPick: (emoji: string) => void;
}) {
  const t = useTranslations("posts.composer.emoji");

  return (
    <EmojiPicker.Root
      columns={COLUMNS}
      onEmojiSelect={({ emoji }) => onPick(emoji)}
      className="flex h-80 w-72 flex-col gap-2"
    >
      <EmojiPicker.Search
        aria-label={t("search")}
        placeholder={t("search")}
        className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus-visible:border-primary"
      />
      <EmojiPicker.Viewport className="relative flex-1 outline-none">
        <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-text-tertiary">
          {t("loading")}
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-text-tertiary">
          {t("empty")}
        </EmojiPicker.Empty>
        <EmojiPicker.List
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                {...props}
                className="bg-surface px-1 pt-2 pb-1 text-xs font-medium text-text-tertiary"
              >
                {category.label}
              </div>
            ),
            Emoji: ({ emoji, ...props }) => (
              <button
                {...props}
                className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-background-tertiary"
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
