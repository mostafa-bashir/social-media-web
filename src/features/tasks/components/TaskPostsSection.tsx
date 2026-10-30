"use client";

import { DisconnectOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Select } from "antd";
import { useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link, useRouter } from "@/i18n/navigation";
import { dayjs } from "@/lib/dayjs";

import {
  useLinkTaskPost,
  usePostOptions,
  useUnlinkTaskPost,
} from "../api/task-social";
import type { Task } from "../types";

const MAX_POSTS = 10;
const CAPTION_OPTION_LENGTH = 60;
const DATE_FORMAT = "D MMM, HH:mm";

/** Posts the task produces: open, unlink, link an existing one, or compose a new one. */
export default function TaskPostsSection({
  task,
  canManage,
}: {
  task: Task;
  canManage: boolean;
}) {
  const t = useTranslations("tasks.posts");
  const tStatus = useTranslations("posts.status");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const options = usePostOptions(task.client?.id);
  const link = useLinkTaskPost(task.id);
  const unlink = useUnlinkTaskPost(task.id);
  const onError = (error: unknown) => message.error(errorMessage(error));
  const linkedIds = new Set(task.posts.map((post) => post.id));
  const composeHref = {
    pathname: routes.workspace(slug).newPost,
    query: {
      taskId: task.id,
      ...(task.client ? { clientId: task.client.id } : {}),
    },
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="task-posts">
      <div className="flex items-center justify-between gap-3">
        <h3 id="task-posts" className="text-sm font-semibold text-text-primary">
          {t("title")}
        </h3>
        {canManage && task.posts.length < MAX_POSTS ? (
          <Button
            size="small"
            icon={<PlusOutlined />}
            className="rounded-full!"
            onClick={() => router.push(composeHref)}
          >
            {t("create")}
          </Button>
        ) : null}
      </div>
      {task.posts.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary">
          {task.posts.map((post) => (
            <li key={post.id} className="flex items-center gap-3 py-2">
              <Link
                href={routes.workspace(slug).post(post.id)}
                className="min-w-0 flex-1 truncate text-sm text-text-primary hover:text-primary-text"
              >
                {post.captionExcerpt || t("noCaption")}
              </Link>
              {post.scheduledAt ? (
                <span className="text-xs text-text-tertiary max-sm:hidden">
                  {dayjs(post.scheduledAt).format(DATE_FORMAT)}
                </span>
              ) : null}
              <StatusBadge>{tStatus(post.status)}</StatusBadge>
              {canManage ? (
                <Button
                  type="text"
                  size="small"
                  icon={<DisconnectOutlined />}
                  aria-label={t("unlink")}
                  title={t("unlink")}
                  onClick={() => unlink.mutate(post.id, { onError })}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {canManage && task.posts.length < MAX_POSTS ? (
        <Select<string>
          showSearch={{ optionFilterProp: "label" }}
          value={null}
          placeholder={t("linkExisting")}
          aria-label={t("linkExisting")}
          loading={options.isFetching || link.isPending}
          notFoundContent={t("noPosts")}
          options={(options.data?.data ?? [])
            .filter((post) => !linkedIds.has(post.id))
            .map((post) => ({
              value: post.id,
              label: `${(post.caption || t("noCaption")).slice(0, CAPTION_OPTION_LENGTH)} · ${tStatus(post.status)}`,
            }))}
          onChange={(postId) => postId && link.mutate(postId, { onError })}
        />
      ) : null}
    </section>
  );
}
