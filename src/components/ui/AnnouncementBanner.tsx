"use client";

import { NotificationOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";

import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

/** Per workspace, so dismissing in one workspace doesn't hide it in another. */
const dismissedKey = (slug: string) => `sm:dismissed-announcements:${slug}`;
/** New notices appear without a reload, but this isn't worth polling hard. */
const REFRESH_MS = 5 * 60_000;

const announcementSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  severity: z.enum(["info", "warning"]),
});

/** Dismissals are a per-browser convenience; storage may be unavailable. */
function readDismissed(slug: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(dismissedKey(slug));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeDismissed(slug: string, ids: string[]): void {
  try {
    window.localStorage.setItem(dismissedKey(slug), JSON.stringify(ids));
  } catch {
    // Private mode or blocked storage: the banner simply returns next visit.
  }
}

/** Notices from the platform team (maintenance, news), dismissible per user. */
export default function AnnouncementBanner({ slug }: { slug: string }) {
  const t = useTranslations("common.announcements");
  // Announcements are fetched in the browser only, so nothing renders on the
  // server that this could disagree with.
  const [dismissed, setDismissed] = useState<string[]>(() =>
    readDismissed(slug),
  );
  const announcements = useQuery({
    queryKey: queryKeys.announcements(slug),
    queryFn: async () =>
      parseData(
        z.array(announcementSchema),
        (await apiClient.get("/announcements")).data,
      ),
    refetchInterval: REFRESH_MS,
  });

  const visible = (announcements.data ?? []).filter(
    (announcement) => !dismissed.includes(announcement.id),
  );
  if (visible.length === 0) {
    return null;
  }

  const dismiss = (id: string) => {
    // Keep only ids still live, so the list can't grow forever.
    const live = new Set((announcements.data ?? []).map((row) => row.id));
    const next = [...dismissed.filter((value) => live.has(value)), id];
    setDismissed(next);
    writeDismissed(slug, next);
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      {visible.map((announcement) => (
        <Alert
          key={announcement.id}
          type={announcement.severity}
          showIcon
          icon={<NotificationOutlined />}
          title={announcement.title}
          description={announcement.body}
          closable={{ "aria-label": t("dismiss") }}
          onClose={() => dismiss(announcement.id)}
        />
      ))}
    </div>
  );
}
