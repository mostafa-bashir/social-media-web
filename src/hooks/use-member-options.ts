import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

export const memberOptionSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
});
export type MemberOption = z.infer<typeof memberOptionSchema>;

/** One page of matches; typing narrows it server-side, so every member is reachable. */
const MEMBER_OPTIONS_PAGE_SIZE = 50;

/**
 * Workspace members matching `search`, for assignee and mention pickers in any
 * feature. Own key under the members prefix, so member changes invalidate it.
 */
export function useMemberOptions(search: string, enabled = true) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.members(slug), "options", search],
    queryFn: async () =>
      parsePaginated(
        memberOptionSchema,
        (
          await apiClient.get("/members", {
            params: {
              pageSize: MEMBER_OPTIONS_PAGE_SIZE,
              search: search || undefined,
            },
          })
        ).data,
      ).data,
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(slug),
  });
}
