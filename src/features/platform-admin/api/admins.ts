import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { adminClient } from "@/lib/api/admin-client";
import { parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { type AdminRole, adminSchema } from "../types";

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admin.admins,
    queryFn: async () =>
      parseData(z.array(adminSchema), (await adminClient.get("/admins")).data),
  });
}

function useInvalidateAdmins() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog }),
    ]);
}

export interface InviteAdminInput {
  email: string;
  name: string;
  role: AdminRole;
}

export function useInviteAdmin() {
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: async (input: InviteAdminInput) =>
      parseData(adminSchema, (await adminClient.post("/admins", input)).data),
    onSuccess: invalidate,
  });
}

export function useUpdateAdmin() {
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: async ({
      id,
      ...changes
    }: {
      id: string;
      role?: AdminRole;
      isActive?: boolean;
    }) =>
      parseData(
        adminSchema,
        (await adminClient.patch(`/admins/${id}`, changes)).data,
      ),
    onSuccess: invalidate,
  });
}

export function useResendAdminInvite() {
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminClient.post(`/admins/${id}/resend-invite`);
    },
    onSuccess: invalidate,
  });
}
