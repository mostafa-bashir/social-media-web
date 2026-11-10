import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";

import { pillClassName } from "../lib/pill";
import { LANDING_SECTION_IDS } from "../lib/sections";
import PillLink from "./PillLink";
import ProductPreview from "./ProductPreview";

const HERO_TITLE_ID = "hero-title";

export default function HeroSection() {
  const t = useTranslations("landing.hero");
  return (
    <section
      aria-labelledby={HERO_TITLE_ID}
      className="relative isolate overflow-x-clip px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-linear-to-b from-primary-subtle to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 end-0 -z-10 h-96 w-96 rounded-full bg-growth/20 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-surface px-3 py-1 text-sm font-medium text-primary-text">
            <span aria-hidden className="h-2 w-2 rounded-full bg-growth" />
            {t("eyebrow")}
          </p>
          <h1
            id={HERO_TITLE_ID}
            className="mt-6 text-4xl font-bold leading-tight text-text-primary sm:text-5xl ltr:tracking-tight"
          >
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={routes.auth.register} size="lg">
              {t("primaryCta")}
            </PillLink>
            <a
              href={`#${LANDING_SECTION_IDS.features}`}
              className={pillClassName("secondary", "lg")}
            >
              {t("secondaryCta")}
            </a>
          </div>
          <p className="mt-4 text-sm text-text-tertiary">{t("note")}</p>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
