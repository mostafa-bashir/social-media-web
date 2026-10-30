"use client";

import {
  DeleteOutlined,
  FilePdfOutlined,
  PaperClipOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { App, Button, Upload } from "antd";
import { useFormatter, useTranslations } from "next-intl";
import type { ComponentType } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "../api/collaboration";
import type { TaskAttachment } from "../types";

/** Matches what the API accepts (it checks the real bytes, not this list). */
const ACCEPT =
  "image/png,image/jpeg,image/webp,video/mp4,video/quicktime,application/pdf";

const ICONS: Record<TaskAttachment["kind"], ComponentType> = {
  image: PictureOutlined,
  video: VideoCameraOutlined,
  document: FilePdfOutlined,
};

const KB = 1024;
const MB = KB * KB;

export default function TaskAttachmentsSection({
  taskId,
  canManage,
}: {
  taskId: string;
  canManage: boolean;
}) {
  const t = useTranslations("tasks.attachments");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const attachments = useAttachments(taskId).data ?? [];
  const upload = useUploadAttachment(taskId);
  const remove = useDeleteAttachment(taskId);
  const onError = (error: unknown) => message.error(errorMessage(error));
  const size = (bytes: number) => {
    const [value, unit] =
      bytes < KB
        ? [bytes, "byte"]
        : bytes < MB
          ? [bytes / KB, "kilobyte"]
          : [bytes / MB, "megabyte"];
    return format.number(value, {
      style: "unit",
      unit,
      maximumFractionDigits: 1,
    });
  };

  if (attachments.length === 0 && !canManage) return null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="task-attachments">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="task-attachments"
          className="text-sm font-semibold text-text-primary"
        >
          {t("title")}
        </h3>
        {canManage ? (
          <Upload
            accept={ACCEPT}
            showUploadList={false}
            customRequest={({ file, onSuccess, onError: failed }) =>
              upload.mutate(file as File, {
                onSuccess: () => onSuccess?.(null),
                onError: (error) => {
                  failed?.(error);
                  onError(error);
                },
              })
            }
          >
            <Button
              size="small"
              icon={<PaperClipOutlined />}
              className="rounded-full!"
              loading={upload.isPending}
            >
              {t("add")}
            </Button>
          </Upload>
        ) : null}
      </div>
      {attachments.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {attachments.map((file) => {
            const Icon = ICONS[file.kind];
            return (
              <li key={file.id} className="flex items-center gap-2">
                <span aria-hidden className="text-text-tertiary">
                  <Icon />
                </span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-sm text-primary-text hover:underline"
                >
                  {file.originalFilename}
                </a>
                <span className="text-xs text-text-tertiary">
                  {size(file.sizeBytes)}
                </span>
                {canManage ? (
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    aria-label={t("delete", { name: file.originalFilename })}
                    onClick={() => remove.mutate(file.id, { onError })}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
