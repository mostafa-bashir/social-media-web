import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug, workspaceKeys } from "@/features/workspaces";
import { apiClient, parseData } from "@/lib/api/api-client";

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  permissions: z.array(z.string()),
  memberCount: z.number(),
});
export type Role = z.infer<typeof roleSchema>;

const permissionSchema = z.object({
  slug: z.string(),
  groupKey: z.string(),
  sortOrder: z.number(),
});
export type PermissionInfo = z.infer<typeof permissionSchema>;

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

function roleKeys(slug: string) {
  return {
    all: [...workspaceKeys.scope(slug), "roles"] as const,
    permissions: [...workspaceKeys.scope(slug), "permissions"] as const,
  };
}

export function useRoles() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: roleKeys(slug).all,
    queryFn: async () =>
      parseData(z.array(roleSchema), (await apiClient.get("/roles")).data),
    enabled: Boolean(slug),
  });
}

export function usePermissionCatalog() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: roleKeys(slug).permissions,
    queryFn: async () =>
      parseData(
        z.array(permissionSchema),
        (await apiClient.get("/permissions")).data,
      ),
    enabled: Boolean(slug),
    staleTime: Infinity,
  });
}

function useInvalidateRoles() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: roleKeys(slug).all });
}

export function useCreateRole() {
  const invalidate = useInvalidateRoles();
  return useMutation({
    mutationFn: async (input: RoleInput) =>
      parseData(roleSchema, (await apiClient.post("/roles", input)).data),
    onSuccess: invalidate,
  });
}

export function useUpdateRole() {
  const invalidate = useInvalidateRoles();
  return useMutation({
    mutationFn: async ({ id, ...input }: RoleInput & { id: string }) =>
      parseData(
        roleSchema,
        (await apiClient.patch(`/roles/${id}`, input)).data,
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteRole() {
  const invalidate = useInvalidateRoles();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/roles/${id}`),
    onSuccess: invalidate,
  });
}
