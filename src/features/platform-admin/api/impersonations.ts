import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { adminClient } from "@/lib/api/admin-client";
import { parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { adminImpersonationSchema } from "../types/tenants";

const HISTORY_PAGE_SIZE = 20;

export function useTenantImpersonations(tenantId: string) {
  return useQuery({
    queryKey: [...queryKeys.admin.impersonations, tenantId],
    queryFn: async () =>
      parsePaginated(
        adminImpersonationSchema,
        (
          await adminClient.get("/impersonations", {
            params: { tenantId, pageSize: HISTORY_PAGE_SIZE },
          })
        ).data,
      ),
  });
}

function useInvalidateImpersonations() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.impersonations,
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog }),
    ]);
}

/** Returns the one-time code the handoff page exchanges for a session. */
export function useStartImpersonation() {
  const invalidate = useInvalidateImpersonations();
  return useMutation({
    mutationFn: async (input: { tenantId: string; reason: string }) =>
      parseData(
        z.object({ id: z.string(), code: z.string() }),
        (await adminClient.post("/impersonations", input)).data,
      ),
    onSuccess: invalidate,
  });
}

export function useEndImpersonation() {
  const invalidate = useInvalidateImpersonations();
  return useMutation({
    mutationFn: async (impersonationId: string) => {
      await adminClient.post(`/impersonations/${impersonationId}/end`);
    },
    onSuccess: invalidate,
  });
}
