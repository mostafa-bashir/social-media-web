import { useTranslations } from "next-intl";

import { LANDING_SECTION_IDS } from "../lib/sections";
import { type LandingTone, TONE_CHIP_CLASS } from "../lib/tones";
import LandingIcon from "./LandingIcon";
import LandingSection from "./LandingSection";
import SectionHeading from "./SectionHeading";

const HOW_TITLE_ID = "how-title";

const STEPS: readonly {
  key: "connect" | "plan" | "measure";
  tone: LandingTone;
}[] = [
  { key: "connect", tone: "primary" },
  { key: "plan", tone: "accent" },
  { key: "measure", tone: "growth" },
];

export default function HowItWorksSection() {
  const t = useTranslations("landing.how");
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.how}
      labelledBy={HOW_TITLE_ID}
      className="bg-surface"
    >
      <SectionHeading
        id={HOW_TITLE_ID}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map(({ key, tone }, index) => (
          <li key={key} className="surface-card">
            <div className="surface-panel h-full">
              <div className="flex items-center justify-between">
                <LandingIcon
                  name={key}
                  className={`grid h-11 w-11 place-items-center rounded-full text-lg ${TONE_CHIP_CLASS[tone]}`}
                />
                <span
                  aria-hidden
                  className="text-3xl font-bold text-border-default"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text-primary">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {t(`steps.${key}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}
