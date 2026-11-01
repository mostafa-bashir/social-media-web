"use client";

import { CheckCircleFilled } from "@ant-design/icons";
import { Progress } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import { type SetupStep, useDashboardSetup } from "../api/get-dashboard-counts";

type WorkspaceRoutes = ReturnType<typeof routes.workspace>;

const STEPS: Array<{ key: SetupStep; href: (r: WorkspaceRoutes) => string }> = [
  { key: "hasClient", href: (r) => r.clients },
  { key: "hasAccount", href: (r) => r.accounts },
  { key: "hasPost", href: (r) => r.newPost },
  { key: "hasTeammate", href: (r) => r.members },
  { key: "hasTask", href: (r) => r.tasks },
];

/** Onboarding for a new workspace; gone once every visible step is done. */
export default function GettingStartedCard() {
  const t = useTranslations("dashboard.setup");
  const slug = useActiveWorkspaceSlug() ?? "";
  // Setup is workspace-wide, so it ignores the client filter.
  const setup = useDashboardSetup().data;
  if (!setup) return null;

  const steps = STEPS.filter((step) => setup[step.key] !== null);
  const done = steps.filter((step) => setup[step.key]).length;
  if (steps.length === 0 || done === steps.length) return null;
  const workspaceRoutes = routes.workspace(slug);

  return (
    <section className="surface-card mb-6">
      <header className="flex flex-col gap-2 px-3 pb-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-text-secondary">
          {t("title")}
        </h2>
        <div className="flex items-center gap-3 sm:w-64">
          <Progress
            percent={Math.round((done / steps.length) * 100)}
            showInfo={false}
            size="small"
            aria-hidden
          />
          <span className="shrink-0 text-xs text-text-tertiary">
            {t("progress", { done, total: steps.length })}
          </span>
        </div>
      </header>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step) => {
          const complete = Boolean(setup[step.key]);
          return (
            <li key={step.key}>
              <Link
                href={step.href(workspaceRoutes)}
                aria-label={`${t(`${step.key}.title`)}${complete ? ` — ${t("done")}` : ""}`}
                className="surface-panel flex h-full flex-col gap-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  {complete ? (
                    <CheckCircleFilled aria-hidden className="text-growth" />
                  ) : (
                    <span
                      aria-hidden
                      className="h-3.5 w-3.5 rounded-full border-2 border-border-default"
                    />
                  )}
                  <span className={complete ? "line-through opacity-60" : ""}>
                    {t(`${step.key}.title`)}
                  </span>
                </span>
                <span className="text-xs text-text-tertiary">
                  {t(`${step.key}.description`)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
