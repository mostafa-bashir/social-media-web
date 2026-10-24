import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

const SLUG_CHECK_STALE_MS = 10_000;

const slugAvailabilitySchema = z.object({
  available: z.boolean(),
  reason: z.enum(["invalid", "reserved", "taken"]).nullable(),
});

export const getSlugAvailabilityQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.slugAvailability(slug),
    queryFn: async () =>
      parseData(
        slugAvailabilitySchema,
        (
          await apiClient.get("/workspaces/slug-availability", {
            params: { slug },
          })
        ).data,
      ),
    staleTime: SLUG_CHECK_STALE_MS,
  });
