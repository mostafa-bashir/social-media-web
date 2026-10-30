import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  burndownSchema,
  type SprintInput,
  sprintSchema,
  velocitySchema,
} from "../types";

export function useSprints() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: queryKeys.sprints(slug),
    queryFn: async () =>
      parseData(z.array(sprintSchema), (await apiClient.get("/sprints")).data),
    enabled: Boolean(slug),
  });
}

/** Burndown days are bucketed in the viewer's time zone. */
export function useBurndown(sprintId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return useQuery({
    queryKey: [...queryKeys.sprints(slug), "burndown", sprintId, timezone],
    queryFn: async () =>
      parseData(
        burndownSchema,
        (
          await apiClient.get(`/sprints/${sprintId}/burndown`, {
            params: { timezone },
          })
        ).data,
      ),
    enabled: Boolean(slug && sprintId),
  });
}

export function useVelocity() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.sprints(slug), "velocity"],
    queryFn: async () =>
      parseData(
        z.array(velocitySchema),
        (await apiClient.get("/sprints/velocity")).data,
      ),
    enabled: Boolean(slug),
  });
}

/** Sprint changes move tasks between sprints and the backlog: refresh both. */
function useInvalidate() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sprints(slug) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks(slug) });
  };
}

export function useSaveSprint() {
  const onSuccess = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...input }: SprintInput & { id?: string }) =>
      id
        ? apiClient.patch(`/sprints/${id}`, input)
        : apiClient.post("/sprints", input),
    onSuccess,
  });
}

export function useDeleteSprint() {
  const onSuccess = useInvalidate();
  return useMutation({
    mutationFn: (sprintId: string) => apiClient.delete(`/sprints/${sprintId}`),
    onSuccess,
  });
}

export function useStartSprint() {
  const onSuccess = useInvalidate();
  return useMutation({
    mutationFn: (sprintId: string) =>
      apiClient.post(`/sprints/${sprintId}/start`, {}),
    onSuccess,
  });
}

export function useCompleteSprint() {
  const onSuccess = useInvalidate();
  return useMutation({
    mutationFn: ({
      sprintId,
      moveOpenTo,
    }: {
      sprintId: string;
      moveOpenTo: string | null;
    }) => apiClient.post(`/sprints/${sprintId}/complete`, { moveOpenTo }),
    onSuccess,
  });
}
