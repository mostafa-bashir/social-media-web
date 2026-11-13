import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/api-client";
import { filenameFrom, saveBlob } from "@/lib/download";

import type { AnalyticsScope } from "../types";

export const EXPORT_DATASETS = ["accounts", "daily", "posts"] as const;
export type ExportDataset = (typeof EXPORT_DATASETS)[number];

/** Downloads a CSV through the authenticated client, then saves it in the browser. */
export function useExportAnalytics() {
  return useMutation({
    mutationFn: async ({
      scope,
      dataset,
    }: {
      scope: AnalyticsScope;
      dataset: ExportDataset;
    }) => {
      const response = await apiClient.get<Blob>("/analytics/export", {
        params: { ...scope, dataset },
        responseType: "blob",
      });
      saveBlob(
        response.data,
        filenameFrom(
          response.headers["content-disposition"],
          `analytics-${dataset}.csv`,
        ),
      );
    },
  });
}
