"use client";

import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { useTranslations } from "next-intl";

import ListingTable from "@/components/ui/ListingTable";
import MediaThumb from "@/components/ui/MediaThumb";
import RowActions, { type RowAction } from "@/components/ui/RowActions";

import { usePostTime } from "../hooks/use-post-time";
import { EDITABLE_STATUSES, type Post } from "../types";
import PostStatusBadge from "./PostStatusBadge";
import PostTargetsIcons from "./PostTargetsIcons";

const THUMB_SIZE = 40;

export interface PostsTableProps {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filtered: boolean;
  timezone: string;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onOpen: (post: Post) => void;
  onEdit: (post: Post) => void;
  onUnschedule: (post: Post) => void;
  onDuplicate: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export default function PostsTable({
  posts,
  total,
  page,
  pageSize,
  loading,
  filtered,
  timezone,
  canManage,
  onPageChange,
  onOpen,
  onEdit,
  onUnschedule,
  onDuplicate,
  onDelete,
}: PostsTableProps) {
  const t = useTranslations("posts");
  const formatTime = usePostTime(timezone);

  const actionsFor = (post: Post): RowAction[] => [
    {
      key: "view",
      label: t("view"),
      icon: <EyeOutlined />,
      onClick: () => onOpen(post),
    },
    ...(canManage && EDITABLE_STATUSES.includes(post.status)
      ? [
          {
            key: "edit",
            label: t("edit"),
            icon: <EditOutlined />,
            onClick: () => onEdit(post),
          },
        ]
      : []),
    ...(canManage && post.status === "scheduled"
      ? [
          {
            key: "unschedule",
            label: t("unschedule"),
            icon: <RollbackOutlined />,
            onClick: () => onUnschedule(post),
          },
        ]
      : []),
    ...(canManage
      ? [
          {
            key: "duplicate",
            label: t("duplicate.action"),
            icon: <CopyOutlined />,
            onClick: () => onDuplicate(post),
          },
        ]
      : []),
    ...(canManage && post.status !== "publishing"
      ? [
          {
            key: "delete",
            label: t("delete"),
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDelete(post),
          },
        ]
      : []),
  ];

  const columns: TableProps<Post>["columns"] = [
    {
      title: t("columns.post"),
      key: "post",
      render: (_, post) => (
        <div className="flex items-center gap-3">
          {post.media[0] ? (
            <MediaThumb asset={post.media[0]} size={THUMB_SIZE} />
          ) : null}
          <span className="line-clamp-2 max-w-md text-text-primary">
            {post.caption || (
              <span className="text-text-tertiary">{t("noCaption")}</span>
            )}
          </span>
        </div>
      ),
    },
    {
      title: t("columns.accounts"),
      key: "accounts",
      width: 140,
      render: (_, post) => (
        <PostTargetsIcons
          targets={post.targets}
          mediaCount={post.media.length}
        />
      ),
    },
    {
      title: t("columns.when", { timezone }),
      key: "when",
      width: 220,
      responsive: ["md"],
      render: (_, post) => (
        <span className="text-text-secondary">
          {formatTime(post.scheduledAt)}
        </span>
      ),
    },
    {
      title: t("columns.status"),
      key: "status",
      width: 160,
      render: (_, post) => <PostStatusBadge status={post.status} />,
    },
    {
      key: "actions",
      width: 64,
      align: "end",
      render: (_, post) => (
        <RowActions actions={actionsFor(post)} label={t("actionsFor")} />
      ),
    },
  ];

  return (
    <ListingTable<Post>
      rowKey="id"
      columns={columns}
      dataSource={posts}
      loading={loading}
      filtered={filtered}
      emptyTitle={t("empty.title")}
      emptyDescription={t("empty.description")}
      emptyFilteredTitle={t("empty.filtered")}
      onRow={(post) => ({
        onClick: (event) => {
          // Clicks inside the actions popover shouldn't also open the drawer.
          if ((event.target as HTMLElement).closest("button")) return;
          onOpen(post);
        },
        className: "cursor-pointer",
      })}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
        hideOnSinglePage: true,
      }}
    />
  );
}
