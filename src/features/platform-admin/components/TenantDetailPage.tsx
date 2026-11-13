"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Skeleton, Tabs } from "antd";
import { useTranslations } from "next-intl";

import PageHeader from "@/components/ui/PageHeader";
import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import { useAdminTenant } from "../api/tenants";
import TenantAccountsTable from "./TenantAccountsTable";
import TenantActions from "./TenantActions";
import TenantActivityTable from "./TenantActivityTable";
import TenantMembersTable from "./TenantMembersTable";
import TenantOverview from "./TenantOverview";
import TenantPlanTab from "./TenantPlanTab";
import TenantSessionsTable from "./TenantSessionsTable";
import TenantStatusTag from "./TenantStatusTag";
import TenantUsageTab from "./TenantUsageTab";

export default function TenantDetailPage({ tenantId }: { tenantId: string }) {
  const t = useTranslations("admin.tenants");
  const errorMessage = useErrorMessage();
  const tenant = useAdminTenant(tenantId);

  const back = (
    <Link
      href={routes.admin.tenants}
      className="mb-3 inline-flex items-center gap-2 text-sm"
    >
      <ArrowLeftOutlined className="rtl:rotate-180" />
      {t("backToList")}
    </Link>
  );

  if (tenant.error) {
    return (
      <>
        {back}
        <Alert type="error" showIcon title={errorMessage(tenant.error)} />
      </>
    );
  }
  if (!tenant.data) {
    return <Skeleton active />;
  }

  const data = tenant.data;
  return (
    <>
      {back}
      <PageHeader
        title={data.name}
        description={`/${data.slug} · ${data.ownerEmail ?? t("noOwner")}`}
        extra={<TenantActions tenant={data} />}
      />
      <div className="mb-4">
        <TenantStatusTag status={data.status} />
      </div>
      <div className="surface-card">
        <div className="surface-panel">
          <Tabs
            destroyOnHidden
            items={[
              {
                key: "overview",
                label: t("tabs.overview"),
                children: <TenantOverview tenant={data} />,
              },
              {
                key: "usage",
                label: t("tabs.usage"),
                children: <TenantUsageTab tenantId={tenantId} />,
              },
              {
                key: "plan",
                label: t("tabs.plan"),
                children: <TenantPlanTab tenantId={tenantId} />,
              },
              {
                key: "members",
                label: t("tabs.members"),
                children: <TenantMembersTable tenantId={tenantId} />,
              },
              {
                key: "accounts",
                label: t("tabs.accounts"),
                children: <TenantAccountsTable tenantId={tenantId} />,
              },
              {
                key: "activity",
                label: t("tabs.activity"),
                children: <TenantActivityTable tenantId={tenantId} />,
              },
              {
                key: "sessions",
                label: t("tabs.sessions"),
                children: <TenantSessionsTable tenantId={tenantId} />,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
