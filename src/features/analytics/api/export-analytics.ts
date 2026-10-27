import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/api-client";

import type { AnalyticsScope } from "../types";

export const EXPORT_DATASETS = ["accounts", "daily", "posts"] as const;
export type ExportDataset = (typeof EXPORT_DATASETS)[number];

const FILENAME = /filename="([^"]+)"/;

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
      const disposition = String(response.headers["content-disposition"] ?? "");
      const filename =
        FILENAME.exec(disposition)?.[1] ?? `analytics-${dataset}.csv`;
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}
