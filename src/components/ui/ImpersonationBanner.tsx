"use client";

import { SafetyCertificateOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { routes } from "@/config/routes";

/**
 * Always visible while a platform admin is acting as this user, so nobody
 * forgets whose access they are using. Ending returns them to the console.
 */
export default function ImpersonationBanner() {
  const t = useTranslations("common.impersonation");
  const format = useFormatter();
  const locale = useLocale();
  const session = useSession().data;
  const impersonation = session?.impersonation;
  if (!impersonation) {
    return null;
  }

  return (
    <Alert
      type="warning"
      showIcon
      icon={<SafetyCertificateOutlined />}
      className="mb-4!"
      title={t("title", { name: session.user.name })}
      description={t("description", {
        admin: impersonation.adminName,
        time: format.dateTime(new Date(impersonation.expiresAt), {
          timeStyle: "short",
        }),
      })}
      action={
        <Button
          size="small"
          danger
          className="rounded-full!"
          onClick={() =>
            void signOut({ callbackUrl: `/${locale}${routes.admin.home}` })
          }
        >
          {t("end")}
        </Button>
      }
    />
  );
}
