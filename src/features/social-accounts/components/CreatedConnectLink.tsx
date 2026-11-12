"use client";

import { WhatsAppOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useTranslations } from "next-intl";

const WHATSAPP_SHARE_URL = "https://wa.me/";

/** The new link, shown once: copy it or send it on WhatsApp. */
export default function CreatedConnectLink({ url }: { url: string }) {
  const t = useTranslations("accounts.connectLink");
  const whatsApp = `${WHATSAPP_SHARE_URL}?${new URLSearchParams({
    text: t("whatsAppMessage", { url }),
  }).toString()}`;

  return (
    <div className="surface-panel flex flex-col gap-2" role="status">
      <span className="text-sm font-medium text-text-primary">
        {t("createdTitle")}
      </span>
      <span className="text-xs text-text-secondary">{t("createdHint")}</span>
      <Typography.Paragraph
        copyable={{ text: url }}
        className="mb-0! break-all"
        dir="ltr"
      >
        {url}
      </Typography.Paragraph>
      <div>
        <Button
          icon={<WhatsAppOutlined />}
          className="rounded-full!"
          href={whatsApp}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("shareWhatsApp")}
        </Button>
      </div>
    </div>
  );
}
