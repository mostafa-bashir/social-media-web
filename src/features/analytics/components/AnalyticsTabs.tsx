"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link, usePathname } from "@/i18n/navigation";

/** Per-view state (the open post, the posts list's own filters) that stays behind. */
const VIEW_ONLY_PARAMS = ["post", "accountId", "contentType", "sort"];

/** Section links under the filters; the filters themselves carry across. */
export default function AnalyticsTabs() {
  const t = useTranslations("analytics.tabs");
  const slug = useActiveWorkspaceSlug() ?? "";
  const pathname = usePathname();
  const params = useSearchParams();
  const workspace = routes.workspace(slug);

  const tabs = [
    { key: "overview", href: workspace.analytics },
    { key: "accounts", href: workspace.analyticsAccounts },
    { key: "posts", href: workspace.analyticsPosts },
    { key: "content", href: workspace.analyticsContent },
  ] as const;
  // The deepest matching section wins (an account page is under "accounts").
  const active = [...tabs]
    .reverse()
    .find((tab) => pathname.startsWith(tab.href))?.key;
  const query = Object.fromEntries(
    [...params.entries()].filter(([key]) => !VIEW_ONLY_PARAMS.includes(key)),
  );

  return (
    <nav aria-label={t("label")} className="mb-6 overflow-x-auto">
      <ul className="flex min-w-max gap-1 border-b border-border-default">
        {tabs.map((tab) => {
          const current = tab.key === active;
          return (
            <li key={tab.key}>
              <Link
                href={{ pathname: tab.href, query }}
                aria-current={current ? "page" : undefined}
                className={`-mb-px block border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  current
                    ? "border-primary text-primary-text"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
