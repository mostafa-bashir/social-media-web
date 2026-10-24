import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { permissionInfoSchema, roleSchema } from "../types";

export function useRoles() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.roles(slug), "list"],
    queryFn: async () =>
      parseData(z.array(roleSchema), (await apiClient.get("/roles")).data),
    enabled: Boolean(slug),
  });
}

export function usePermissionCatalog() {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: queryKeys.permissionCatalog(slug),
    queryFn: async () =>
      parseData(
        z.array(permissionInfoSchema),
        (await apiClient.get("/permissions")).data,
      ),
    enabled: Boolean(slug),
    staleTime: Infinity,
  });
}
