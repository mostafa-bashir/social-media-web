"use client";

import { useTranslations } from "next-intl";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { ShareRow } from "../types/audience";

/** Youngest at the top, like the platforms' own audience pages. */
const AGE_BANDS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const SEPARATOR = "|";
const SIDES = [
  { gender: "female", barClass: "bg-chart-1" },
  { gender: "male", barClass: "bg-chart-2" },
] as const;

/** One half of a row; the women's half grows toward the middle. */
function Side({
  value,
  top,
  barClass,
  mirrored = false,
}: {
  value: number;
  top: number;
  barClass: string;
  mirrored?: boolean;
}) {
  const fmt = useMetricFormat();
  return (
    <div
      aria-hidden
      className={`flex items-center gap-2 ${mirrored ? "flex-row-reverse" : ""}`}
    >
      <span
        className={`block h-4 rounded-sm ${barClass}`}
        style={{ width: `${top > 0 ? (value / top) * 100 : 0}%` }}
      />
      <span className="tabular-nums text-text-tertiary">
        {fmt.percent(value)}
      </span>
    </div>
  );
}

/**
 * Age × gender cells as a population pyramid: women on one side, men on the
 * other. Cells with unspecified gender aren't drawn (noted under the chart).
 */
export default function AgeGenderPyramid({ cells }: { cells: ShareRow[] }) {
  const t = useTranslations("analytics.audience");
  const fmt = useMetricFormat();
  const share = (gender: string, age: string) =>
    cells.find((cell) => cell.key === `${gender}${SEPARATOR}${age}`)?.share ??
    0;
  const top = Math.max(...cells.map((cell) => cell.share), 0);
  const unknown = cells
    .filter((cell) => cell.key.startsWith(`unknown${SEPARATOR}`))
    .reduce((sum, cell) => sum + cell.share, 0);
  const rows = AGE_BANDS.filter((age) =>
    SIDES.some(({ gender }) => share(gender, age) > 0),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center gap-6 text-xs text-text-secondary">
        {SIDES.map(({ gender, barClass }) => (
          <span key={gender} className="flex items-center gap-2">
            <span
              aria-hidden
              className={`h-2.5 w-2.5 rounded-sm ${barClass}`}
            />
            {t(`genders.${gender}`)}
          </span>
        ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {rows.map((age) => (
          <li
            key={age}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs"
            aria-label={t("pyramidRow", {
              age,
              female: fmt.percent(share("female", age)),
              male: fmt.percent(share("male", age)),
            })}
          >
            <Side
              value={share("female", age)}
              top={top}
              barClass="bg-chart-1"
              mirrored
            />
            <span className="w-12 text-center text-text-secondary" aria-hidden>
              {age}
            </span>
            <Side value={share("male", age)} top={top} barClass="bg-chart-2" />
          </li>
        ))}
      </ul>
      {unknown > 0 ? (
        <p className="text-xs text-text-tertiary">
          {t("unspecifiedGender", { share: fmt.percent(unknown) })}
        </p>
      ) : null}
    </div>
  );
}
