"use client";

import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import type { HealthOverview } from "../types/health";

/** Workspaces whose social accounts need reconnecting or expire within a week. */
export default function AccountsAttentionCard({
  accounts,
}: {
  accounts: NonNullable<HealthOverview["accounts"]>;
}) {
  const t = useTranslations("admin.health.accounts");

  return (
    <section className="surface-panel flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">
          {t("title")}
        </h2>
        <p className="text-xs text-text-tertiary">
          {t("summary", {
            reconnect: accounts.reconnect,
            expiring: accounts.expiring,
          })}
        </p>
      </div>
      {accounts.tenants.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary text-sm">
          {accounts.tenants.map((tenant) => (
            <li
              key={tenant.tenantId}
              className="flex items-center justify-between gap-3 py-2"
            >
              <Link
                href={routes.admin.tenant(tenant.tenantId)}
                className="truncate font-medium"
              >
                {tenant.name}
              </Link>
              <span className="shrink-0 text-text-secondary">
                {t("row", {
                  reconnect: tenant.reconnect,
                  expiring: tenant.expiring,
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
