"use client";

import { Result, Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

/**
 * Landing page for "Open as owner" in the admin console: exchanges the
 * one-time code for a support session, then enters the workspace. An agency
 * session already open in this browser is signed out properly first, so its
 * refresh token is revoked rather than left valid behind the support session.
 */
async function openSupportSession(code: string) {
  if (await getSession()) {
    await signOut({ redirect: false });
  }
  return signIn("credentials", {
    method: "impersonation",
    code,
    redirect: false,
  });
}

export default function ImpersonationHandoff() {
  const t = useTranslations("auth.impersonation");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const code = useSearchParams().get("code");
  const [error, setError] = useState<string | null>(
    code ? null : errorMessage("INVALID_OR_EXPIRED_LINK"),
  );
  // Strict mode runs effects twice; the code only works once.
  const started = useRef(false);

  useEffect(() => {
    if (!code || started.current) {
      return;
    }
    started.current = true;
    // Keep the code out of history and any later Referer header.
    window.history.replaceState(null, "", window.location.pathname);
    void openSupportSession(code).then((result) => {
      if (!result || result.error) {
        setError(errorMessage(result?.code ?? "INVALID_OR_EXPIRED_LINK"));
        return;
      }
      // Full navigation so the app renders with the new session cookie.
      window.location.replace(`/${locale}`);
    });
  }, [code, errorMessage, locale]);

  if (error) {
    return (
      <Result
        status="warning"
        title={t("failedTitle")}
        subTitle={error}
        extra={<Link href={routes.admin.home}>{t("backToConsole")}</Link>}
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-text-secondary">
      <Spin size="large" />
      {t("opening")}
    </div>
  );
}
