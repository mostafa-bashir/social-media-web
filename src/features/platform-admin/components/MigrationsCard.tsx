"use client";

import { DatabaseOutlined } from "@ant-design/icons";
import { App, Button } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import { useAdminSessionQuery } from "../api/admin-session";
import { useRunMigrations } from "../api/health";
import type { HealthOverview } from "../types/health";

/** Workspaces behind on database updates, with a super-admin "run pending" action. */
export default function MigrationsCard({
  migrations,
}: {
  migrations: NonNullable<HealthOverview["migrations"]>;
}) {
  const t = useTranslations("admin.health.migrations");
  const errorMessage = useErrorMessage();
  const { message, modal } = App.useApp();
  const isSuperAdmin =
    useAdminSessionQuery().data?.admin.role === "super_admin";
  const run = useRunMigrations();
  const behind = migrations.behind;

  const confirmRun = () =>
    modal.confirm({
      title: t("confirmTitle"),
      content: t("confirmBody", { count: behind.length }),
      okText: t("run"),
      onOk: () =>
        run
          .mutateAsync()
          .then(({ queued }) =>
            queued
              ? message.success(t("queued"))
              : message.info(t("alreadyRunning")),
          )
          .catch((error: unknown) => message.error(errorMessage(error))),
    });

  return (
    <section className="surface-panel flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            {t("title")}
          </h2>
          <p className="text-xs text-text-tertiary">
            {behind.length === 0
              ? t("upToDate", { count: migrations.expected })
              : t("behindSummary", { count: behind.length })}
          </p>
        </div>
        {isSuperAdmin && behind.length > 0 ? (
          <Button
            icon={<DatabaseOutlined />}
            className="rounded-full!"
            loading={run.isPending}
            onClick={confirmRun}
          >
            {t("run")}
          </Button>
        ) : null}
      </div>
      {behind.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border-secondary text-sm">
          {behind.map((tenant) => (
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
              <span className="shrink-0 tabular-nums text-text-secondary">
                {tenant.applied === null
                  ? t("noTable")
                  : t("progress", {
                      applied: tenant.applied,
                      expected: migrations.expected,
                    })}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
