import { useTranslations } from "next-intl";

const KPIS = [
  { key: "reach", value: "48.2K", delta: "+18%" },
  { key: "engagement", value: "6.4%", delta: "+0.8" },
  { key: "followers", value: "12.9K", delta: "+412" },
] as const;

/** Bar heights (% of chart); the last bars are highlighted as the current period. */
const BAR_HEIGHTS = [38, 52, 44, 61, 57, 70, 64, 78, 72, 86, 81, 94];
const HIGHLIGHTED_BARS = 3;

const HEAT_CLASSES = [
  "bg-heat-1",
  "bg-heat-2",
  "bg-heat-3",
  "bg-heat-4",
  "bg-heat-5",
];
const HEATMAP_ROWS = 4;
const HEATMAP_COLUMNS = 12;

/** Deterministic sample intensity with an evening peak, so renders are stable. */
function heatLevel(row: number, column: number): number {
  const eveningPeak = column >= 7 && column <= 9 ? 2 : 0;
  return Math.min(
    HEAT_CLASSES.length - 1,
    ((row * 3 + column * 2) % 3) + eveningPeak,
  );
}

export default function AnalyticsMockup() {
  const t = useTranslations("landing.mockups");
  return (
    <figure>
      <figcaption className="sr-only">{t("analyticsCaption")}</figcaption>
      <div aria-hidden className="surface-card-raised">
        <div className="surface-panel">
          <div className="grid grid-cols-3 gap-2">
            {KPIS.map(({ key, value, delta }) => (
              <div
                key={key}
                className="min-w-0 rounded-lg border border-border-secondary p-2.5"
              >
                <p className="truncate text-[11px] text-text-tertiary">
                  {t(`kpis.${key}`)}
                </p>
                <p className="mt-1 text-base font-semibold text-text-primary sm:text-lg">
                  {value}
                </p>
                <p
                  dir="ltr"
                  className="text-[11px] font-medium text-growth-text"
                >
                  {delta}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex h-28 items-end gap-1.5">
            {BAR_HEIGHTS.map((height, index) => (
              <span
                key={index}
                style={{ height: `${height}%` }}
                className={`flex-1 rounded-t ${
                  index >= BAR_HEIGHTS.length - HIGHLIGHTED_BARS
                    ? "bg-chart-2"
                    : "bg-chart-1"
                }`}
              />
            ))}
          </div>
          <p className="mt-5 text-xs font-medium text-text-secondary">
            {t("bestTime")}
          </p>
          <div
            className="mt-2 grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${HEATMAP_COLUMNS}, minmax(0, 1fr))`,
            }}
          >
            {Array.from(
              { length: HEATMAP_ROWS * HEATMAP_COLUMNS },
              (_, cell) => (
                <span
                  key={cell}
                  className={`aspect-square rounded-sm ${
                    HEAT_CLASSES[
                      heatLevel(
                        Math.floor(cell / HEATMAP_COLUMNS),
                        cell % HEATMAP_COLUMNS,
                      )
                    ]
                  }`}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </figure>
  );
}
