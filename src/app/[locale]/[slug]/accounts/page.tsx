import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/components/ui/PageHeader";
import { SocialAccountsPage } from "@/features/social-accounts";

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("accounts");
  return { title: t("title") };
}

export default async function AccountsRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const t = await getTranslations("accounts");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <SocialAccountsPage
        initialClientId={firstValue(params.clientId)}
        initialStatus={firstValue(params.status)}
        connectError={firstValue(params.connectError)}
        openConnectLink={firstValue(params.connectLink) === "1"}
      />
    </>
  );
}
