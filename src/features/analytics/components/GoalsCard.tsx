"use client";

import { AimOutlined } from "@ant-design/icons";
import { Alert, App, Button, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useIsClient } from "@/hooks/use-is-client";
import { usePermissions } from "@/hooks/use-permissions";

import {
  type Goal,
  MAX_GOALS_PER_CLIENT,
  useDeleteGoal,
  useGoals,
} from "../api/goals";
import GoalFormModal from "./GoalFormModal";
import GoalRow from "./GoalRow";

/** The client's targets and how each is pacing. */
export default function GoalsCard({ clientId }: { clientId: string }) {
  const t = useTranslations("analytics.goals");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can } = usePermissions();
  // Permissions resolve on the client only; gating before that would mismatch hydration.
  const canManage = useIsClient() && can(Permission.AnalyticsManage);
  const goals = useGoals(clientId);
  const remove = useDeleteGoal();
  // undefined = closed, null = creating.
  const [editing, setEditing] = useState<Goal | null | undefined>();
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const atLimit = (goals.data?.length ?? 0) >= MAX_GOALS_PER_CLIENT;

  const onDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting, {
      onSuccess: () => setDeleting(null),
      onError: (error) => message.error(errorMessage(error)),
    });
  };

  return (
    <section className="surface-card flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {t("title")}
          </h2>
          <p className="text-sm text-text-secondary">{t("description")}</p>
        </div>
        {canManage ? (
          <Button
            icon={<AimOutlined />}
            className="rounded-full!"
            disabled={atLimit}
            onClick={() => setEditing(null)}
          >
            {t("add")}
          </Button>
        ) : null}
      </div>
      {goals.error ? (
        <Alert type="error" showIcon title={errorMessage(goals.error)} />
      ) : !goals.data ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : goals.data.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          {t(canManage ? "empty" : "emptyReadOnly")}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary">
          {goals.data.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              onEdit={canManage ? () => setEditing(goal) : undefined}
              onDelete={canManage ? () => setDeleting(goal) : undefined}
            />
          ))}
        </ul>
      )}
      {canManage ? (
        <>
          <GoalFormModal
            open={editing !== undefined}
            clientId={clientId}
            goal={editing ?? null}
            onClose={() => setEditing(undefined)}
          />
          <DeleteConfirmModal
            open={deleting !== null}
            loading={remove.isPending}
            title={t("deleteTitle")}
            question={t("deleteQuestion")}
            confirmLabel={t("delete")}
            onCancel={() => setDeleting(null)}
            onConfirm={onDelete}
          />
        </>
      ) : null}
    </section>
  );
}
