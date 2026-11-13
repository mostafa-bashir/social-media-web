"use client";

import { WarningFilled } from "@ant-design/icons";
import { useTranslations } from "next-intl";

/** Stand-in for a health section the API couldn't read this time. */
export default function SectionUnavailable({ title }: { title: string }) {
  const t = useTranslations("admin.health");
  return (
    <section className="surface-panel flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <p className="flex items-center gap-2 text-sm text-text-secondary">
        <WarningFilled className="text-accent" aria-hidden />
        {t("unavailable")}
      </p>
    </section>
  );
}
