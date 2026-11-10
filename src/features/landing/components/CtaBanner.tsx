import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";

import PillLink from "./PillLink";

const CTA_TITLE_ID = "cta-title";

export default function CtaBanner() {
  const t = useTranslations("landing.cta");
  return (
    <section aria-labelledby={CTA_TITLE_ID} className="px-4 py-20 sm:px-6">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-shell px-6 py-14 text-center sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 start-1/4 -z-10 h-72 w-72 rounded-full bg-primary/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 end-1/4 -z-10 h-72 w-72 rounded-full bg-growth/25 blur-3xl"
        />
        <h2
          id={CTA_TITLE_ID}
          className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-shell-text sm:text-4xl"
        >
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-shell-text-muted">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <PillLink href={routes.auth.register} size="lg">
            {t("primary")}
          </PillLink>
          <PillLink href={routes.auth.login} variant="outlineOnDark" size="lg">
            {t("secondary")}
          </PillLink>
        </div>
      </div>
    </section>
  );
}
