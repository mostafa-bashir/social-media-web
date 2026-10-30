"use client";

import { Modal, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { Sprint } from "../types";

const BACKLOG = "backlog";

export interface CompleteSprintModalProps {
  sprint: Sprint | null;
  /** Planned sprints that can take the unfinished work. */
  planned: Sprint[];
  loading: boolean;
  onCancel: () => void;
  onConfirm: (moveOpenTo: string | null) => void;
}

/** Finish the active sprint and choose where unfinished tasks go. */
export default function CompleteSprintModal({
  sprint,
  planned,
  loading,
  onCancel,
  onConfirm,
}: CompleteSprintModalProps) {
  const t = useTranslations("tasks.sprints.complete");
  const [target, setTarget] = useState<string>(planned[0]?.id ?? BACKLOG);
  const open = sprint !== null;
  const unfinished = sprint ? sprint.taskCount - sprint.doneCount : 0;

  return (
    <Modal
      open={open}
      title={t("title", { name: sprint?.name ?? "" })}
      okText={t("confirm")}
      okButtonProps={{ loading, className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      onCancel={onCancel}
      onOk={() => onConfirm(target === BACKLOG ? null : target)}
      destroyOnHidden
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-secondary">
          {t("summary", {
            done: sprint?.doneCount ?? 0,
            unfinished,
          })}
        </p>
        {unfinished > 0 ? (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">
              {t("moveTo")}
            </span>
            <Select<string>
              value={target}
              onChange={setTarget}
              options={[
                ...planned.map((next) => ({
                  value: next.id,
                  label: next.name,
                })),
                { value: BACKLOG, label: t("backlog") },
              ]}
            />
          </label>
        ) : null}
      </div>
    </Modal>
  );
}
