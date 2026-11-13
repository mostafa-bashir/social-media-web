import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client";
import { parseData, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  adminUserDetailSchema,
  adminUserRowSchema,
  type UserAction,
  type UserStateFilter,
} from "../types/users";

export interface UserListFilters {
  page: number;
  pageSize: number;
  search?: string;
  state?: UserStateFilter;
}

export function useAdminUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: [...queryKeys.admin.users, "list", filters],
    queryFn: async () =>
      parsePaginated(
        adminUserRowSchema,
        (
          await adminClient.get("/users", {
            params: {
              page: filters.page,
              pageSize: filters.pageSize,
              search: filters.search || undefined,
              state: filters.state,
            },
          })
        ).data,
      ),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.admin.user(userId),
    queryFn: async () =>
      parseData(
        adminUserDetailSchema,
        (await adminClient.get(`/users/${userId}`)).data,
      ),
  });
}

/** One mutation for the account controls; each maps to `POST /users/:id/<action>`. */
export function useUserAction(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: UserAction) => {
      await adminClient.post(`/users/${userId}/${action}`);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog }),
      ]),
  });
}
