"use client";

import { LinkOutlined } from "@ant-design/icons";
import { useFormatter, useNow, useTranslations } from "next-intl";

import type { Trends } from "../types/content";

export interface TrendItem {
  key: string;
  title: string;
  meta: string | null;
  url: string;
}

/** One public trend source: its items, or why there are none. Titles are plain text. */
export default function TrendSourceList({
  title,
  source,
  items,
  note,
}: {
  title: string;
  source: Pick<Trends["searches"], "status" | "fetchedAt">;
  items: TrendItem[];
  /** Caveat shown under the title, e.g. which categories a chart covers. */
  note?: string;
}) {
  const t = useTranslations("analytics.trends");
  const format = useFormatter();
  const now = useNow();
  if (source.status === "not_configured") return null;

  return (
    <section className="surface-panel flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {note ? <p className="text-xs text-text-tertiary">{note}</p> : null}
        {source.fetchedAt ? (
          <p className="text-xs text-text-tertiary">
            {t("updated", {
              when: format.relativeTime(new Date(source.fetchedAt), now),
            })}
          </p>
        ) : null}
      </div>
      {source.status === "unavailable" ? (
        <p className="text-sm text-text-tertiary">{t("unavailable")}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("none")}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={item.key} className="flex items-start gap-2 text-sm">
              <span className="w-5 shrink-0 text-end text-text-tertiary tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-text-primary hover:text-primary-text hover:underline"
                  dir="auto"
                >
                  <span className="truncate">{item.title}</span>
                  <LinkOutlined aria-hidden className="shrink-0 text-xs" />
                </a>
                {item.meta ? (
                  <p className="truncate text-xs text-text-tertiary" dir="auto">
                    {item.meta}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
