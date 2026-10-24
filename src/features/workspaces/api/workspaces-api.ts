import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { z } from "zod";

import { apiClient, parseData } from "@/lib/api/api-client";
import {
  sessionUserSchema,
  workspaceSummarySchema,
} from "@/lib/auth/session-types";

import { workspaceKeys } from "./query-keys";

const meSchema = z.object({
  user: sessionUserSchema,
  activeWorkspace: workspaceSummarySchema.nullable(),
  workspaces: z.array(workspaceSummarySchema),
});

const workspaceDetailsSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  timezone: z.string(),
  locale: z.string(),
  logoUrl: z.string().nullable(),
  createdAt: z.string(),
});
export type WorkspaceDetails = z.infer<typeof workspaceDetailsSchema>;

const currentMemberSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
  roleSlug: z.string(),
  permissions: z.array(z.string()),
});
export type CurrentMember = z.infer<typeof currentMemberSchema>;

const slugAvailabilitySchema = z.object({
  available: z.boolean(),
  reason: z.enum(["invalid", "reserved", "taken"]).nullable(),
});

export function useMe() {
  return useQuery({
    queryKey: workspaceKeys.me,
    queryFn: async () =>
      parseData(meSchema, (await apiClient.get("/auth/me")).data),
  });
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  timezone?: string;
  locale?: string;
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) =>
      parseData(
        workspaceSummarySchema,
        (await apiClient.post("/workspaces", input)).data,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: workspaceKeys.me }),
  });
}

export function slugAvailabilityQuery(slug: string) {
  return queryOptions({
    queryKey: workspaceKeys.slugAvailability(slug),
    queryFn: async () =>
      parseData(
        slugAvailabilitySchema,
        (
          await apiClient.get("/workspaces/slug-availability", {
            params: { slug },
          })
        ).data,
      ),
    staleTime: 10_000,
  });
}

/** Slug of the workspace the session is currently in (what the API scopes to). */
export function useActiveWorkspaceSlug(): string | null {
  return useSession().data?.activeWorkspace?.slug ?? null;
}

export function useWorkspaceDetails() {
  const slug = useActiveWorkspaceSlug();
  return useQuery({
    queryKey: workspaceKeys.details(slug ?? ""),
    queryFn: async () =>
      parseData(
        workspaceDetailsSchema,
        (await apiClient.get("/workspace")).data,
      ),
    enabled: Boolean(slug),
  });
}

export type UpdateWorkspaceInput = Partial<
  Pick<WorkspaceDetails, "name" | "timezone" | "locale" | "logoUrl">
>;

export function useUpdateWorkspace() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateWorkspaceInput) =>
      parseData(
        workspaceDetailsSchema,
        (await apiClient.patch("/workspace", input)).data,
      ),
    onSuccess: (details) => {
      queryClient.setQueryData(workspaceKeys.details(slug), details);
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.me });
    },
  });
}

export function useCurrentMember() {
  const slug = useActiveWorkspaceSlug();
  return useQuery({
    queryKey: workspaceKeys.currentMember(slug ?? ""),
    queryFn: async () =>
      parseData(currentMemberSchema, (await apiClient.get("/members/me")).data),
    enabled: Boolean(slug),
  });
}
