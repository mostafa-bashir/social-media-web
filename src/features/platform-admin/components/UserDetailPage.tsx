"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Descriptions, Skeleton, Tag } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import PageHeader from "@/components/ui/PageHeader";
import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import { useAdminUser } from "../api/users";
import TenantStatusTag from "./TenantStatusTag";
import UserActions from "./UserActions";
import UserStateTags from "./UserStateTags";

export default function UserDetailPage({ userId }: { userId: string }) {
  const t = useTranslations("admin.users");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const user = useAdminUser(userId);
  const date = (value: string | null) =>
    value
      ? format.dateTime(new Date(value), {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const back = (
    <Link
      href={routes.admin.users}
      className="mb-3 inline-flex items-center gap-2 text-sm"
    >
      <ArrowLeftOutlined className="rtl:rotate-180" />
      {t("backToList")}
    </Link>
  );
  if (user.error) {
    return (
      <>
        {back}
        <Alert type="error" showIcon title={errorMessage(user.error)} />
      </>
    );
  }
  if (!user.data) {
    return <Skeleton active />;
  }

  const data = user.data;
  return (
    <>
      {back}
      <PageHeader title={data.name} description={data.email} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <UserStateTags user={data} />
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <UserActions user={data} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card">
          <div className="surface-panel">
            <Descriptions
              column={1}
              size="small"
              title={t("detail.account")}
              items={[
                {
                  key: "created",
                  label: t("detail.created"),
                  children: date(data.createdAt),
                },
                {
                  key: "lastLogin",
                  label: t("detail.lastLogin"),
                  children: date(data.lastLoginAt),
                },
                {
                  key: "lockedUntil",
                  label: t("detail.lockedUntil"),
                  children: date(data.lockedUntil),
                },
                {
                  key: "disabledAt",
                  label: t("detail.disabledAt"),
                  children: date(data.disabledAt),
                },
                {
                  key: "locale",
                  label: t("detail.locale"),
                  children: `${data.locale} · ${data.timezone}`,
                },
              ]}
            />
          </div>
        </div>
        <div className="surface-card">
          <div className="surface-panel">
            <h2 className="mb-3 font-semibold text-text-primary">
              {t("detail.workspaces")}
            </h2>
            {data.workspaces.length === 0 ? (
              <p className="text-sm text-text-secondary">
                {t("detail.noWorkspaces")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.workspaces.map((workspace) => (
                  <li
                    key={workspace.tenantId}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <Link
                      href={routes.admin.tenant(workspace.tenantId)}
                      className="font-medium"
                    >
                      {workspace.name}
                    </Link>
                    <span className="text-sm text-text-tertiary" dir="ltr">
                      /{workspace.slug}
                    </span>
                    {workspace.isOwner ? (
                      <Tag color="gold">{t("detail.owner")}</Tag>
                    ) : null}
                    <TenantStatusTag status={workspace.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
