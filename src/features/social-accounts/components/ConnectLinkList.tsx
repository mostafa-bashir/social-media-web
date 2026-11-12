"use client";

import { App, Button, Popconfirm } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useConnectLinks, useRevokeConnectLink } from "../api/connect-links";

/** A client's earlier links: when they expire, whether they were used, revoke. */
export default function ConnectLinkList({ clientId }: { clientId: string }) {
  const t = useTranslations("accounts.connectLink");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const links = useConnectLinks(clientId);
  const revoke = useRevokeConnectLink();
  const day = (iso: string) =>
    format.dateTime(new Date(iso), { dateStyle: "medium" });

  if (!links.data || links.data.length === 0) return null;
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-text-primary">
        {t("earlier")}
      </h3>
      <ul className="flex flex-col divide-y divide-border-secondary">
        {links.data.map((link) => (
          <li
            key={link.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
          >
            <div className="flex flex-col">
              <span className="text-text-primary">
                {t("created", { when: day(link.createdAt) })}
              </span>
              <span className="text-xs text-text-tertiary">
                {link.lastUsedAt
                  ? t("used", { when: day(link.lastUsedAt) })
                  : t("expires", { when: day(link.expiresAt) })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone={link.active ? "growth" : "neutral"}>
                {t(
                  link.active
                    ? "active"
                    : link.revokedAt
                      ? "revoked"
                      : "expired",
                )}
              </StatusBadge>
              {link.active ? (
                <Popconfirm
                  title={t("revokeConfirm")}
                  okText={t("revoke")}
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    revoke.mutate(link, {
                      onError: (error) => message.error(errorMessage(error)),
                    })
                  }
                >
                  <Button size="small" danger className="rounded-full!">
                    {t("revoke")}
                  </Button>
                </Popconfirm>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
