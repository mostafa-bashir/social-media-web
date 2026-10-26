"use client";

import { useTranslations } from "next-intl";

import { useLineLabel } from "../hooks/use-line-label";
import type { TrendLine } from "../lib/trend-rows";
import type { CompareMode } from "../types";

/** Names every line, so identity never rests on colour alone. */
export default function TrendLegend({
  lines,
  compare,
}: {
  lines: TrendLine[];
  compare: CompareMode;
}) {
  const t = useTranslations("analytics.trend");
  const lineLabel = useLineLabel(compare);

  return (
    <ul className="flex flex-wrap gap-4" aria-label={t("legend")}>
      {lines.map((line) => (
        <li
          key={line.dataKey}
          className="flex items-center gap-2 text-sm text-text-secondary"
        >
          <span
            aria-hidden
            className={`w-4 border-t-2 ${line.dashed ? "border-dashed" : ""}`}
            style={{ borderColor: line.stroke }}
          />
          {lineLabel(line)}
        </li>
      ))}
      <li className="flex items-center gap-2 text-sm text-text-secondary">
        <span aria-hidden className="h-2 w-2 rounded-full bg-text-tertiary" />
        {t("postsPublished")}
      </li>
    </ul>
  );
}
