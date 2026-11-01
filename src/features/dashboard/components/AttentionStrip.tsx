"use client";

import {
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DisconnectOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { StatusTone } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";

import {
  type AttentionKey,
  useDashboardAttention,
} from "../api/get-dashboard-counts";
import { useDashboardClient } from "../hooks/use-dashboard-client";
import AttentionItem from "./AttentionItem";

interface AttentionConfig {
  key: AttentionKey;
  icon: ReactNode;
  tone: StatusTone;
  pathname: (slug: string) => string;
  query?: Record<string, string>;
}

const ITEMS: AttentionConfig[] = [
  {
    key: "awaitingApproval",
    icon: <AuditOutlined />,
    tone: "accent",
    pathname: (slug) => routes.workspace(slug).posts,
    query: { status: "in_review" },
  },
  {
    key: "changesRequested",
    icon: <EditOutlined />,
    tone: "danger",
    pathname: (slug) => routes.workspace(slug).posts,
    query: { status: "changes_requested" },
  },
  {
    key: "failedPosts",
    icon: <ExclamationCircleOutlined />,
    tone: "danger",
    pathname: (slug) => routes.workspace(slug).posts,
    // Same statuses the summary counts.
    query: { status: "failed,partially_failed" },
  },
  {
    key: "reconnectAccounts",
    icon: <DisconnectOutlined />,
    tone: "danger",
    pathname: (slug) => routes.workspace(slug).accounts,
    query: { status: "reconnect_required" },
  },
  {
    key: "overdueTasks",
    icon: <ClockCircleOutlined />,
    tone: "accent",
    pathname: (slug) => routes.workspace(slug).tasks,
    query: { view: "list", assigneeId: "me", due: "overdue" },
  },
];

/** Problems first: only non-zero items show; all clear gets a quiet note. */
export default function AttentionStrip() {
  const t = useTranslations("dashboard.attention");
  const slug = useActiveWorkspaceSlug() ?? "";
  const { clientId } = useDashboardClient();
  const counts = useDashboardAttention(clientId);

  if (counts.isLoading) {
    return (
      <div className="surface-card mb-6">
        <Skeleton.Input active block />
      </div>
    );
  }
  if (!counts.data) return null;

  const attention = counts.data;
  const visible = ITEMS.filter((item) => (attention[item.key] ?? 0) > 0);
  const anyAllowed = ITEMS.some((item) => attention[item.key] !== null);
  if (!anyAllowed) return null;

  return (
    <section className="surface-card mb-6" aria-label={t("title")}>
      {visible.length === 0 ? (
        <p className="flex items-center gap-2 px-3 py-2 text-sm text-growth-text">
          <CheckCircleOutlined aria-hidden />
          {t("allClear")}
        </p>
      ) : (
        <>
          <h2 className="px-3 pb-2 pt-1 text-sm font-semibold text-text-secondary">
            {t("title")}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2">
            {visible.map((item) => (
              <AttentionItem
                key={item.key}
                icon={item.icon}
                tone={item.tone}
                count={attention[item.key] ?? 0}
                label={t(item.key, { count: attention[item.key] ?? 0 })}
                href={{
                  pathname: item.pathname(slug),
                  query: {
                    ...item.query,
                    ...(clientId ? { clientId } : {}),
                  },
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
