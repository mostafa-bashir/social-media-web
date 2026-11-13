import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client";
import { parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { adminAuditEntrySchema } from "../types";

export interface AdminAuditFilters {
  page: number;
  pageSize: number;
  adminId?: string;
  action?: string;
}

export function useAdminAuditLog(filters: AdminAuditFilters) {
  return useQuery({
    queryKey: [...queryKeys.admin.auditLog, filters],
    queryFn: async () =>
      parsePaginated(
        adminAuditEntrySchema,
        (
          await adminClient.get("/audit-log", {
            params: {
              page: filters.page,
              pageSize: filters.pageSize,
              adminId: filters.adminId || undefined,
              action: filters.action || undefined,
            },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
  });
}
