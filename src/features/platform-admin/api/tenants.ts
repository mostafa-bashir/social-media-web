import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";

import { adminClient } from "@/lib/api/admin-client";
import { parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  adminTenantAccountSchema,
  adminTenantActivitySchema,
  adminTenantDetailSchema,
  adminTenantMemberSchema,
  adminTenantRowSchema,
  type TenantStatus,
} from "../types/tenants";

export interface TenantListFilters {
  page: number;
  pageSize: number;
  search?: string;
  status?: TenantStatus;
}

export function useAdminTenants(filters: TenantListFilters) {
  return useQuery({
    queryKey: [...queryKeys.admin.tenants, "list", filters],
    queryFn: async () =>
      parsePaginated(
        adminTenantRowSchema,
        (
          await adminClient.get("/tenants", {
            params: {
              page: filters.page,
              pageSize: filters.pageSize,
              search: filters.search || undefined,
              status: filters.status,
            },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
  });
}

export function useAdminTenant(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.admin.tenant(tenantId),
    queryFn: async () =>
      parseData(
        adminTenantDetailSchema,
        (await adminClient.get(`/tenants/${tenantId}`)).data,
      ),
  });
}

export function useTenantMembers(tenantId: string) {
  return useQuery({
    queryKey: [...queryKeys.admin.tenant(tenantId), "members"],
    queryFn: async () =>
      parseData(
        z.array(adminTenantMemberSchema),
        (await adminClient.get(`/tenants/${tenantId}/members`)).data,
      ),
  });
}

export function useTenantAccounts(tenantId: string) {
  return useQuery({
    queryKey: [...queryKeys.admin.tenant(tenantId), "social-accounts"],
    queryFn: async () =>
      parseData(
        z.array(adminTenantAccountSchema),
        (await adminClient.get(`/tenants/${tenantId}/social-accounts`)).data,
      ),
  });
}

export function useTenantActivity(
  tenantId: string,
  page: number,
  pageSize: number,
) {
  return useQuery({
    queryKey: [...queryKeys.admin.tenant(tenantId), "activity", page],
    queryFn: async () =>
      parsePaginated(
        adminTenantActivitySchema,
        (
          await adminClient.get(`/tenants/${tenantId}/activity`, {
            params: { page, pageSize },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateTenants() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.tenants }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog }),
    ]);
}

export function useSetTenantStatus(tenantId: string) {
  const invalidate = useInvalidateTenants();
  return useMutation({
    mutationFn: async (action: "suspend" | "reactivate") => {
      await adminClient.post(`/tenants/${tenantId}/${action}`);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTenant(tenantId: string) {
  const invalidate = useInvalidateTenants();
  return useMutation({
    mutationFn: async (confirmSlug: string) => {
      await adminClient.delete(`/tenants/${tenantId}`, {
        data: { confirmSlug },
      });
    },
    onSuccess: invalidate,
  });
}
