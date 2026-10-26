import { AccountDetail } from "@/features/analytics";

export default async function AnalyticsAccountRoute({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return <AccountDetail accountId={accountId} />;
}
