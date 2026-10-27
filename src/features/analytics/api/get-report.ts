import { useQuery } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { type ReportSection, reportSchema } from "../types/report";

export interface ReportRequest {
  clientId?: string;
  from: string;
  to: string;
  sections: ReportSection[];
}

export function useReport(request: ReportRequest) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [...queryKeys.analytics(slug), "report", request],
    queryFn: async () =>
      parseData(
        reportSchema,
        (
          await apiClient.get("/analytics/report", {
            params: { ...request, sections: request.sections.join(",") },
          })
        ).data,
      ),
    enabled: Boolean(slug && request.clientId && request.sections.length),
  });
}
