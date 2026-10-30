"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useFormatter, useNow, useTranslations } from "next-intl";

import MemberAvatar from "@/components/ui/MemberAvatar";
import RowActions from "@/components/ui/RowActions";

import type { TaskComment } from "../types";

const RELATIVE_TIME_REFRESH_MS = 60_000;

export interface CommentItemProps {
  comment: TaskComment;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** One comment; the body is plain text (never rendered as HTML). */
export default function CommentItem({
  comment,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const t = useTranslations("tasks.comments");
  const format = useFormatter();
  const now = useNow({ updateInterval: RELATIVE_TIME_REFRESH_MS });
  const authorName = comment.author?.name ?? t("formerMember");
  const actions = [
    ...(canEdit
      ? [
          {
            key: "edit",
            label: t("edit"),
            icon: <EditOutlined />,
            onClick: onEdit,
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            key: "delete",
            label: t("delete"),
            icon: <DeleteOutlined />,
            danger: true,
            onClick: onDelete,
          },
        ]
      : []),
  ];

  return (
    <li className="flex gap-3">
      <MemberAvatar
        name={authorName}
        avatarUrl={comment.author?.avatarUrl ?? null}
        size={28}
        showTooltip={false}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">
            <span className="font-medium text-text-primary">{authorName}</span>{" "}
            · {format.relativeTime(new Date(comment.createdAt), now)}
            {comment.editedAt ? ` · ${t("edited")}` : ""}
          </p>
          <RowActions actions={actions} label={t("actions")} />
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-text-primary">
          {comment.body}
        </p>
      </div>
    </li>
  );
}
