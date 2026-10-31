"use client";

import { SettingOutlined } from "@ant-design/icons";
import { Button, Input, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useCaptionSnippets } from "../api/caption-snippets";
import { SNIPPET_KINDS } from "../types";

/** Search saved snippets and hashtag groups; clicking one inserts it. */
export default function SnippetPicker({
  clientId,
  canManage,
  onPick,
  onManage,
}: {
  clientId: string;
  canManage: boolean;
  onPick: (body: string) => void;
  onManage: () => void;
}) {
  const t = useTranslations("posts.composer.snippets");
  const snippets = useCaptionSnippets(clientId);
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const matches = (snippets.data ?? []).filter(
    (snippet) =>
      !term ||
      snippet.name.toLowerCase().includes(term) ||
      snippet.body.toLowerCase().includes(term),
  );

  return (
    <div className="flex w-72 flex-col gap-3">
      <Input.Search
        allowClear
        aria-label={t("search")}
        placeholder={t("search")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {snippets.isLoading ? (
        <Spin className="self-center" />
      ) : matches.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {term ? t("noMatches") : t("empty")}
        </p>
      ) : (
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
          {SNIPPET_KINDS.map((kind) => {
            const ofKind = matches.filter((snippet) => snippet.kind === kind);
            if (ofKind.length === 0) return null;
            return (
              <section key={kind} className="flex flex-col gap-1">
                <h3 className="text-xs font-semibold text-text-tertiary">
                  {t(`kinds.${kind}`)}
                </h3>
                <ul className="flex flex-col">
                  {ofKind.map((snippet) => (
                    <li key={snippet.id}>
                      <button
                        type="button"
                        onClick={() => onPick(snippet.body)}
                        className="flex w-full flex-col rounded-lg px-2 py-1.5 text-start hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <span className="text-sm font-medium text-text-primary">
                          {snippet.name}
                        </span>
                        <span className="line-clamp-1 text-xs text-text-tertiary">
                          {snippet.body}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      {canManage ? (
        <Button
          size="small"
          icon={<SettingOutlined />}
          className="self-start rounded-full!"
          onClick={onManage}
        >
          {t("manage")}
        </Button>
      ) : null}
    </div>
  );
}
