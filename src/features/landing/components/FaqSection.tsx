import { useTranslations } from "next-intl";

import { LANDING_SECTION_IDS } from "../lib/sections";
import FaqAccordion from "./FaqAccordion";
import LandingSection from "./LandingSection";
import SectionHeading from "./SectionHeading";

const FAQ_TITLE_ID = "faq-title";
const FAQ_KEYS = [
  "platforms",
  "security",
  "roles",
  "approvals",
  "pricing",
  "language",
] as const;

export default function FaqSection() {
  const t = useTranslations("landing.faq");
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.faq}
      labelledBy={FAQ_TITLE_ID}
      className="bg-surface"
    >
      <SectionHeading
        id={FAQ_TITLE_ID}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <div className="surface-card mx-auto mt-12 max-w-3xl">
        <div className="surface-panel-flush overflow-hidden">
          <FaqAccordion
            items={FAQ_KEYS.map((key) => ({
              key,
              question: t(`items.${key}.question`),
              answer: t(`items.${key}.answer`),
            }))}
          />
        </div>
      </div>
    </LandingSection>
  );
}
