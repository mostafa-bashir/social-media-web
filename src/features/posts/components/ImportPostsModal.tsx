"use client";

import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Alert, App, Button, Modal, Upload } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import { useErrorMessage } from "@/hooks/use-error-message";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { useImportPosts } from "../api/smart-schedule";
import { importTemplateCsv } from "../lib/import-template";
import type { ImportResult } from "../types";
import ImportResultTable from "./ImportResultTable";

/** Mirrors the API's upload limit. */
const MAX_IMPORT_BYTES = 1024 * 1024;

/** Schedules many posts from a CSV file: check every row first, then import them all. */
export default function ImportPostsModal({
  initialClientId,
  onClose,
}: {
  initialClientId?: string;
  onClose: () => void;
}) {
  const t = useTranslations("posts.import");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const importPosts = useImportPosts();
  const [clientId, setClientId] = useState(initialClientId);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const check = (chosen: File, client: string) =>
    importPosts.mutate(
      { clientId: client, file: chosen, dryRun: true },
      {
        onSuccess: setResult,
        onError: (error) => message.error(errorMessage(error)),
      },
    );

  const downloadTemplate = () => {
    const url = URL.createObjectURL(
      new Blob([importTemplateCsv()], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "posts-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open
      title={t("title")}
      width={860}
      okText={t("confirm", { count: result?.valid ?? 0 })}
      okButtonProps={{
        disabled: !result || result.invalid > 0 || result.valid === 0,
        loading: importPosts.isPending && Boolean(result),
        className: PRIMARY_PILL_BUTTON_CLASS,
      }}
      cancelButtonProps={{ className: "rounded-full!" }}
      onCancel={onClose}
      onOk={() =>
        clientId &&
        file &&
        importPosts.mutate(
          { clientId, file, dryRun: false },
          {
            onSuccess: (done) => {
              message.success(t("done", { count: done.created }));
              onClose();
            },
            onError: (error) => message.error(errorMessage(error)),
          },
        )
      }
    >
      <div className="surface-card-form">
        <div className="surface-panel flex flex-col gap-4">
          <p className="text-sm text-text-secondary">{t("description")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <ClientSelect
              className="w-full sm:w-64!"
              placeholder={t("client")}
              aria-label={t("client")}
              value={clientId}
              onChange={(next) => {
                setClientId(next);
                setResult(null);
                if (next && file) check(file, next);
              }}
            />
            <Upload
              accept=".csv,text/csv"
              showUploadList={false}
              disabled={!clientId}
              beforeUpload={(chosen) => {
                if (chosen.size > MAX_IMPORT_BYTES) {
                  message.error(t("tooLarge"));
                  return Upload.LIST_IGNORE;
                }
                setFile(chosen);
                setResult(null);
                if (clientId) check(chosen, clientId);
                return false;
              }}
            >
              <Button
                icon={<UploadOutlined />}
                disabled={!clientId}
                loading={importPosts.isPending && !result}
                className="rounded-full!"
              >
                {file ? t("changeFile") : t("chooseFile")}
              </Button>
            </Upload>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
            >
              {t("template")}
            </Button>
          </div>
          {file ? (
            <span className="text-xs text-text-tertiary">{file.name}</span>
          ) : null}
          {result ? (
            <>
              <Alert
                type={result.invalid > 0 ? "warning" : "success"}
                showIcon
                title={t("summary", {
                  valid: result.valid,
                  invalid: result.invalid,
                })}
              />
              <ImportResultTable result={result} />
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
