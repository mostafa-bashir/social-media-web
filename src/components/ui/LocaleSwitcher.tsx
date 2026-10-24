"use client";

import { Segmented } from "antd";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("common.locales");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Segmented
      size="small"
      value={locale}
      disabled={pending}
      aria-label={t("label")}
      options={LOCALES.map((value) => ({ value, label: t(value) }))}
      onChange={(next) =>
        startTransition(() => {
          const query = searchParams.toString();
          router.replace(`${pathname}${query ? `?${query}` : ""}`, {
            locale: next,
          });
        })
      }
    />
  );
}
