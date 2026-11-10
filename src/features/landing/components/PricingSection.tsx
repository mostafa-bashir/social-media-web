import { useTranslations } from "next-intl";

import { PRICING_PLANS } from "../lib/pricing";
import { LANDING_SECTION_IDS } from "../lib/sections";
import LandingSection from "./LandingSection";
import PricingCard from "./PricingCard";
import SectionHeading from "./SectionHeading";

const PRICING_TITLE_ID = "pricing-title";

export default function PricingSection() {
  const t = useTranslations("landing.pricing");
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.pricing}
      labelledBy={PRICING_TITLE_ID}
    >
      <SectionHeading
        id={PRICING_TITLE_ID}
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="mt-14 flex flex-wrap items-stretch justify-center gap-6">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.key} plan={plan} />
        ))}
      </div>
    </LandingSection>
  );
}
