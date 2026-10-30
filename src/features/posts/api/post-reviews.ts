import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

export const REVIEW_ACTIONS = [
  "submitted",
  "approved",
  "changes_requested",
  "withdrawn",
] as const;

const reviewSchema = z.object({
  id: z.string(),
  action: z.enum(REVIEW_ACTIONS),
  actor: z
    .object({
      userId: z.string(),
      name: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
  comment: z.string().nullable(),
  createdAt: z.string(),
});
export type PostReview = z.infer<typeof reviewSchema>;

/** The approval trail of a post; refreshed with every post change. */
export function usePostReviews(postId: string) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.posts(slug), "reviews", postId],
    queryFn: async () =>
      parseData(
        z.array(reviewSchema),
        (await apiClient.get(`/posts/${postId}/reviews`)).data,
      ),
    enabled: Boolean(slug),
  });
}
