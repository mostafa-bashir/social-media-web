"use client";

import { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";

import { countryName } from "@/lib/countries";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { Audience } from "../types/audience";

/** One sentence that names the core audience, plus what the numbers describe. */
export default function AudienceSummary({ audience }: { audience: Audience }) {
  const t = useTranslations("analytics.audience");
  const locale = useLocale();
  const fmt = useMetricFormat();
  const { primary, basis } = audience;
  const topCountry = audience.countries[0]?.key;
  const unsupported = audience.accounts.filter((a) => !a.supported);

  const place = topCountry
    ? audience.geo.mena >= 0.5
      ? t("summary.placeMena", { country: countryName(topCountry, locale) })
      : t("summary.place", { country: countryName(topCountry, locale) })
    : null;

  return (
    <section className="surface-card flex flex-col gap-3">
      <div className="surface-panel flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary-text">
          <TeamOutlined aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-text-primary">
            {primary
              ? t("summary.sentence", {
                  gender: t(`summary.genders.${primary.gender}`),
                  age: primary.age,
                  place: place ?? "",
                })
              : t("summary.none")}
          </p>
          {primary ? (
            <p className="text-sm text-text-secondary">
              {t(
                primary.estimated ? "summary.shareEstimated" : "summary.share",
                {
                  share: fmt.percent(primary.share),
                },
              )}
            </p>
          ) : null}
          {basis ? (
            <p className="text-xs text-text-tertiary">{t(`basis.${basis}`)}</p>
          ) : null}
        </div>
      </div>
      {unsupported.length > 0 ? (
        <p className="flex items-center gap-2 text-xs text-text-tertiary">
          <InfoCircleOutlined aria-hidden />
          {t("facebookNote", { count: unsupported.length })}
        </p>
      ) : null}
      <p className="text-xs text-text-tertiary">{t("limits")}</p>
    </section>
  );
}
