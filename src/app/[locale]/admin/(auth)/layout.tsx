import { getTranslations } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import BrandMark from "@/components/ui/BrandMark";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

/** Console sign-in pages: deliberately plain, without the agency marketing panel. */
export default async function AdminAuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("admin");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-4 py-10">
      <div className="flex flex-col items-center gap-2">
        <BrandMark />
        <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          {t("consoleBadge")}
        </span>
      </div>
      <div className="surface-card-raised w-full max-w-md">
        <div className="surface-panel sm:p-8!">
          {/* Forms read search params on the client. */}
          <Suspense>{children}</Suspense>
        </div>
      </div>
      <LocaleSwitcher />
    </main>
  );
}
