"use client";

import { SyncOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { queryKeys } from "@/lib/query-keys";

import { useSyncAccountNow } from "../api/sync-account";
import type { AnalyticsAccount } from "../types";

/** How often the reports are re-read while waiting, and for how long at most. */
const POLL_EVERY_MS = 10_000;
const GIVE_UP_AFTER_MS = 2 * 60_000;

interface Waiting {
  since: number;
  /** The account's last sync time when the button was pressed. */
  baseline: string | null;
}

/** Queues a sync, then refreshes the reports until the account's figures move on. */
export default function SyncNowButton({
  account,
  size,
}: {
  account: AnalyticsAccount;
  size?: "small" | "middle";
}) {
  const t = useTranslations("analytics.sync");
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const sync = useSyncAccountNow();
  const [waiting, setWaiting] = useState<Waiting | null>(null);
  // The timer reads the newest sync time without restarting on every refetch.
  const syncedAt = useRef(account.analyticsSyncedAt);
  useEffect(() => {
    syncedAt.current = account.analyticsSyncedAt;
  }, [account.analyticsSyncedAt]);
  // The button calms down as soon as fresh figures arrive.
  const syncing =
    waiting !== null && account.analyticsSyncedAt === waiting.baseline;

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => {
      if (syncedAt.current !== waiting.baseline) {
        setWaiting(null);
        message.success(t("done"));
      } else if (Date.now() - waiting.since > GIVE_UP_AFTER_MS) {
        setWaiting(null);
        message.info(t("stillRunning"));
      } else {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.analytics(slug),
        });
      }
    }, POLL_EVERY_MS);
    return () => clearInterval(timer);
  }, [waiting, queryClient, slug, message, t]);

  if (!account.analyticsEnabled) return null;

  return (
    <Button
      size={size}
      icon={<SyncOutlined spin={syncing} />}
      loading={sync.isPending}
      disabled={syncing}
      className="rounded-full!"
      onClick={() =>
        sync.mutate(account.id, {
          onSuccess: () =>
            setWaiting({
              since: Date.now(),
              baseline: account.analyticsSyncedAt,
            }),
          onError: (error) => message.warning(errorMessage(error)),
        })
      }
    >
      {syncing ? t("syncing") : t("syncNow")}
    </Button>
  );
}
