"use client";

import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

export interface DashboardCardProps {
  title: string;
  /** "View all" target. */
  href?: string;
  loading?: boolean;
  /** One failing card never blanks the rest of the page. */
  error?: boolean;
  children: ReactNode;
}

/** Frame shared by the dashboard's list cards: title, link, loading and error states. */
export default function DashboardCard({
  title,
  href,
  loading = false,
  error = false,
  children,
}: DashboardCardProps) {
  const t = useTranslations("dashboard");
  return (
    <section className="surface-card flex flex-col">
      <header className="flex items-center justify-between px-3 pb-2 pt-1">
        <h2 className="text-sm font-semibold text-text-secondary">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-sm font-medium text-primary-text hover:underline"
          >
            {t("viewAll")}
          </Link>
        ) : null}
      </header>
      <div className="surface-panel flex flex-1 flex-col">
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} title={false} />
        ) : error ? (
          <p role="alert" className="py-6 text-center text-sm text-danger-text">
            {t("loadError")}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
