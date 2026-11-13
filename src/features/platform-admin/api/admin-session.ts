import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";

import {
  type AdminBrowserSession,
  adminBrowserSessionSchema,
} from "@/lib/admin-auth/admin-session-shared";
import { adminClient } from "@/lib/api/admin-client";
import { toApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query-keys";

const SESSION_ENDPOINT = "/api/admin-session";

/** Same-origin route handler; null when there is no (renewable) admin session. */
export async function fetchAdminSession(): Promise<AdminBrowserSession | null> {
  try {
    const response = await axios.get<unknown>(SESSION_ENDPOINT);
    return z.object({ data: adminBrowserSessionSchema }).parse(response.data)
      .data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw toApiError(error);
  }
}

export function useAdminSessionQuery() {
  return useQuery({
    queryKey: queryKeys.admin.session,
    queryFn: fetchAdminSession,
    staleTime: Infinity,
    retry: false,
  });
}

/** Throws (an `ApiError`) when the server couldn't confirm the sign-out. */
export async function endAdminSession(): Promise<void> {
  try {
    await axios.delete(SESSION_ENDPOINT);
  } catch (error) {
    throw toApiError(error);
  }
}

/** Step 1: password, straight to the API (public route). */
export async function startAdminLogin(
  email: string,
  password: string,
): Promise<string> {
  const response = await adminClient.post<unknown>("/auth/login", {
    email,
    password,
  });
  return z
    .object({ data: z.object({ challengeToken: z.string() }) })
    .parse(response.data).data.challengeToken;
}

/** Step 2: emailed code, via the route handler that sets the session cookie. */
export async function finishAdminLogin(
  challengeToken: string,
  code: string,
): Promise<void> {
  try {
    await axios.post(`${SESSION_ENDPOINT}/verify`, { challengeToken, code });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function setAdminPassword(
  token: string,
  password: string,
): Promise<void> {
  await adminClient.post("/auth/setup-password", { token, password });
}
