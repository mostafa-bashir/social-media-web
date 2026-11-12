"use client";

import { LinkOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Select } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  CONNECT_LINK_EXPIRY_DAYS,
  useCreateConnectLink,
} from "../api/connect-links";
import ConnectLinkList from "./ConnectLinkList";
import CreatedConnectLink from "./CreatedConnectLink";

const DEFAULT_EXPIRY_DAYS = 7;

export interface ConnectLinksModalProps {
  open: boolean;
  defaultClientId?: string;
  onClose: () => void;
}

/**
 * Links a client or prospect opens to connect their own accounts, without a
 * password or a login. Each link is shown once, when created.
 */
export default function ConnectLinksModal({
  open,
  defaultClientId,
  onClose,
}: ConnectLinksModalProps) {
  const t = useTranslations("accounts.connectLink");
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const [clientId, setClientId] = useState(defaultClientId);
  const [expiresInDays, setExpiresInDays] = useState(DEFAULT_EXPIRY_DAYS);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const create = useCreateConnectLink();

  const onCreate = () =>
    clientId &&
    create.mutate(
      { clientId, expiresInDays },
      {
        onSuccess: ({ token }) =>
          setCreatedUrl(
            `${window.location.origin}/${locale}${routes.connectLink(token)}`,
          ),
      },
    );

  return (
    <Modal
      open={open}
      title={t("title")}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">{t("description")}</p>
        {create.error ? (
          <Alert type="error" showIcon title={errorMessage(create.error)} />
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <ClientSelect
            className="w-full sm:w-56"
            placeholder={t("client")}
            aria-label={t("client")}
            value={clientId}
            onChange={(value) => {
              setClientId(value);
              setCreatedUrl(null);
            }}
          />
          <Select<number>
            aria-label={t("expiry")}
            value={expiresInDays}
            onChange={setExpiresInDays}
            options={CONNECT_LINK_EXPIRY_DAYS.map((days) => ({
              value: days,
              label: t("expiresIn", { days }),
            }))}
          />
          <Button
            type="primary"
            icon={<LinkOutlined />}
            className="rounded-full!"
            loading={create.isPending}
            disabled={!clientId}
            onClick={onCreate}
          >
            {t("create")}
          </Button>
        </div>
        {createdUrl ? <CreatedConnectLink url={createdUrl} /> : null}
        {clientId ? <ConnectLinkList clientId={clientId} /> : null}
      </div>
    </Modal>
  );
}
