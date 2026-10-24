import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { apiClient } from "@/lib/api/api-client";

/** Public auth endpoints. Sign-in itself goes through Auth.js (`signIn`). */

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export function useRegister() {
  const locale = useLocale();
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiClient.post("/auth/register", { ...input, locale }),
  });
}

export function useResendVerification() {
  const locale = useLocale();
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post("/auth/resend-verification", { email, locale }),
  });
}

export function useForgotPassword() {
  const locale = useLocale();
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post("/auth/forgot-password", { email, locale }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      apiClient.post("/auth/reset-password", input),
  });
}
