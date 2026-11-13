"use client";

import { Segmented } from "antd";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import PlatformBadge from "@/components/ui/PlatformBadge";
import { platformSchema } from "@/config/platforms";

import type { HealthOverview } from "../types/health";

type Window = "today" | "week";

/** Success rate per platform, plus the most common failure messages this week. */
export default function PublishingHealthCard({
  publishing,
}: {
  publishing: NonNullable<HealthOverview["publishing"]>;
}) {
  const t = useTranslations("admin.health.publishing");
  const format = useFormatter();
  const [window, setWindow] = useState<Window>("today");
  const rows = publishing[window];

  return (
    <section className="surface-panel flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-primary">
          {t("title")}
        </h2>
        <Segmented<Window>
          size="small"
          aria-label={t("window")}
          value={window}
          options={[
            { value: "today", label: t("today") },
            { value: "week", label: t("week") },
          ]}
          onChange={setWindow}
        />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("empty")}</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-start text-text-tertiary">
            <tr>
              <th className="pb-2 text-start font-normal">{t("platform")}</th>
              <th className="pb-2 text-end font-normal">{t("published")}</th>
              <th className="pb-2 text-end font-normal">{t("failed")}</th>
              <th className="pb-2 text-end font-normal">{t("successRate")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const platform = platformSchema.safeParse(row.platform);
              const attempts = row.published + row.failed;
              return (
                <tr
                  key={row.platform}
                  className="border-t border-border-secondary"
                >
                  <td className="py-2">
                    {platform.success ? (
                      <PlatformBadge platform={platform.data} />
                    ) : (
                      row.platform
                    )}
                  </td>
                  <td className="py-2 text-end tabular-nums">
                    {format.number(row.published)}
                  </td>
                  <td className="py-2 text-end tabular-nums">
                    {format.number(row.failed)}
                  </td>
                  <td className="py-2 text-end tabular-nums">
                    {attempts > 0
                      ? format.number(row.published / attempts, {
                          style: "percent",
                          maximumFractionDigits: 1,
                        })
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          {t("topReasons")}
        </h3>
        {publishing.topReasons.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t("noFailures")}</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {publishing.topReasons.map((reason) => (
              <li key={reason.reason} className="flex justify-between gap-3">
                <span className="text-text-secondary">
                  {reason.reason || t("noMessage")}
                </span>
                <span className="shrink-0 tabular-nums text-text-primary">
                  {format.number(reason.count)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
