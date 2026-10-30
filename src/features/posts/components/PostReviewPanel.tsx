"use client";

import { App, Button, Input, Modal } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";
import { toApiError } from "@/lib/api/api-error";

import { usePostReviews } from "../api/post-reviews";
import { type PostAction, usePostAction } from "../api/post-mutations";
import type { Post } from "../types";
import PostReviewHistory from "./PostReviewHistory";
import ScheduleModal from "./ScheduleModal";

const MAX_COMMENT_LENGTH = 2000;

export interface PostReviewPanelProps {
  post: Post;
  timezone: string;
  canApprove: boolean;
  canManage: boolean;
}

/**
 * Approve / request changes for approvers, withdraw for authors, and the
 * review trail. An approval for a time that has passed asks for a new time.
 */
export default function PostReviewPanel({
  post,
  timezone,
  canApprove,
  canManage,
}: PostReviewPanelProps) {
  const t = useTranslations("posts.review");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const reviews = usePostReviews(post.id);
  const action = usePostAction();
  const [comment, setComment] = useState<string | null>(null);
  const [newTime, setNewTime] = useState(false);
  const inReview = post.status === "in_review";

  const run = (next: PostAction, done: string) =>
    action.mutateAsync({ postId: post.id, action: next }).then(
      () => message.success(t(done)),
      (error: unknown) => {
        if (toApiError(error).code === "SCHEDULE_TIME_PASSED") setNewTime(true);
        else message.error(errorMessage(error));
      },
    );

  if (!inReview && (reviews.data?.length ?? 0) === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">{t("title")}</h3>
      {inReview ? (
        <div className="flex flex-wrap gap-2">
          {canApprove ? (
            <>
              <Button
                type="primary"
                className="rounded-full!"
                loading={action.isPending}
                onClick={() => run({ kind: "approve" }, "approved")}
              >
                {t("approve")}
              </Button>
              <Button className="rounded-full!" onClick={() => setComment("")}>
                {t("requestChanges")}
              </Button>
            </>
          ) : null}
          {canManage ? (
            <Button
              type="text"
              className="rounded-full!"
              loading={action.isPending}
              onClick={() => run({ kind: "withdraw-review" }, "withdrawn")}
            >
              {t("withdraw")}
            </Button>
          ) : null}
        </div>
      ) : null}
      <PostReviewHistory reviews={reviews.data ?? []} />
      <Modal
        open={comment !== null}
        title={t("requestChanges")}
        okText={t("send")}
        okButtonProps={{
          disabled: !comment?.trim(),
          loading: action.isPending,
          className: "rounded-full!",
        }}
        cancelButtonProps={{ className: "rounded-full!" }}
        onCancel={() => setComment(null)}
        onOk={() =>
          comment?.trim() &&
          run(
            { kind: "request-changes", comment: comment.trim() },
            "changesRequested",
          ).then(() => setComment(null))
        }
        destroyOnHidden
      >
        <Input.TextArea
          aria-label={t("commentLabel")}
          placeholder={t("commentPlaceholder")}
          autoSize={{ minRows: 3, maxRows: 8 }}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment ?? ""}
          onChange={(event) => setComment(event.target.value)}
        />
      </Modal>
      {newTime ? (
        <ScheduleModal
          open
          timezone={timezone}
          loading={action.isPending}
          title={t("timePassedTitle")}
          confirmLabel={t("approve")}
          onCancel={() => setNewTime(false)}
          onConfirm={(scheduledAt) =>
            run({ kind: "approve", scheduledAt }, "approved").then(() =>
              setNewTime(false),
            )
          }
        />
      ) : null}
    </section>
  );
}
