import { useTranslations } from "next-intl";

import { LANDING_FEATURES } from "../lib/features";
import { LANDING_SECTION_IDS } from "../lib/sections";
import FeatureCard from "./FeatureCard";
import LandingSection from "./LandingSection";
import SectionHeading from "./SectionHeading";

const FEATURES_TITLE_ID = "features-title";

export default function FeaturesSection() {
  const t = useTranslations("landing.features");
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.features}
      labelledBy={FEATURES_TITLE_ID}
    >
      <SectionHeading
        id={FEATURES_TITLE_ID}
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_FEATURES.map(({ key, tone }) => (
          <FeatureCard
            key={key}
            icon={key}
            tone={tone}
            title={t(`items.${key}.title`)}
            body={t(`items.${key}.body`)}
          />
        ))}
      </ul>
    </LandingSection>
  );
}
