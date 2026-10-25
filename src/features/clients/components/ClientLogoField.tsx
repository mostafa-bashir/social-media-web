"use client";

import { UploadOutlined } from "@ant-design/icons";
import { App, Button, Upload } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useUploadClientLogo } from "../api/client-mutations";
import type { Client } from "../types";
import ClientAvatar from "./ClientAvatar";

/** Mirrors the API limit; the API re-checks type (by content) and size. */
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function ClientLogoField({ client }: { client: Client }) {
  const t = useTranslations("clients.form");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const upload = useUploadClientLogo();

  return (
    <div className="flex items-center gap-4">
      <ClientAvatar client={upload.data ?? client} size={56} />
      <div className="flex flex-col gap-1">
        <Upload
          accept={ACCEPTED_TYPES.join(",")}
          showUploadList={false}
          beforeUpload={(file) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
              message.error(t("logoType"));
              return Upload.LIST_IGNORE;
            }
            if (file.size > MAX_LOGO_BYTES) {
              message.error(t("logoSize"));
              return Upload.LIST_IGNORE;
            }
            upload.mutate(
              { clientId: client.id, file },
              {
                onSuccess: () => message.success(t("logoUpdated")),
                onError: (error) => message.error(errorMessage(error)),
              },
            );
            // Uploaded by the mutation above, not by antd's own request.
            return false;
          }}
        >
          <Button
            icon={<UploadOutlined />}
            loading={upload.isPending}
            className="rounded-full!"
          >
            {t("uploadLogo")}
          </Button>
        </Upload>
        <span className="text-xs text-text-tertiary">{t("logoHint")}</span>
      </div>
    </div>
  );
}
