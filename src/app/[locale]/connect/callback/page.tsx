import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PublicConnectCallback } from "@/features/social-accounts";

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.publicConnect");
  return { title: t("pageTitle"), robots: { index: false, follow: false } };
}

/** The API sends a connect link's platform consent back here. */
export default async function ConnectLinkCallbackRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <PublicConnectCallback
      platform={firstValue(params.platform)}
      state={firstValue(params.state)}
      code={firstValue(params.code)}
      error={firstValue(params.error)}
    />
  );
}
