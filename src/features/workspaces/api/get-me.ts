import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient, parseData } from "@/lib/api/api-client";
import {
  sessionUserSchema,
  workspaceSummarySchema,
} from "@/lib/auth/session-types";
import { queryKeys } from "@/lib/query-keys";

const meSchema = z.object({
  user: sessionUserSchema,
  activeWorkspace: workspaceSummarySchema.nullable(),
  workspaces: z.array(workspaceSummarySchema),
});
export type Me = z.infer<typeof meSchema>;

export const getMeQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.me,
    queryFn: async () =>
      parseData(meSchema, (await apiClient.get("/auth/me")).data),
  });

export const useMe = () => useQuery(getMeQueryOptions());
