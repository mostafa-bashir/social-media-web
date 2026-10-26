"use client";

import { Alert, Select, Skeleton } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useClientOption } from "@/hooks/use-client-options";
import { useErrorMessage } from "@/hooks/use-error-message";
import { countryOptions } from "@/lib/countries";

import { useTrends } from "../api/get-content";
import { useMetricFormat } from "../hooks/use-metric-format";
import type { AnalyticsScope } from "../types";
import TrendSourceList from "./TrendSourceList";
import WhatWorksList from "./WhatWorksList";

/**
 * What's trending in a market the client targets, next to what has been
 * working on its own accounts lately.
 */
export default function TrendsCard({ scope }: { scope: AnalyticsScope }) {
  const t = useTranslations("analytics.trends");
  const locale = useLocale();
  const fmt = useMetricFormat();
  const errorMessage = useErrorMessage();
  const client = useClientOption(scope.clientId);
  const targets = useMemo(
    () => client.data?.targetCountries ?? [],
    [client.data],
  );
  const [picked, setPicked] = useState<string>();
  const country = picked ?? targets[0];
  const trends = useTrends(scope, country);

  // The client's markets first, then every other country.
  const options = useMemo(() => {
    const all = countryOptions(locale);
    return [
      ...all.filter((option) => targets.includes(option.value)),
      ...all.filter((option) => !targets.includes(option.value)),
    ];
  }, [locale, targets]);

  return (
    <section className="surface-card flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {t("title")}
          </h2>
          <p className="text-sm text-text-secondary">{t("description")}</p>
        </div>
        <Select<string>
          showSearch
          optionFilterProp="label"
          className="w-full sm:w-56!"
          aria-label={t("country")}
          placeholder={t("pickCountry")}
          value={country}
          options={options}
          onChange={setPicked}
        />
      </div>
      {!country ? (
        <Alert type="info" showIcon title={t("noCountry")} />
      ) : trends.error ? (
        <Alert type="error" showIcon title={errorMessage(trends.error)} />
      ) : !trends.data ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-2">
          {/* Auto-fit: a hidden source (no API key) leaves no empty column. */}
          <TrendSourceList
            title={t("searches")}
            source={trends.data.searches}
            items={trends.data.searches.items.map((item) => ({
              key: item.query,
              title: item.query,
              meta: item.traffic
                ? t("traffic", { traffic: item.traffic })
                : null,
              url: item.url,
            }))}
          />
          <TrendSourceList
            title={t("youtube")}
            note={t("youtubeNote")}
            source={trends.data.youtube}
            items={trends.data.youtube.items.map((video) => ({
              key: video.url,
              title: video.title,
              meta:
                [
                  video.channel,
                  video.views !== null &&
                    t("views", { views: fmt.count(video.views) }),
                ]
                  .filter(Boolean)
                  .join(" · ") || null,
              url: video.url,
            }))}
          />
          <section className="surface-panel flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("whatWorks.title")}
            </h3>
            <WhatWorksList whatWorks={trends.data.whatWorks} />
          </section>
        </div>
      )}
    </section>
  );
}
