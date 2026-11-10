import { useFormatter, useTranslations } from "next-intl";

import { PRICING_CURRENCY, type PricingPlan } from "../lib/pricing";
import LandingIcon from "./LandingIcon";
import PillLink from "./PillLink";

export default function PricingCard({ plan }: { plan: PricingPlan }) {
  const t = useTranslations("landing.pricing");
  const format = useFormatter();
  const nameId = `plan-${plan.key}-name`;
  const price =
    plan.priceMonthly === null
      ? null
      : format.number(plan.priceMonthly, {
          style: "currency",
          currency: PRICING_CURRENCY,
          maximumFractionDigits: 0,
        });

  return (
    <article
      aria-labelledby={nameId}
      className={`surface-card-raised w-full max-w-sm ${plan.highlighted ? "ring-2 ring-primary" : ""}`}
    >
      <div className="surface-panel flex h-full flex-col gap-6 sm:p-8!">
        <div className="flex items-center justify-between gap-3">
          <h3 id={nameId} className="text-lg font-semibold text-text-primary">
            {t(`plans.${plan.key}.name`)}
          </h3>
          {plan.highlighted ? (
            <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary-text">
              {t("highlighted")}
            </span>
          ) : null}
        </div>
        <p className="text-text-secondary">{t(`plans.${plan.key}.tagline`)}</p>
        <div>
          <p className="text-4xl font-bold text-text-primary">
            {price ? t("perMonth", { price }) : t("free")}
          </p>
          {price ? null : (
            <p className="mt-1 text-sm text-text-tertiary">{t("freeNote")}</p>
          )}
        </div>
        <PillLink href={plan.ctaHref} size="lg" className="w-full">
          {t(`plans.${plan.key}.cta`)}
        </PillLink>
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {t("includes")}
          </p>
          <ul className="mt-3 space-y-2.5">
            {plan.featureKeys.map((featureKey) => (
              <li
                key={featureKey}
                className="flex items-start gap-2.5 text-sm text-text-secondary"
              >
                <LandingIcon name="check" className="mt-0.5 text-growth" />
                {t(`featureList.${featureKey}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
