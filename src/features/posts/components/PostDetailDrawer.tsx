"use client";

import { App, Button, Drawer, Skeleton } from "antd";
import { useTranslations } from "next-intl";

import MediaThumb from "@/components/ui/MediaThumb";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useClientOption } from "@/hooks/use-client-options";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import { usePost } from "../api/get-posts";
import { useRetryTarget } from "../api/post-mutations";
import { usePostTime } from "../hooks/use-post-time";
import { EDITABLE_STATUSES, type Post } from "../types";
import PostStatusBadge from "./PostStatusBadge";
import PostTargetRow from "./PostTargetRow";

const DRAWER_WIDTH = 480;
const THUMB_SIZE = 160;

export interface PostDetailDrawerProps {
  postId: string | null;
  canManage: boolean;
  onClose: () => void;
  onUnschedule: (post: Post) => void;
  onDelete: (post: Post) => void;
}

/** Per-account results of a post; refreshes itself while publishing. */
export default function PostDetailDrawer({
  postId,
  canManage,
  onClose,
  onUnschedule,
  onDelete,
}: PostDetailDrawerProps) {
  const t = useTranslations("posts");
  const slug = useActiveWorkspaceSlug() ?? "";
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const post = usePost(postId ?? undefined);
  const client = useClientOption(post.data?.clientId);
  const timezone = client.data?.timezone ?? "UTC";
  const formatTime = usePostTime(timezone);
  const retry = useRetryTarget();
  const data = post.data;

  return (
    <Drawer
      open={postId !== null}
      onClose={onClose}
      title={t("detail.title")}
      size={DRAWER_WIDTH}
      destroyOnHidden
    >
      {!data ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PostStatusBadge status={data.status} />
            {data.scheduledAt ? (
              <span className="text-sm text-text-secondary">
                {formatTime(data.scheduledAt)}{" "}
                <span dir="ltr" className="text-text-tertiary">
                  ({timezone})
                </span>
              </span>
            ) : null}
          </div>
          <p className="whitespace-pre-wrap text-text-primary">
            {data.caption || (
              <span className="text-text-tertiary">{t("noCaption")}</span>
            )}
          </p>
          {data.media.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.media.map((asset) => (
                <MediaThumb key={asset.id} asset={asset} size={THUMB_SIZE} />
              ))}
            </div>
          ) : null}
          {data.targets.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                {t("detail.accounts")}
              </h3>
              <ul className="flex flex-col gap-2">
                {data.targets.map((target) => (
                  <PostTargetRow
                    key={target.id}
                    target={target}
                    canRetry={canManage}
                    retrying={
                      retry.isPending && retry.variables?.targetId === target.id
                    }
                    onRetry={() =>
                      retry.mutate(
                        { postId: data.id, targetId: target.id },
                        {
                          onSuccess: () =>
                            message.success(t("detail.retrying")),
                          onError: (error) =>
                            message.error(errorMessage(error)),
                        },
                      )
                    }
                  />
                ))}
              </ul>
            </section>
          ) : null}
          {canManage ? (
            <div className="flex flex-wrap gap-2">
              {EDITABLE_STATUSES.includes(data.status) ? (
                <Link href={routes.workspace(slug).post(data.id)}>
                  <Button className="rounded-full!">{t("edit")}</Button>
                </Link>
              ) : null}
              {data.status === "scheduled" ? (
                <Button
                  className="rounded-full!"
                  onClick={() => onUnschedule(data)}
                >
                  {t("unschedule")}
                </Button>
              ) : null}
              {data.status !== "publishing" ? (
                <Button
                  danger
                  className="rounded-full!"
                  onClick={() => onDelete(data)}
                >
                  {t("delete")}
                </Button>
              ) : null}
            </div>
          ) : null}
          {post.error ? (
            <p className="text-sm text-danger-text">
              {errorMessage(post.error)}
            </p>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}
