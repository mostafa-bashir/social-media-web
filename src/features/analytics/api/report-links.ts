import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";

import { clientEnv } from "@/config/env";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { toApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";

import {
  REPORT_SECTIONS,
  type ReportSection,
  reportSchema,
} from "../types/report";

export const LINK_RANGE_DAYS = [7, 30, 90] as const;
export const LINK_EXPIRY_DAYS = [7, 30, 90, 365] as const;

export const reportLinkSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  sections: z.array(z.enum(REPORT_SECTIONS)),
  rangeDays: z.number(),
  expiresAt: z.string(),
  revokedAt: z.string().nullable(),
  lastViewedAt: z.string().nullable(),
  createdAt: z.string(),
  active: z.boolean(),
});
export type ReportLink = z.infer<typeof reportLinkSchema>;

const linksKey = (slug: string, clientId?: string) => [
  ...queryKeys.analytics(slug),
  "report-links",
  clientId,
];

export function useReportLinks(clientId: string | undefined, enabled: boolean) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: linksKey(slug, clientId),
    queryFn: async () =>
      parseData(
        z.array(reportLinkSchema),
        (
          await apiClient.get("/analytics/report-links", {
            params: { clientId },
          })
        ).data,
      ),
    enabled: Boolean(slug && clientId && enabled),
  });
}

export function useCreateReportLink() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      clientId: string;
      sections: ReportSection[];
      rangeDays: number;
      expiresInDays: number;
    }) =>
      parseData(
        z.object({ link: reportLinkSchema, token: z.string() }),
        (await apiClient.post("/analytics/report-links", input)).data,
      ),
    onSuccess: (_data, input) =>
      queryClient.invalidateQueries({
        queryKey: linksKey(slug, input.clientId),
      }),
  });
}

export function useRevokeReportLink() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (link: ReportLink) => {
      await apiClient.delete(`/analytics/report-links/${link.id}`);
    },
    onSuccess: (_data, link) =>
      queryClient.invalidateQueries({
        queryKey: linksKey(slug, link.clientId),
      }),
  });
}

/** No session and no workspace header: the token alone opens the report. */
const publicClient = axios.create({ baseURL: clientEnv.NEXT_PUBLIC_API_URL });

export function usePublicReport(token: string) {
  return useQuery({
    queryKey: ["public-report", token],
    queryFn: async () => {
      try {
        const response = await publicClient.get(
          `/public/reports/${encodeURIComponent(token)}`,
        );
        return parseData(
          z.object({ report: reportSchema, expiresAt: z.string() }),
          response.data,
        );
      } catch (error) {
        throw toApiError(error);
      }
    },
    retry: false,
  });
}
