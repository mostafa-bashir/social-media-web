"use client";

import { Alert, Skeleton } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";

import { usePost } from "../api/get-posts";
import { EDITABLE_STATUSES } from "../types";
import PostComposer from "./PostComposer";

/**
 * New post (no `postId`) or editing an existing draft/scheduled post. A new
 * post started from a task (`taskId`) is linked to it on save.
 */
export default function PostComposerPage({
  postId,
  initialClientId,
  taskId,
}: {
  postId?: string;
  initialClientId?: string;
  taskId?: string;
}) {
  const t = useTranslations("posts.composer");
  const slug = useActiveWorkspaceSlug() ?? "";
  const errorMessage = useErrorMessage();
  const post = usePost(postId);

  if (!postId) {
    return <PostComposer initialClientId={initialClientId} taskId={taskId} />;
  }
  if (post.isLoading) {
    return <Skeleton active className="p-6" paragraph={{ rows: 8 }} />;
  }
  if (post.error || !post.data) {
    return (
      <Alert
        type="error"
        showIcon
        title={errorMessage(post.error)}
        className="m-6!"
      />
    );
  }
  if (!EDITABLE_STATUSES.includes(post.data.status)) {
    return (
      <Alert
        type="info"
        showIcon
        className="m-6!"
        title={t("notEditable")}
        action={
          <Link
            href={routes.workspace(slug).posts}
            className="text-primary-text hover:underline"
          >
            {t("backToPosts")}
          </Link>
        }
      />
    );
  }
  // Keyed so the form state starts from the loaded post.
  return <PostComposer key={post.data.id} post={post.data} />;
}
