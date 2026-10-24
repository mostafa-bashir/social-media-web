import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { workspaceSummarySchema } from "@/lib/auth/session-types";
import { queryKeys } from "@/lib/query-keys";

import { type WorkspaceDetails, workspaceDetailsSchema } from "./get-workspace";

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  timezone?: string;
  locale?: string;
}

export type UpdateWorkspaceInput = Partial<
  Pick<WorkspaceDetails, "name" | "timezone" | "locale" | "logoUrl">
>;

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) =>
      parseData(
        workspaceSummarySchema,
        (await apiClient.post("/workspaces", input)).data,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useUpdateWorkspace() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateWorkspaceInput) =>
      parseData(
        workspaceDetailsSchema,
        (await apiClient.patch("/workspace", input)).data,
      ),
    onSuccess: (details) => {
      queryClient.setQueryData(queryKeys.workspaceDetails(slug), details);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

/** Irreversible. The API requires the slug to be typed back. */
export function useDeleteWorkspace() {
  return useMutation({
    mutationFn: (confirmSlug: string) =>
      apiClient.delete("/workspace", { data: { confirmSlug } }),
  });
}
