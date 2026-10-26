"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
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
 */
export function useComposerSubmit(composer: Composer, postId?: string) {
  const t = useTranslations("posts.composer");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const save = useSavePost();
  const action = usePostAction();

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
      if (next) await action.mutateAsync({ postId: saved.id, action: next });
      message.success(t(`done.${next?.kind ?? "save"}`));
      router.push(routes.workspace(slug).posts);
    } catch (error) {
      message.error(errorMessage(error));
      if (!postId && savedId) {
        router.replace(routes.workspace(slug).post(savedId));
      }
    }
  };

  return {
    submit,
    pending: save.isPending || action.isPending,
  };
}
