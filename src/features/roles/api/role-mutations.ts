import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { type RoleInput, roleSchema } from "../types";

/** Invalidates every roles query (this list, member role pickers, dashboard tile). */
function useInvalidateRoles() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.roles(slug) });
}

export function useCreateRole() {
  const onSuccess = useInvalidateRoles();
  return useMutation({
    mutationFn: async (input: RoleInput) =>
      parseData(roleSchema, (await apiClient.post("/roles", input)).data),
    onSuccess,
  });
}

export function useUpdateRole() {
  const onSuccess = useInvalidateRoles();
  return useMutation({
    mutationFn: async ({ id, ...input }: RoleInput & { id: string }) =>
      parseData(
        roleSchema,
        (await apiClient.patch(`/roles/${id}`, input)).data,
      ),
    onSuccess,
  });
}

export function useDeleteRole() {
  const onSuccess = useInvalidateRoles();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/roles/${id}`),
    onSuccess,
  });
}
