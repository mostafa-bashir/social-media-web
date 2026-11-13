import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { adminClient } from "@/lib/api/admin-client";
import { parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import {
  adminAnnouncementSchema,
  type AnnouncementInput,
} from "../types/announcements";

export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.admin.announcements,
    queryFn: async () =>
      parseData(
        z.array(adminAnnouncementSchema),
        (await adminClient.get("/announcements")).data,
      ),
  });
}

function useInvalidateAnnouncements() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.announcements,
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog }),
    ]);
}

/** Creates when `id` is absent, otherwise replaces that announcement. */
export function useSaveAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({
    mutationFn: async ({ id, ...input }: AnnouncementInput & { id?: string }) =>
      parseData(
        adminAnnouncementSchema,
        (id
          ? await adminClient.put(`/announcements/${id}`, input)
          : await adminClient.post("/announcements", input)
        ).data,
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteAnnouncement() {
  const invalidate = useInvalidateAnnouncements();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminClient.delete(`/announcements/${id}`);
    },
    onSuccess: invalidate,
  });
}
