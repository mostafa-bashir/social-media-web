"use client";

import { App, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useAddComment,
  useDeleteComment,
  useEditComment,
} from "../api/comment-mutations";
import { useTaskComments } from "../api/get-tasks";
import type { TaskComment } from "../types";
import CommentComposer from "./CommentComposer";
import CommentItem from "./CommentItem";

export interface TaskCommentsProps {
  taskId: string;
  userId: string | undefined;
  /** `tasks.manage` can remove anyone's comment. */
  canModerate: boolean;
}

export default function TaskComments({
  taskId,
  userId,
  canModerate,
}: TaskCommentsProps) {
  const t = useTranslations("tasks.comments");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const comments = useTaskComments(taskId);
  const add = useAddComment(taskId);
  const edit = useEditComment(taskId);
  const remove = useDeleteComment(taskId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<TaskComment | null>(null);
  const list = comments.data?.data ?? [];
  const total = comments.data?.meta.total ?? 0;
  /** True when the mutation succeeded; failures show a message instead of throwing. */
  const saved = (pending: Promise<unknown>) =>
    pending.then(
      () => true,
      (error: unknown) => {
        message.error(errorMessage(error));
        return false;
      },
    );

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">
        {t("title", { count: total })}
      </h3>
      {comments.isPending ? (
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((comment) =>
            comment.id === editingId ? (
              <li key={comment.id}>
                <CommentComposer
                  initialBody={comment.body}
                  submitLabel={t("save")}
                  loading={edit.isPending}
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (input) => {
                    const ok = await saved(
                      edit.mutateAsync({ commentId: comment.id, ...input }),
                    );
                    if (ok) setEditingId(null);
                    return ok;
                  }}
                />
              </li>
            ) : (
              <CommentItem
                key={comment.id}
                comment={comment}
                canEdit={comment.author?.userId === userId}
                canDelete={comment.author?.userId === userId || canModerate}
                onEdit={() => setEditingId(comment.id)}
                onDelete={() => setDeleting(comment)}
              />
            ),
          )}
        </ul>
      )}
      {total > list.length ? (
        <p className="text-xs text-text-tertiary">
          {t("truncated", { shown: list.length, total })}
        </p>
      ) : null}
      <CommentComposer
        submitLabel={t("send")}
        loading={add.isPending}
        onSubmit={(input) => saved(add.mutateAsync(input))}
      />
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        question={t("deleteQuestion")}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </section>
  );
}
