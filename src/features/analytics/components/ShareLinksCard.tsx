"use client";

import { LinkOutlined } from "@ant-design/icons";
import { App, Button, Modal, Popconfirm, Select, Typography } from "antd";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import StatusBadge from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  LINK_EXPIRY_DAYS,
  LINK_RANGE_DAYS,
  useCreateReportLink,
  useReportLinks,
  useRevokeReportLink,
} from "../api/report-links";
import type { ReportSection } from "../types/report";

/** Read-only links to the client's report; each token is shown once. */
export default function ShareLinksCard({
  clientId,
  sections,
}: {
  clientId: string;
  sections: ReportSection[];
}) {
  const t = useTranslations("analytics.share");
  const locale = useLocale();
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const links = useReportLinks(clientId, true);
  const create = useCreateReportLink();
  const revoke = useRevokeReportLink();
  const day = (iso: string) =>
    format.dateTime(new Date(iso), { dateStyle: "medium" });

  const onCreate = () =>
    create.mutate(
      { clientId, sections, rangeDays, expiresInDays },
      {
        onSuccess: ({ token }) =>
          setCreatedUrl(
            `${window.location.origin}/${locale}${routes.sharedReport(token)}`,
          ),
        onError: (error) => message.error(errorMessage(error)),
      },
    );

  return (
    <section className="surface-card flex flex-col gap-4 print:hidden">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          {t("title")}
        </h2>
        <p className="text-sm text-text-secondary">{t("description")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select<number>
          aria-label={t("range")}
          value={rangeDays}
          onChange={setRangeDays}
          options={LINK_RANGE_DAYS.map((days) => ({
            value: days,
            label: t("lastDays", { days }),
          }))}
        />
        <Select<number>
          aria-label={t("expiry")}
          value={expiresInDays}
          onChange={setExpiresInDays}
          options={LINK_EXPIRY_DAYS.map((days) => ({
            value: days,
            label: t("expiresIn", { days }),
          }))}
        />
        <Button
          type="primary"
          icon={<LinkOutlined />}
          className="rounded-full!"
          loading={create.isPending}
          disabled={sections.length === 0}
          onClick={onCreate}
        >
          {t("create")}
        </Button>
      </div>
      <ul className="flex flex-col divide-y divide-border-secondary">
        {(links.data ?? []).map((link) => (
          <li
            key={link.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="text-text-primary">
                {t("summary", {
                  days: link.rangeDays,
                  created: day(link.createdAt),
                })}
              </span>
              <span className="text-xs text-text-tertiary">
                {t("expires", { when: day(link.expiresAt) })}
                {link.lastViewedAt
                  ? ` · ${t("viewed", { when: day(link.lastViewedAt) })}`
                  : ""}
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
      <Modal
        open={createdUrl !== null}
        title={t("createdTitle")}
        onCancel={() => setCreatedUrl(null)}
        footer={null}
      >
        <p className="mb-3 text-sm text-text-secondary">{t("createdHint")}</p>
        <Typography.Paragraph
          copyable={{ text: createdUrl ?? "" }}
          className="break-all"
          dir="ltr"
        >
          {createdUrl}
        </Typography.Paragraph>
      </Modal>
    </section>
  );
}
