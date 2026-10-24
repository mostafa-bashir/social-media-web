"use client";

import { Button, Result } from "antd";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Result
        status="404"
        title={t("notFound.title")}
        subTitle={t("notFound.description")}
        extra={
          <Link href="/">
            <Button type="primary">{t("notFound.backHome")}</Button>
          </Link>
        }
      />
    </div>
  );
}
