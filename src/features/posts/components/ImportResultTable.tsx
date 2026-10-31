"use client";

import { Table, type TableProps } from "antd";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";

import { usePostTime } from "../hooks/use-post-time";
import type { ImportIssue, ImportResult } from "../types";

type Row = ImportResult["rows"][number];

const PAGE_SIZE = 10;

/** The checked rows: when, where, and what's wrong with each. */
export default function ImportResultTable({
  result,
}: {
  result: ImportResult;
}) {
  const t = useTranslations("posts.import");
  const tIssues = useTranslations("posts.issues");
  const tPlatforms = useTranslations("common.platforms");
  const formatTime = usePostTime(result.timezone);

  const issueText = (issue: ImportIssue) => {
    const label = tIssues.has(issue.code)
      ? tIssues(issue.code)
      : t.has(`errors.${issue.code}`)
        ? t(`errors.${issue.code}`)
        : issue.code;
    if (!issue.detail) return label;
    const detail = tPlatforms.has(issue.detail)
      ? tPlatforms(issue.detail)
      : issue.detail;
    return `${label}: ${detail}`;
  };

  const columns: TableProps<Row>["columns"] = [
    { title: t("columns.line"), dataIndex: "line", width: 70 },
    {
      title: t("columns.when", { timezone: result.timezone }),
      key: "when",
      width: 180,
      render: (_, row) => (row.scheduledAt ? formatTime(row.scheduledAt) : "—"),
    },
    {
      title: t("columns.accounts"),
      key: "accounts",
      render: (_, row) => (
        <span className="inline-flex flex-wrap gap-2">
          {row.accounts.map((account) => (
            <span key={account.id} className="inline-flex items-center gap-1">
              <span aria-hidden>{PLATFORM_ICONS[account.platform]}</span>
              {account.name}
            </span>
          ))}
        </span>
      ),
    },
    {
      title: t("columns.status"),
      key: "status",
      render: (_, row) =>
        row.errors.length === 0 ? (
          <span className="text-growth-text">{t("ready")}</span>
        ) : (
          <ul className="flex flex-col text-danger-text">
            {row.errors.map((issue) => (
              <li key={`${issue.code}-${issue.detail ?? ""}`}>
                {issueText(issue)}
              </li>
            ))}
          </ul>
        ),
    },
  ];

  return (
    <Table<Row>
      size="small"
      rowKey="line"
      columns={columns}
      dataSource={result.rows}
      pagination={
        result.rows.length > PAGE_SIZE ? { pageSize: PAGE_SIZE } : false
      }
      scroll={{ x: true }}
    />
  );
}
