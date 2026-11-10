import { useTranslations } from "next-intl";

import { SOCIAL_PLATFORMS } from "@/config/platforms";

import LandingIcon from "./LandingIcon";

const PLATFORMS_TITLE_ID = "platforms-title";

export default function PlatformsStrip() {
  const t = useTranslations("landing.platforms");
  const tPlatforms = useTranslations("common.platforms");
  return (
    <section
      aria-labelledby={PLATFORMS_TITLE_ID}
      className="border-y border-border-secondary bg-surface px-4 py-10 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <h2
          id={PLATFORMS_TITLE_ID}
          className="text-base font-semibold text-text-primary"
        >
          {t("title")}
        </h2>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <li
              key={platform}
              className="flex items-center gap-2.5 text-lg font-semibold text-text-secondary"
            >
              <LandingIcon name={platform} className="text-2xl text-primary" />
              {tPlatforms(platform)}
            </li>
          ))}
        </ul>
        <p className="text-sm text-text-tertiary">{t("formats")}</p>
      </div>
    </section>
  );
}
