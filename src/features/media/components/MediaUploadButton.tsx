"use client";

import { UploadOutlined } from "@ant-design/icons";
import { App, Button, Tooltip, Upload } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";
import { IMAGE_MIME_TYPES, uploadProblem, VIDEO_MIME_TYPES } from "@/lib/media";

import { useUploadMedia } from "../api/media-mutations";

const ACCEPT = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES].join(",");

/** Uploads into the selected client's library; several files at once is fine. */
export default function MediaUploadButton({ clientId }: { clientId?: string }) {
  const t = useTranslations("media");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const upload = useUploadMedia();
  const [inFlight, setInFlight] = useState(0);

  const button = (
    <Button
      type="primary"
      icon={<UploadOutlined />}
      className={TOOLBAR_CREATE_BUTTON_CLASS}
      loading={inFlight > 0}
      disabled={!clientId}
      aria-label={t("upload")}
    >
      <span className="max-sm:hidden">{t("upload")}</span>
    </Button>
  );

  if (!clientId) {
    return <Tooltip title={t("pickClientFirst")}>{button}</Tooltip>;
  }

  return (
    <Upload
      accept={ACCEPT}
      multiple
      showUploadList={false}
      beforeUpload={(file) => {
        const problem = uploadProblem(file);
        if (problem) {
          message.error(t(`problems.${problem}`, { name: file.name }));
          return Upload.LIST_IGNORE;
        }
        setInFlight((count) => count + 1);
        upload.mutate(
          { clientId, file },
          {
            onSuccess: () =>
              message.success(t("uploaded", { name: file.name })),
            onError: (error) => message.error(errorMessage(error)),
            onSettled: () => setInFlight((count) => count - 1),
          },
        );
        // Uploaded by the mutation above, not by antd's own request.
        return false;
      }}
    >
      {button}
    </Upload>
  );
}
