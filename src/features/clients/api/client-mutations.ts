import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { type ClientInput, clientSchema } from "../types";

/** Client changes also refresh the accounts listing, which shows client names. */
function useInvalidateClients() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.clients(slug) });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.socialAccounts(slug),
    });
  };
}

export function useCreateClient() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: async (input: ClientInput) =>
      parseData(clientSchema, (await apiClient.post("/clients", input)).data),
    onSuccess,
  });
}

export function useUpdateClient() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: async ({ id, ...input }: ClientInput & { id: string }) =>
      parseData(
        clientSchema,
        (await apiClient.patch(`/clients/${id}`, input)).data,
      ),
    onSuccess,
  });
}

export function useArchiveClient() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: (clientId: string) => apiClient.delete(`/clients/${clientId}`),
    onSuccess,
  });
}

export function useRestoreClient() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: (clientId: string) =>
      apiClient.post(`/clients/${clientId}/restore`),
    onSuccess,
  });
}

export function useConvertClient() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: async (clientId: string) =>
      parseData(
        clientSchema,
        (await apiClient.post(`/clients/${clientId}/convert`)).data,
      ),
    onSuccess,
  });
}

export function useSetPublicYoutube() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: async ({
      clientId,
      channel,
    }: {
      clientId: string;
      channel: string;
    }) =>
      parseData(
        clientSchema,
        (
          await apiClient.put(`/clients/${clientId}/public-youtube`, {
            channel,
          })
        ).data,
      ),
    onSuccess,
  });
}

export function useClearPublicYoutube() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: async (clientId: string) =>
      parseData(
        clientSchema,
        (await apiClient.delete(`/clients/${clientId}/public-youtube`)).data,
      ),
    onSuccess,
  });
}

export function useUploadClientLogo() {
  const onSuccess = useInvalidateClients();
  return useMutation({
    mutationFn: async ({
      clientId,
      file,
    }: {
      clientId: string;
      file: File;
    }) => {
      const body = new FormData();
      body.append("file", file);
      return parseData(
        clientSchema,
        (
          await apiClient.put(`/clients/${clientId}/logo`, body, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        ).data,
      );
    },
    onSuccess,
  });
}
