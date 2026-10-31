"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useRouter } from "@/i18n/navigation";

import { useDuplicatePost } from "../api/post-mutations";
import type { Post } from "../types";

/** Copies a post into a new draft and opens it in the composer. */
export function useDuplicateAndEdit() {
  const t = useTranslations("posts.duplicate");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const duplicate = useDuplicatePost();

  return (post: Post) =>
    duplicate.mutate(post.id, {
      onSuccess: ({ post: copy, skippedTargets }) => {
        if (skippedTargets > 0) {
          message.warning(t("skipped", { count: skippedTargets }));
        } else {
          message.success(t("done"));
        }
        router.push(routes.workspace(slug).post(copy.id));
      },
      onError: (error) => message.error(errorMessage(error)),
    });
}
