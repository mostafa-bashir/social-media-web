import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.oauthError");
  return { title: t("title") };
}

/**
 * Where the API's OAuth callback lands when it can't tell which workspace the
 * attempt belonged to (expired, reused or forged state).
 */
export default async function OAuthErrorRoute() {
  const t = await getTranslations("accounts.oauthError");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-text-primary">{t("title")}</h1>
      <p className="text-sm text-text-secondary">{t("description")}</p>
      <Link
        href={routes.workspaces.picker}
        className={`inline-flex items-center justify-center bg-primary text-text-on-color ${PRIMARY_PILL_BUTTON_CLASS}`}
      >
        {t("back")}
      </Link>
    </div>
  );
}
