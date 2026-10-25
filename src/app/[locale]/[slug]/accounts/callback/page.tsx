import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { ConnectCallback } from "@/features/social-accounts";

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts.callback");
  return { title: t("title") };
}

/** The API's OAuth callback sends the browser here with the platform's result. */
export default async function ConnectCallbackRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations("accounts.callback");
  return (
    <>
      <PageHeader title={t("title")} />
      <ConnectCallback
        platform={firstValue(params.platform)}
        state={firstValue(params.state)}
        code={firstValue(params.code)}
        error={firstValue(params.error)}
      />
    </>
  );
}
