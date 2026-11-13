"use client";

import { Alert, App, Drawer, Empty, Pagination, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useAdminSessionQuery } from "../api/admin-session";
import { useFailedJobs, useJobAction } from "../api/health";
import type { FailedJob } from "../types/health";
import FailedJobItem from "./FailedJobItem";

/** Failed jobs of one queue, page by page; retry/remove for super admins. */
export default function FailedJobsDrawer({
  queue,
  onClose,
}: {
  queue: string | null;
  onClose: () => void;
}) {
  const t = useTranslations("admin.health.failedJobs");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const isSuperAdmin =
    useAdminSessionQuery().data?.admin.role === "super_admin";
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<FailedJob | null>(null);
  const jobs = useFailedJobs(queue, page);
  const action = useJobAction(queue ?? "");

  const run = (job: FailedJob, kind: "retry" | "remove") =>
    action.mutate(
      { jobId: job.id, action: kind },
      {
        onSuccess: () => {
          message.success(t(kind === "retry" ? "retried" : "removed"));
          setRemoving(null);
        },
        onError: (error) => message.error(errorMessage(error)),
      },
    );

  const close = () => {
    setPage(1);
    onClose();
  };

  return (
    <Drawer
      open={queue !== null}
      onClose={close}
      title={t("title", { queue: queue ?? "" })}
      size={520}
    >
      {jobs.error ? (
        <Alert type="error" showIcon title={errorMessage(jobs.error)} />
      ) : !jobs.data ? (
        <Skeleton active />
      ) : jobs.data.jobs.length === 0 ? (
        <Empty description={t("empty")} />
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3">
            {jobs.data.jobs.map((job) => (
              <FailedJobItem
                key={job.id}
                job={job}
                canManage={isSuperAdmin}
                busy={action.isPending}
                onRetry={() => run(job, "retry")}
                onRemove={() => setRemoving(job)}
              />
            ))}
          </ul>
          <Pagination
            align="center"
            size="small"
            current={page}
            pageSize={jobs.data.pageSize}
            total={jobs.data.total}
            hideOnSinglePage
            showSizeChanger={false}
            onChange={setPage}
          />
        </div>
      )}
      <DeleteConfirmModal
        open={removing !== null}
        title={t("removeTitle")}
        itemName={removing?.name}
        warning={t("removeWarning")}
        confirmLabel={t("remove")}
        loading={action.isPending}
        onCancel={() => setRemoving(null)}
        onConfirm={() => removing && run(removing, "remove")}
      />
    </Drawer>
  );
}
