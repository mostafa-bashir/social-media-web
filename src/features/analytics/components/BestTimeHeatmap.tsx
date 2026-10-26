"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMetricFormat } from "../hooks/use-metric-format";
import { useSlotLabel } from "../hooks/use-slot-label";
import type { TimeSlot } from "../types/content";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
/** Hour labels every few columns keep the header readable on small screens. */
const HOUR_LABEL_EVERY = 3;
const HEAT_CLASS = [
  "bg-heat-1",
  "bg-heat-2",
  "bg-heat-3",
  "bg-heat-4",
  "bg-heat-5",
] as const;
/** Diagonal hatching marks cells with too few posts to trust. */
const LOW_SAMPLE_CLASS =
  "bg-[repeating-linear-gradient(45deg,transparent_0_3px,var(--ds-bg-surface)_3px_5px)]";

/** Average engagement by weekday × hour, darker = better. */
export default function BestTimeHeatmap({ slots }: { slots: TimeSlot[] }) {
  const t = useTranslations("analytics.content.bestTimes");
  const fmt = useMetricFormat();
  const label = useSlotLabel();
  const [focused, setFocused] = useState<TimeSlot | null>(null);

  const bySlot = new Map(slots.map((s) => [`${s.weekday}-${s.hour}`, s]));
  const max = Math.max(1, ...slots.map((s) => s.avgEngagements));
  const level = (slot: TimeSlot) =>
    Math.min(
      HEAT_CLASS.length - 1,
      Math.floor((slot.avgEngagements / max) * HEAT_CLASS.length),
    );
  const describe = (slot: TimeSlot) =>
    t("cell", {
      day: label.weekday(slot.weekday),
      hour: label.hour(slot.hour),
      posts: slot.posts,
      engagements: fmt.count(slot.avgEngagements),
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto" dir="ltr">
        <table className="w-full min-w-[560px] border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th scope="col" className="w-12" />
              {HOURS.map((hour) => (
                <th
                  key={hour}
                  scope="col"
                  className="text-start text-[10px] font-normal text-text-tertiary"
                >
                  {hour % HOUR_LABEL_EVERY === 0 ? label.hour(hour) : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((weekday) => (
              <tr key={weekday}>
                <th
                  scope="row"
                  className="pe-2 text-start text-xs font-normal text-text-secondary"
                >
                  {label.weekday(weekday, "short")}
                </th>
                {HOURS.map((hour) => {
                  const slot = bySlot.get(`${weekday}-${hour}`);
                  if (!slot) {
                    return (
                      <td
                        key={hour}
                        className="h-6 rounded-sm bg-background-tertiary"
                      />
                    );
                  }
                  return (
                    <td key={hour} className="h-6 p-0">
                      <button
                        type="button"
                        aria-label={describe(slot)}
                        onFocus={() => setFocused(slot)}
                        onMouseEnter={() => setFocused(slot)}
                        className={`block h-full w-full rounded-sm ${HEAT_CLASS[level(slot)]} ${
                          slot.lowSample ? LOW_SAMPLE_CLASS : ""
                        } focus-visible:outline-2 focus-visible:outline-primary`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-tertiary">
        <p aria-live="polite" className="min-h-4 text-text-secondary">
          {focused ? describe(focused) : t("hint")}
        </p>
        <div className="flex items-center gap-2">
          <span>{t("low")}</span>
          {HEAT_CLASS.map((cls) => (
            <span
              key={cls}
              aria-hidden
              className={`h-3 w-5 rounded-sm ${cls}`}
            />
          ))}
          <span>{t("high")}</span>
          <span
            aria-hidden
            className={`ms-3 h-3 w-5 rounded-sm bg-heat-3 ${LOW_SAMPLE_CLASS}`}
          />
          <span>{t("fewPosts")}</span>
        </div>
      </div>
    </div>
  );
}
