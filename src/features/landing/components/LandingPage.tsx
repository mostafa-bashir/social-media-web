import { useTranslations } from "next-intl";

import CtaBanner from "./CtaBanner";
import FaqSection from "./FaqSection";
import FeatureShowcase from "./FeatureShowcase";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import LandingFooter from "./LandingFooter";
import LandingHeader, { type LandingHeaderLabels } from "./LandingHeader";
import PlatformsStrip from "./PlatformsStrip";
import PricingSection from "./PricingSection";

const MAIN_CONTENT_ID = "main-content";

/** Public marketing page shown to guests at `/{locale}`. */
export default function LandingPage() {
  const t = useTranslations("landing");
  const headerLabels: LandingHeaderLabels = {
    label: t("nav.label"),
    features: t("nav.features"),
    how: t("nav.how"),
    pricing: t("nav.pricing"),
    faq: t("nav.faq"),
    login: t("nav.login"),
    getStarted: t("nav.getStarted"),
    openMenu: t("nav.openMenu"),
    closeMenu: t("nav.closeMenu"),
  };
  return (
    <div data-smooth-scroll className="min-h-dvh bg-background">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary! focus:px-4 focus:py-2 focus:text-text-on-color!"
      >
        {t("skipLink")}
      </a>
      <LandingHeader labels={headerLabels} />
      <main id={MAIN_CONTENT_ID}>
        <HeroSection />
        <PlatformsStrip />
        <FeaturesSection />
        <FeatureShowcase />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <CtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
