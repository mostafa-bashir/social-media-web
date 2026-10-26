import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/api-client";

/** "Sync now": queues the account's sync. The API answers 429 while the cooldown runs. */
export function useSyncAccountNow() {
  return useMutation({
    mutationFn: async (accountId: string) => {
      await apiClient.post(`/analytics/accounts/${accountId}/sync`);
    },
  });
}
