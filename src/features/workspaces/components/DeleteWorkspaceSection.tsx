"use client";

import { WarningOutlined } from "@ant-design/icons";
import { App, Button, Input } from "antd";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import type { SessionUpdate } from "@/lib/auth/session-types";

import { useDeleteWorkspace } from "../api/workspace-mutations";

/** Danger zone: irreversible deletion, confirmed by typing the workspace URL. */
export default function DeleteWorkspaceSection({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const t = useTranslations("settings.dangerZone");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const locale = useLocale();
  const { update } = useSession();
  const deleteWorkspace = useDeleteWorkspace();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const onConfirm = () =>
    deleteWorkspace.mutate(confirmation, {
      onSuccess: async () => {
        // Leave the deleted workspace in the session, then go pick another one.
        await update({
          action: "switch-workspace",
          slug: null,
        } satisfies SessionUpdate);
        window.location.assign(`/${locale}${routes.workspaces.picker}`);
      },
      onError: (error) => message.error(errorMessage(error)),
    });

  return (
    <section className="surface-card">
      <h2 className="px-3 pb-2 pt-1 text-sm font-semibold text-danger-text">
        {t("title")}
      </h2>
      <div className="surface-panel flex flex-col gap-4 border-danger-subtle! sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-subtle text-danger">
            <WarningOutlined aria-hidden />
          </span>
          <div>
            <h3 className="font-semibold text-text-primary">
              {t("deleteTitle")}
            </h3>
            <p className="text-sm text-text-secondary">
              {t("deleteDescription")}
            </p>
          </div>
        </div>
        <Button
          danger
          className="h-11! shrink-0 rounded-full! px-6!"
          onClick={() => setOpen(true)}
        >
          {t("deleteButton")}
        </Button>
      </div>
      <DeleteConfirmModal
        open={open}
        title={t("confirmTitle")}
        itemName={name}
        warning={t("confirmWarning")}
        confirmLabel={t("deleteButton")}
        loading={deleteWorkspace.isPending}
        confirmDisabled={confirmation.trim().toLowerCase() !== slug}
        onCancel={() => {
          setOpen(false);
          setConfirmation("");
        }}
        onConfirm={onConfirm}
      >
        <label className="block text-sm text-text-secondary">
          {t.rich("typeToConfirm", {
            slug: () => (
              <code
                className="rounded bg-background-tertiary px-1.5 py-0.5 text-text-primary"
                dir="ltr"
              >
                {slug}
              </code>
            ),
          })}
          <Input
            className="mt-2"
            dir="ltr"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
      </DeleteConfirmModal>
    </section>
  );
}
