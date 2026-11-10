import { useTranslations } from "next-intl";

import { SOCIAL_PLATFORMS } from "@/config/platforms";

import LandingIcon from "./LandingIcon";

const PREVIEW_STATS = [
  { key: "reach", value: "48.2K", barClass: "w-4/5 bg-chart-1" },
  { key: "engagement", value: "6.4%", barClass: "w-3/5 bg-chart-2" },
] as const;

const MEDIA_PLACEHOLDER_CLASSES = [
  "from-primary-subtle to-growth-subtle",
  "from-accent-subtle to-primary-subtle",
  "from-growth-subtle to-accent-subtle",
] as const;

const FLOATING_BADGE_CLASS =
  "absolute hidden items-center gap-2 rounded-full border border-border-secondary bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-lg md:flex";

/** Code-built hero mockup of the composer; decorative, described by its caption. */
export default function ProductPreview() {
  const t = useTranslations("landing.preview");
  return (
    <figure className="relative">
      <figcaption className="sr-only">{t("caption")}</figcaption>
      <div aria-hidden className="surface-card-raised shadow-xl!">
        <div className="surface-panel-flush overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-border-secondary px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full bg-growth" />
          </div>
          <div className="flex">
            <div className="hidden w-14 flex-col items-center gap-4 bg-shell py-4 sm:flex">
              <span className="h-7 w-7 rounded-lg bg-primary" />
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className="h-2 w-6 rounded-full bg-shell-border"
                />
              ))}
            </div>
            <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-5">
              <div className="rounded-xl border border-border-secondary p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-text-primary">
                    {t("composer")}
                  </span>
                  <span className="flex gap-1.5">
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <span
                        key={platform}
                        className="grid h-7 w-7 place-items-center rounded-full bg-primary-subtle text-primary-text"
                      >
                        <LandingIcon name={platform} />
                      </span>
                    ))}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {t("sampleCaption")}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {MEDIA_PLACEHOLDER_CLASSES.map((gradient) => (
                    <span
                      key={gradient}
                      className={`aspect-square rounded-lg bg-linear-to-br ${gradient}`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-growth-subtle px-2.5 py-1 text-growth-text">
                    {t("approved")}
                  </span>
                  <span className="rounded-full bg-accent-subtle px-2.5 py-1 text-accent-text">
                    {t("scheduled")}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PREVIEW_STATS.map(({ key, value, barClass }) => (
                  <div
                    key={key}
                    className="rounded-xl border border-border-secondary p-3"
                  >
                    <p className="text-xs text-text-tertiary">{t(key)}</p>
                    <p className="mt-1 text-lg font-semibold text-text-primary">
                      {value}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-background-subtle">
                      <div className={`h-full rounded-full ${barClass}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p aria-hidden className={`${FLOATING_BADGE_CLASS} -start-6 top-20`}>
        <LandingIcon name="checkCircle" className="text-growth" />
        {t("published")}
      </p>
      <p aria-hidden className={`${FLOATING_BADGE_CLASS} -end-4 bottom-8`}>
        <LandingIcon name="rise" className="text-primary" />
        {t("growth")}
      </p>
    </figure>
  );
}
