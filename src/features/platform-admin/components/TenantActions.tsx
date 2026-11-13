"use client";

import {
  DeleteOutlined,
  ExportOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { App, Button, Input } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useRouter } from "@/i18n/navigation";

import { useAdminSessionQuery } from "../api/admin-session";
import { useDeleteTenant, useSetTenantStatus } from "../api/tenants";
import type { AdminTenantDetail } from "../types/tenants";
import StartImpersonationModal from "./StartImpersonationModal";

/** Header actions. Support admins only get "Open as owner". */
export default function TenantActions({
  tenant,
}: {
  tenant: AdminTenantDetail;
}) {
  const t = useTranslations("admin.tenants.actions");
  const errorMessage = useErrorMessage();
  const { message, modal } = App.useApp();
  const router = useRouter();
  const isSuperAdmin =
    useAdminSessionQuery().data?.admin.role === "super_admin";
  const setStatus = useSetTenantStatus(tenant.id);
  const deleteTenant = useDeleteTenant(tenant.id);
  const [impersonating, setImpersonating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const suspended = tenant.status === "suspended";

  const toggleStatus = () =>
    modal.confirm({
      title: t(suspended ? "reactivateTitle" : "suspendTitle", {
        name: tenant.name,
      }),
      content: t(suspended ? "reactivateWarning" : "suspendWarning"),
      okText: t(suspended ? "reactivate" : "suspend"),
      okButtonProps: { danger: !suspended },
      onOk: () =>
        setStatus
          .mutateAsync(suspended ? "reactivate" : "suspend")
          .then(() =>
            message.success(t(suspended ? "reactivated" : "suspended")),
          )
          .catch((error: unknown) => message.error(errorMessage(error))),
    });

  return (
    <>
      <Button
        type="primary"
        icon={<ExportOutlined />}
        className="rounded-full!"
        disabled={suspended}
        onClick={() => setImpersonating(true)}
      >
        {t("openAsOwner")}
      </Button>
      {isSuperAdmin ? (
        <>
          <Button
            icon={suspended ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            className="rounded-full!"
            onClick={toggleStatus}
          >
            {t(suspended ? "reactivate" : "suspend")}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            className="rounded-full!"
            aria-label={t("delete")}
            onClick={() => setDeleting(true)}
          />
        </>
      ) : null}
      <StartImpersonationModal
        tenant={tenant}
        open={impersonating}
        onClose={() => setImpersonating(false)}
      />
      <DeleteConfirmModal
        open={deleting}
        title={t("deleteTitle")}
        itemName={tenant.name}
        warning={t("deleteWarning")}
        confirmLabel={t("delete")}
        loading={deleteTenant.isPending}
        confirmDisabled={confirmSlug.trim().toLowerCase() !== tenant.slug}
        onCancel={() => {
          setDeleting(false);
          setConfirmSlug("");
        }}
        onConfirm={() =>
          deleteTenant.mutate(confirmSlug, {
            onSuccess: () => {
              message.success(t("deleted", { name: tenant.name }));
              router.replace(routes.admin.tenants);
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      >
        <label className="mt-3 block text-sm text-text-secondary">
          {t("typeSlug", { slug: tenant.slug })}
          <Input
            className="mt-1!"
            dir="ltr"
            value={confirmSlug}
            onChange={(event) => setConfirmSlug(event.target.value)}
          />
        </label>
      </DeleteConfirmModal>
    </>
  );
}
