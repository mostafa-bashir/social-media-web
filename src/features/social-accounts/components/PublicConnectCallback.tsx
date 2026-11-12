"use client";

import { Button, Result, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import PlatformBadge from "@/components/ui/PlatformBadge";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useIsClient } from "@/hooks/use-is-client";
import { toApiError } from "@/lib/api/api-error";

import { useCompleteLinkConnect } from "../api/public-connect";
import { readConnectToken } from "../lib/connect-nonce";
import {
  CONNECT_ERROR_CODES,
  type ConnectErrorCode,
  platformSchema,
} from "../types";
import PublicAccountPicker, { type ConnectResult } from "./PublicAccountPicker";
import PublicConnectShell from "./PublicConnectShell";

export interface PublicConnectCallbackProps {
  platform?: string;
  state?: string;
  code?: string;
  error?: string;
}

const isConnectError = (code: string): code is ConnectErrorCode =>
  CONNECT_ERROR_CODES.includes(code as ConnectErrorCode);

/**
 * Back from the platform: finish the connect in the tab that opened the
 * link (it holds the nonce), pick accounts, then say what was connected.
 */
export default function PublicConnectCallback({
  platform,
  state,
  code,
  error,
}: PublicConnectCallbackProps) {
  const t = useTranslations("accounts.publicConnect");
  const tErrors = useTranslations("accounts.connectErrors");
  const complete = useCompleteLinkConnect();
  const [connected, setConnected] = useState<ConnectResult | null>(null);
  // The state is single-use: never send it twice (e.g. Strict Mode re-runs effects).
  const sent = useRef(false);
  const parsedPlatform = platformSchema.safeParse(platform);
  const usable = parsedPlatform.success && Boolean(state);
  const failure = !usable
    ? "STATE_INVALID"
    : complete.error
      ? toApiError(complete.error).code
      : null;

  useEffect(() => {
    if (sent.current || !parsedPlatform.success || !state) return;
    sent.current = true;
    complete.mutate({ platform: parsedPlatform.data, state, code, error });
    // Runs once per landing; the inputs come from the URL and never change here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session storage exists only in the browser: read it after hydration.
  const isClient = useIsClient();
  const token = isClient ? readConnectToken() : "";
  if (failure) {
    return (
      <PublicConnectShell showLocaleSwitcher={false}>
        <Result
          status={failure === "ACCESS_DENIED" ? "warning" : "error"}
          title={t("failed")}
          subTitle={isConnectError(failure) ? tErrors(failure) : t("goneHint")}
          extra={
            token ? (
              <Link href={routes.connectLink(token)}>
                <Button type="primary" className="rounded-full!">
                  {t("startAgain")}
                </Button>
              </Link>
            ) : null
          }
        />
      </PublicConnectShell>
    );
  }
  if (connected) {
    return (
      <PublicConnectShell showLocaleSwitcher={false}>
        <Result
          status="success"
          title={t("doneTitle")}
          subTitle={t("doneHint")}
          extra={
            <ul className="flex flex-col items-center gap-2">
              {connected.map((account) => (
                <li
                  key={`${account.platform}:${account.displayName}`}
                  className="flex items-center gap-2"
                >
                  <PlatformBadge platform={account.platform} />
                  <span className="font-medium text-text-primary">
                    {account.displayName}
                  </span>
                </li>
              ))}
            </ul>
          }
        />
      </PublicConnectShell>
    );
  }
  return (
    <PublicConnectShell showLocaleSwitcher={false}>
      {complete.data ? (
        <PublicAccountPicker
          selectionKey={complete.data.selectionKey}
          onDone={setConnected}
        />
      ) : (
        <div className="flex items-center gap-3" role="status">
          <Spin />
          <span className="text-sm text-text-secondary">{t("finishing")}</span>
        </div>
      )}
    </PublicConnectShell>
  );
}
