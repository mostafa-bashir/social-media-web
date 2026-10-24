import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import BrandMark from "./BrandMark";
import LocaleSwitcher from "./LocaleSwitcher";

const HIGHLIGHT_KEYS = ["publish", "analytics", "team"] as const;
const HIGHLIGHT_DOT: Record<(typeof HIGHLIGHT_KEYS)[number], string> = {
  publish: "bg-primary",
  analytics: "bg-growth",
  team: "bg-accent",
};

/**
 * Auth, workspace picker and invite pages: an indigo brand panel (desktop)
 * beside a two-layer card holding the form.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  const t = useTranslations("common.authShell");
  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-[42%] max-w-xl flex-col justify-between bg-shell p-10 lg:flex">
        <BrandMark onDark />
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight text-shell-text">
            {t("headline")}
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHT_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 text-shell-text-muted"
              >
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full ${HIGHLIGHT_DOT[key]}`}
                />
                {t(`highlights.${key}`)}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-shell-text-muted">{t("footer")}</p>
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-10">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <div className="surface-card-raised w-full max-w-md">
          <div className="surface-panel sm:p-8!">{children}</div>
        </div>
        <LocaleSwitcher />
      </main>
    </div>
  );
}
