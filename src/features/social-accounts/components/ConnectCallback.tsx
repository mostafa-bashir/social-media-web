"use client";

import { Alert, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link, useRouter } from "@/i18n/navigation";
import { toApiError } from "@/lib/api/api-error";

import { useCompleteConnect } from "../api/social-account-mutations";
import {
  CONNECT_ERROR_CODES,
  type ConnectErrorCode,
  platformSchema,
} from "../types";

export interface ConnectCallbackProps {
  platform?: string;
  state?: string;
  code?: string;
  error?: string;
}

const isConnectError = (code: string): code is ConnectErrorCode =>
  CONNECT_ERROR_CODES.includes(code as ConnectErrorCode);

/**
 * Landing page after the platform consent. It hands the result to the API
 * from this signed-in session, which is what proves the person finishing the
 * connection is the one who started it.
 */
export default function ConnectCallback({
  platform,
  state,
  code,
  error,
}: ConnectCallbackProps) {
  const t = useTranslations("accounts.callback");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const slug = useActiveWorkspaceSlug() ?? "";
  const complete = useCompleteConnect();
  // The state is single-use: never send it twice (e.g. Strict Mode re-runs effects).
  const sent = useRef(false);
  const accountsPath = routes.workspace(slug).accounts;

  useEffect(() => {
    if (sent.current || !slug) return;
    sent.current = true;
    const parsedPlatform = platformSchema.safeParse(platform);
    if (!parsedPlatform.success || !state) {
      router.replace(`${accountsPath}?connectError=STATE_INVALID`);
      return;
    }
    complete.mutate(
      { platform: parsedPlatform.data, state, code, error },
      {
        onSuccess: ({ selectionKey }) =>
          router.replace(`${accountsPath}/connect/${selectionKey}`),
        onError: (failure) => {
          const failureCode = toApiError(failure).code;
          if (isConnectError(failureCode)) {
            router.replace(`${accountsPath}?connectError=${failureCode}`);
          }
        },
      },
    );
    // Runs once per landing; the inputs come from the URL and never change here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (complete.error && !isConnectError(toApiError(complete.error).code)) {
    return (
      <Alert
        type="error"
        showIcon
        title={errorMessage(complete.error)}
        action={<Link href={accountsPath}>{t("back")}</Link>}
      />
    );
  }

  return (
    <section className="surface-card">
      <div className="surface-panel flex items-center gap-3" role="status">
        <Spin />
        <span className="text-sm text-text-secondary">{t("finishing")}</span>
      </div>
    </section>
  );
}
