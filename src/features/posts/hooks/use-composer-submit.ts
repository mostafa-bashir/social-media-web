"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useLinkPostToTask } from "@/hooks/use-post-tasks";
import { useRouter } from "@/i18n/navigation";

import {
  type PostAction,
  usePostAction,
  useSavePost,
} from "../api/post-mutations";
import type { Composer } from "./use-composer";

/**
 * Saves the post, then optionally schedules or publishes it. A new post that
 * saved but couldn't be sent stays as a draft, and the page moves to its edit
 * URL so the next attempt updates it instead of creating another.
 *
 * With `taskId`, the new post is linked to that task before it's sent (so the
 * task follows it from draft onwards), and the user goes back to the task.
 */
export function useComposerSubmit(
  composer: Composer,
  postId?: string,
  taskId?: string,
) {
  const t = useTranslations("posts.composer");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const save = useSavePost();
  const action = usePostAction();
  const linkToTask = useLinkPostToTask();

  const submit = async (next?: PostAction) => {
    const clientId = composer.state.clientId;
    if (!clientId) return;
    let savedId = postId;
    try {
      const saved = await save.mutateAsync({
        postId,
        clientId,
        input: composer.toInput(),
      });
      savedId = saved.id;
      if (taskId && !postId) {
        await linkToTask.mutateAsync({ taskId, postId: saved.id });
      }
      if (next) await action.mutateAsync({ postId: saved.id, action: next });
      message.success(t(`done.${next?.kind ?? "save"}`));
      router.push(
        taskId
          ? {
              pathname: routes.workspace(slug).tasks,
              query: { task: taskId },
            }
          : routes.workspace(slug).posts,
      );
    } catch (error) {
      message.error(errorMessage(error));
      if (!postId && savedId) {
        router.replace(routes.workspace(slug).post(savedId));
      }
    }
  };

  return {
    submit,
    pending: save.isPending || linkToTask.isPending || action.isPending,
  };
}
