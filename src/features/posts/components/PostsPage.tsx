"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button, Segmented, Select } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import ListingShell from "@/components/ui/ListingShell";
import ListingToolbar from "@/components/ui/ListingToolbar";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { useClientOption } from "@/hooks/use-client-options";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePermissions } from "@/hooks/use-permissions";
import { Link, useRouter } from "@/i18n/navigation";
import { browserTimezone } from "@/lib/dayjs";
import { TOOLBAR_CREATE_BUTTON_CLASS } from "@/lib/listing-ui";

import { usePosts } from "../api/get-posts";
import { useDeletePost, usePostAction } from "../api/post-mutations";
import { useDuplicateAndEdit } from "../hooks/use-duplicate-post";
import { type Post, POST_STATUSES, type PostStatus } from "../types";
import PostDetailDrawer from "./PostDetailDrawer";
import PostsCalendar from "./PostsCalendar";
import PostsTable from "./PostsTable";
import PostsToolbarExtras from "./PostsToolbarExtras";

const PAGE_SIZE = 20;
type View = "list" | "calendar";

export default function PostsPage() {
  const t = useTranslations("posts");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const { can } = usePermissions();
  const canManage = can(Permission.PostsManage);
  const [view, setView] = useState<View>("list");
  const [page, setPage] = useState(1);
  const [clientId, setClientId] = useState<string>();
  const [status, setStatus] = useState<PostStatus>();
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  // `?post=<id>` opens a post directly (links from notifications).
  const linkedPostId = useSearchParams().get("post");
  const shownPostId = openPostId ?? linkedPostId;
  const [deleting, setDeleting] = useState<Post | null>(null);
  const client = useClientOption(clientId);
  // One client: its own zone. All clients: the viewer's zone, labelled on screen.
  const timezone = clientId
    ? (client.data?.timezone ?? browserTimezone())
    : browserTimezone();
  const posts = usePosts({ page, pageSize: PAGE_SIZE, clientId, status });
  const remove = useDeletePost();
  const action = usePostAction();
  const duplicate = useDuplicateAndEdit();

  const unschedule = (post: Post) =>
    action.mutate(
      { postId: post.id, action: { kind: "unschedule" } },
      {
        onSuccess: () => message.success(t("unscheduled")),
        onError: (error) => message.error(errorMessage(error)),
      },
    );

  const toolbar = (
    <ListingToolbar
      filters={
        <>
          <ClientSelect
            allowClear
            className="w-full sm:w-56!"
            placeholder={t("filters.allClients")}
            aria-label={t("filters.client")}
            value={clientId}
            onChange={(value) => {
              setClientId(value);
              setPage(1);
            }}
          />
          <Select<PostStatus>
            allowClear
            className="w-full sm:w-44!"
            placeholder={t("filters.allStatuses")}
            aria-label={t("filters.status")}
            value={status}
            options={POST_STATUSES.map((value) => ({
              value,
              label: t(`status.${value}`),
            }))}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <Segmented<View>
            value={view}
            options={[
              { value: "list", label: t("views.list") },
              { value: "calendar", label: t("views.calendar") },
            ]}
            onChange={setView}
          />
        </>
      }
      actions={
        canManage ? (
          <div className="flex flex-wrap items-center gap-2">
            <PostsToolbarExtras clientId={clientId} />
            <Link
              href={{
                pathname: routes.workspace(slug).newPost,
                query: clientId ? { clientId } : {},
              }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className={TOOLBAR_CREATE_BUTTON_CLASS}
                aria-label={t("create")}
              >
                <span className="max-sm:hidden">{t("create")}</span>
              </Button>
            </Link>
          </div>
        ) : null
      }
    />
  );

  return (
    <>
      <ListingShell toolbar={toolbar}>
        {posts.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(posts.error)}
            className="m-4!"
          />
        ) : view === "calendar" ? (
          <PostsCalendar
            clientId={clientId}
            status={status}
            timezone={timezone}
            onOpen={(post) => setOpenPostId(post.id)}
          />
        ) : (
          <PostsTable
            posts={posts.data?.data ?? []}
            total={posts.data?.meta.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            loading={posts.isFetching}
            filtered={Boolean(clientId || status)}
            timezone={timezone}
            canManage={canManage}
            onPageChange={setPage}
            onOpen={(post) => setOpenPostId(post.id)}
            onEdit={(post) => router.push(routes.workspace(slug).post(post.id))}
            onUnschedule={unschedule}
            onDuplicate={duplicate}
            onDelete={setDeleting}
          />
        )}
      </ListingShell>
      <PostDetailDrawer
        postId={shownPostId}
        canManage={canManage}
        canViewTasks={can(Permission.TasksView)}
        canApprove={can(Permission.PostsApprove)}
        onClose={() => {
          setOpenPostId(null);
          if (linkedPostId) router.replace(routes.workspace(slug).posts);
        }}
        onUnschedule={unschedule}
        onDuplicate={duplicate}
        onDelete={setDeleting}
      />
      <DeleteConfirmModal
        open={deleting !== null}
        title={t("deleteTitle")}
        question={t("deleteQuestion")}
        warning={deleting?.status === "draft" ? undefined : t("deleteWarning")}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              message.success(t("deleted"));
              setDeleting(null);
              setOpenPostId(null);
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
