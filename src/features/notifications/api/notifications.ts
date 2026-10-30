import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

/** Badge refresh; there's no push channel, so the count is polled. */
const UNREAD_POLL_MS = 60_000;
const INBOX_PAGE_SIZE = 30;

export const notificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  resourceType: z.enum(["task", "post", "sprint"]),
  resourceId: z.string(),
  actor: z
    .object({
      userId: z.string(),
      name: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});
export type AppNotification = z.infer<typeof notificationSchema>;

export function useUnreadCount() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.notifications(slug), "unread-count"],
    queryFn: async () =>
      parseData(
        z.object({ count: z.number() }),
        (await apiClient.get("/notifications/unread-count")).data,
      ).count,
    enabled: Boolean(slug),
    refetchInterval: UNREAD_POLL_MS,
  });
}

/** Loaded only while the bell is open. */
export function useInbox(enabled: boolean) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.notifications(slug), "inbox"],
    queryFn: async () =>
      parsePaginated(
        notificationSchema,
        (
          await apiClient.get("/notifications", {
            params: { pageSize: INBOX_PAGE_SIZE },
          })
        ).data,
      ),
    enabled: Boolean(slug) && enabled,
  });
}

function useRefresh() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.notifications(slug),
    });
}

export function useMarkRead() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (notificationId: string) =>
      apiClient.post(`/notifications/${notificationId}/read`),
    onSuccess,
  });
}

export function useMarkAllRead() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: () => apiClient.post("/notifications/read-all"),
    onSuccess,
  });
}

const settingsSchema = z.object({ emailNotifications: z.boolean() });

export function useNotificationSettings(enabled: boolean) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.notifications(slug), "settings"],
    queryFn: async () =>
      parseData(
        settingsSchema,
        (await apiClient.get("/notifications/settings")).data,
      ),
    enabled: Boolean(slug) && enabled,
  });
}

export function useUpdateNotificationSettings() {
  const onSuccess = useRefresh();
  return useMutation({
    mutationFn: (emailNotifications: boolean) =>
      apiClient.patch("/notifications/settings", { emailNotifications }),
    onSuccess,
  });
}
