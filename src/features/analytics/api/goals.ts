import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

export const GOAL_METRICS = ["followerGrowth", "views", "engagements"] as const;
export type GoalMetric = (typeof GOAL_METRICS)[number];
export const GOAL_STATUSES = [
  "upcoming",
  "onTrack",
  "behind",
  "achieved",
  "missed",
  "noData",
] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];
/** The API's limits. */
export const MAX_GOALS_PER_CLIENT = 20;
export const MAX_GOAL_DAYS = 366;

export const goalSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  metric: z.enum(GOAL_METRICS),
  target: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
  progress: z.object({
    actual: z.number().nullable(),
    expected: z.number(),
    ratio: z.number().nullable(),
    status: z.enum(GOAL_STATUSES),
    elapsedDays: z.number(),
    totalDays: z.number(),
  }),
});
export type Goal = z.infer<typeof goalSchema>;

export interface GoalInput {
  metric: GoalMetric;
  target: number;
  startDate: string;
  endDate: string;
}

const goalsKey = (slug: string, clientId?: string) => [
  ...queryKeys.analytics(slug),
  "goals",
  clientId,
];

export function useGoals(clientId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: goalsKey(slug, clientId),
    queryFn: async () =>
      parseData(
        z.array(goalSchema),
        (await apiClient.get("/analytics/goals", { params: { clientId } }))
          .data,
      ),
    enabled: Boolean(slug && clientId),
  });
}

function useInvalidateGoals() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return (clientId: string) =>
    queryClient.invalidateQueries({ queryKey: goalsKey(slug, clientId) });
}

export function useSaveGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: GoalInput & { clientId: string; id?: string }) =>
      parseData(
        goalSchema,
        (id
          ? await apiClient.patch(`/analytics/goals/${id}`, {
              metric: input.metric,
              target: input.target,
              startDate: input.startDate,
              endDate: input.endDate,
            })
          : await apiClient.post("/analytics/goals", input)
        ).data,
      ),
    onSuccess: (goal) => invalidate(goal.clientId),
  });
}

export function useDeleteGoal() {
  const invalidate = useInvalidateGoals();
  return useMutation({
    mutationFn: async (goal: Goal) => {
      await apiClient.delete(`/analytics/goals/${goal.id}`);
    },
    onSuccess: (_data, goal) => invalidate(goal.clientId),
  });
}
