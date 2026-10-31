"use client";

import { CommentOutlined, ReloadOutlined } from "@ant-design/icons";
import { App, Button } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useRetryComment } from "../api/post-mutations";
import type { FirstCommentStatus } from "../types";

const STATUS_CLASS: Record<FirstCommentStatus, string> = {
  pending: "text-text-tertiary",
  posting: "text-accent-text",
  posted: "text-growth-text",
  failed: "text-danger-text",
  skipped: "text-text-tertiary",
};

/** The first comment's state under one account, with a retry when it can help. */
export default function TargetFirstComment({
  postId,
  targetId,
  comment,
  canRetry,
}: {
  postId: string;
  targetId: string;
  comment: { status: FirstCommentStatus; error: string | null };
  canRetry: boolean;
}) {
  const t = useTranslations("posts.detail.firstComment");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const retry = useRetryComment();
  const retryable = comment.status === "failed" || comment.status === "skipped";

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className={`flex items-center gap-1.5 ${STATUS_CLASS[comment.status]}`}
      >
        <CommentOutlined aria-hidden /> {t(comment.status)}
      </span>
      {comment.error ? (
        <span className="text-text-secondary">{comment.error}</span>
      ) : null}
      {canRetry && retryable ? (
        <Button
          size="small"
          icon={<ReloadOutlined />}
          loading={retry.isPending}
          className="rounded-full!"
          onClick={() =>
            retry.mutate(
              { postId, targetId },
              {
                onSuccess: () => message.success(t("retrying")),
                onError: (error) => message.error(errorMessage(error)),
              },
            )
          }
        >
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}
