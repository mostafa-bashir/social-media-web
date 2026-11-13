"use client";

import { Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormatter, useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";

import type { QueueHealth } from "../types/health";

/** Job counts per background queue; failed jobs open a drawer to triage them. */
export default function QueuesTable({
  queues,
  onOpenFailed,
}: {
  queues: QueueHealth[];
  onOpenFailed: (queue: string) => void;
}) {
  const t = useTranslations("admin.health.queues");
  const format = useFormatter();
  const number = (value: number) => format.number(value);

  const columns: ColumnsType<QueueHealth> = [
    {
      title: t("queue"),
      dataIndex: "name",
      render: (name: string, queue) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm" dir="ltr">
            {t.has(`names.${name}`) ? t(`names.${name}`) : name}
          </span>
          {queue.available ? null : (
            <Tag color="orange">{t("unavailable")}</Tag>
          )}
        </span>
      ),
    },
    { title: t("waiting"), dataIndex: "waiting", width: 100, render: number },
    { title: t("active"), dataIndex: "active", width: 90, render: number },
    {
      title: t("delayed"),
      dataIndex: "delayed",
      width: 100,
      responsive: ["md"],
      render: number,
    },
    {
      title: t("failed"),
      dataIndex: "failed",
      width: 110,
      render: (failed: number, queue) =>
        failed > 0 ? (
          <Button
            size="small"
            danger
            type="link"
            onClick={() => onOpenFailed(queue.name)}
          >
            {t("viewFailed", { count: failed })}
          </Button>
        ) : (
          number(failed)
        ),
    },
    {
      title: t("workers"),
      dataIndex: "workers",
      width: 110,
      responsive: ["sm"],
      render: (workers: number) =>
        workers > 0 ? number(workers) : <Tag color="red">{t("noWorker")}</Tag>,
    },
  ];

  return (
    <ListingTable<QueueHealth>
      rowKey="name"
      columns={columns}
      dataSource={queues}
      pagination={false}
      emptyTitle={t("empty")}
    />
  );
}
