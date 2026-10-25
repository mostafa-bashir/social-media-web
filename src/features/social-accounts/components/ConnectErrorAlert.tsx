"use client";

import { Alert } from "antd";
import { useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";

import { CONNECT_ERROR_CODES, type ConnectErrorCode } from "../types";

const isConnectError = (value?: string): value is ConnectErrorCode =>
  CONNECT_ERROR_CODES.includes(value as ConnectErrorCode);

/** Explains why the platform sent the user back (`?connectError=`). */
export default function ConnectErrorAlert({ code }: { code?: string }) {
  const t = useTranslations("accounts.connectErrors");
  const router = useRouter();
  const pathname = usePathname();
  if (!isConnectError(code)) {
    return null;
  }

  return (
    <Alert
      type={code === "ACCESS_DENIED" ? "warning" : "error"}
      showIcon
      closable={{ onClose: () => router.replace(pathname) }}
      title={t(code)}
      className="mb-4!"
    />
  );
}
