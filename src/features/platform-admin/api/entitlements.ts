import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client";
import { parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  type EntitlementsInput,
  tenantEntitlementsSchema,
} from "../types/entitlements";

const entitlementsKey = (tenantId: string) => [
  ...queryKeys.admin.tenant(tenantId),
  "entitlements",
];

export function useTenantEntitlements(tenantId: string) {
  return useQuery({
    queryKey: entitlementsKey(tenantId),
    queryFn: async () =>
      parseData(
        tenantEntitlementsSchema,
        (await adminClient.get(`/tenants/${tenantId}/entitlements`)).data,
      ),
  });
}

export function useUpdateEntitlements(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EntitlementsInput) =>
      parseData(
        tenantEntitlementsSchema,
        (await adminClient.put(`/tenants/${tenantId}/entitlements`, input))
          .data,
      ),
    onSuccess: (saved) => {
      queryClient.setQueryData(entitlementsKey(tenantId), saved);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.auditLog,
      });
    },
  });
}
