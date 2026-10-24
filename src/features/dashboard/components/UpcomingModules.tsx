"use client";

import {
  BarChartOutlined,
  CheckSquareOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";

interface UpcomingModule {
  key: "social" | "analytics" | "tasks";
  icon: ReactNode;
  tone: StatusTone;
}

const MODULES: UpcomingModule[] = [
  { key: "social", icon: <ShareAltOutlined />, tone: "brand" },
  { key: "analytics", icon: <BarChartOutlined />, tone: "growth" },
  { key: "tasks", icon: <CheckSquareOutlined />, tone: "accent" },
];

const ICON_CLASS: Record<StatusTone, string> = {
  brand: "bg-primary-subtle text-primary-text",
  growth: "bg-growth-subtle text-growth-text",
  accent: "bg-accent-subtle text-accent-text",
  danger: "bg-danger-subtle text-danger-text",
  neutral: "bg-background-tertiary text-text-secondary",
};

/** Placeholder until the social, analytics and task modules land. */
export default function UpcomingModules() {
  const t = useTranslations("dashboard.modules");
  return (
    <section className="surface-card">
      <h2 className="px-3 pb-2 pt-1 text-sm font-semibold text-text-secondary">
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {MODULES.map((module) => (
          <article
            key={module.key}
            className="surface-panel flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${ICON_CLASS[module.tone]}`}
              >
                {module.icon}
              </span>
              <StatusBadge tone={module.tone}>{t("soon")}</StatusBadge>
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              {t(`${module.key}.title`)}
            </h3>
            <p className="text-sm text-text-secondary">
              {t(`${module.key}.description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
