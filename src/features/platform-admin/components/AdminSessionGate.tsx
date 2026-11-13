"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button, Result, Spin } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect } from "react";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { ADMIN_REFRESH_LEAD_MS } from "@/lib/admin-auth/admin-session-shared";
import { setAdminApiSession } from "@/lib/api/admin-client";
import { queryKeys } from "@/lib/query-keys";

import {
  endAdminSession,
  fetchAdminSession,
  useAdminSessionQuery,
} from "../api/admin-session";

const MIN_TIMER_MS = 5_000;

/**
 * Loads the admin session, keeps `adminClient`'s token fresh, and sends the
 * browser to the admin sign-in when the session ends.
 */
export default function AdminSessionGate({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations("admin");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const session = useAdminSessionQuery();
  const data = session.data;

  useEffect(() => {
    // The session is already dead here; leave for sign-in whatever the cleanup says.
    const goToLogin = () => {
      void endAdminSession()
        .catch(() => undefined)
        .finally(() =>
          window.location.assign(`/${locale}${routes.admin.login}`),
        );
    };
    const renew = async () => {
      const next = await queryClient.fetchQuery({
        queryKey: queryKeys.admin.session,
        queryFn: fetchAdminSession,
        staleTime: 0,
      });
      return next?.accessToken ?? null;
    };

    setAdminApiSession(data?.accessToken ?? null, renew, goToLogin);
    if (session.isSuccess && !data) {
      goToLogin();
      return;
    }
    if (!data) {
      return;
    }
    const delay = Math.max(
      data.accessTokenExpiresAt - Date.now() - ADMIN_REFRESH_LEAD_MS,
      MIN_TIMER_MS,
    );
    const timer = window.setTimeout(() => void renew(), delay);
    return () => window.clearTimeout(timer);
  }, [data, session.isSuccess, locale, queryClient]);

  if (session.error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <Result
          status="warning"
          title={errorMessage(session.error)}
          extra={
            <Button
              type="primary"
              className="rounded-full!"
              onClick={() => void session.refetch()}
            >
              {t("retry")}
            </Button>
          }
        />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }
  return children;
}
