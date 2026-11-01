import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { platformSchema } from "@/config/platforms";
import { postStatusSchema } from "@/config/post-statuses";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

const upcomingPostSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  captionExcerpt: z.string(),
  status: postStatusSchema,
  scheduledAt: z.string(),
  targets: z.array(
    z.object({ platform: platformSchema, accountName: z.string() }),
  ),
});
export type UpcomingPost = z.infer<typeof upcomingPostSchema>;

const upcomingPostsSchema = z.object({
  late: z.array(upcomingPostSchema),
  /** All late posts; `late` holds only the most overdue few. */
  lateTotal: z.number(),
  upcoming: z.array(upcomingPostSchema),
});

/**
 * Late posts (past their slot, not out yet) then next week's, soonest first.
 * Keyed under posts so post edits refresh it.
 */
export function useUpcomingPosts(enabled: boolean, clientId?: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [
      ...queryKeys.posts(slug),
      "dashboard-upcoming",
      clientId ?? null,
    ],
    queryFn: async () =>
      parseData(
        upcomingPostsSchema,
        (
          await apiClient.get("/dashboard/upcoming-posts", {
            params: { clientId },
          })
        ).data,
      ),
    enabled: enabled && Boolean(slug),
  });
}
