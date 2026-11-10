import { useTranslations } from "next-intl";
import { Suspense } from "react";

import BrandMark from "@/components/ui/BrandMark";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import { LANDING_NAV_KEYS, LANDING_SECTION_IDS } from "../lib/sections";

const FOOTER_LINK_CLASS =
  "text-text-secondary! transition-colors hover:text-text-primary!";

export default function LandingFooter() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  return (
    <footer className="border-t border-border-secondary bg-surface px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <BrandMark />
          <p className="text-sm text-text-secondary">{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("footer.navLabel")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {LANDING_NAV_KEYS.map((key) => (
              <li key={key}>
                <a
                  href={`#${LANDING_SECTION_IDS[key]}`}
                  className={FOOTER_LINK_CLASS}
                >
                  {t(`nav.${key}`)}
                </a>
              </li>
            ))}
            <li>
              <Link href={routes.auth.login} className={FOOTER_LINK_CLASS}>
                {t("nav.login")}
              </Link>
            </li>
          </ul>
        </nav>
        <Suspense>
          <LocaleSwitcher />
        </Suspense>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-border-secondary pt-6 text-xs text-text-tertiary">
        {t("footer.rights", {
          year: new Date().getUTCFullYear(),
          appName: tCommon("appName"),
        })}
      </p>
    </footer>
  );
}
