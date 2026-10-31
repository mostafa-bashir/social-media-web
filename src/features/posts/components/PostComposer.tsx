"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import { Permission } from "@/config/permissions";
import { useClientOption } from "@/hooks/use-client-options";
import { usePermissions } from "@/hooks/use-permissions";

import { useComposerAccounts } from "../api/get-posts";
import { useComposer } from "../hooks/use-composer";
import { useComposerSubmit } from "../hooks/use-composer-submit";
import type { Post } from "../types";
import AccountPicker from "./AccountPicker";
import CaptionEditor from "./CaptionEditor";
import ComposerMedia from "./ComposerMedia";
import ComposerSection from "./ComposerSection";
import ComposerSidebar from "./ComposerSidebar";
import PlatformOptionsSections from "./PlatformOptionsSections";
import ScheduleModal from "./ScheduleModal";

export default function PostComposer({
  post,
  initialClientId,
  taskId,
}: {
  post?: Post;
  initialClientId?: string;
  taskId?: string;
}) {
  const t = useTranslations("posts.composer");
  const composer = useComposer(post, initialClientId);
  const { state } = composer;
  const accounts = useComposerAccounts(state.clientId);
  const client = useClientOption(state.clientId);
  const { submit, pending } = useComposerSubmit(composer, post?.id, taskId);
  const [scheduling, setScheduling] = useState(false);
  const { can } = usePermissions();
  // The API enforces this too; here it just offers the right buttons.
  const reviewMode =
    Boolean(client.data?.requireApproval) && !can(Permission.PostsApprove);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px] lg:p-6">
      <div className="surface-card h-fit">
        <div className="surface-panel flex flex-col gap-6">
          <ComposerSection title={t("client")}>
            <ClientSelect
              className="w-full sm:max-w-sm!"
              placeholder={t("clientPlaceholder")}
              aria-label={t("client")}
              value={state.clientId}
              onChange={composer.setClient}
            />
          </ComposerSection>
          {state.clientId ? (
            <>
              <ComposerSection title={t("accounts")}>
                <AccountPicker
                  accounts={accounts.data ?? []}
                  loading={accounts.isLoading}
                  formats={Object.fromEntries(
                    Object.entries(state.targets).map(([id, target]) => [
                      id,
                      target.format,
                    ]),
                  )}
                  mediaCount={state.media.length}
                  onToggle={composer.toggleAccount}
                  onFormatChange={composer.setFormat}
                />
              </ComposerSection>
              <ComposerSection title={t("caption")}>
                <CaptionEditor composer={composer} clientId={state.clientId} />
              </ComposerSection>
              <ComposerSection title={t("media")}>
                <ComposerMedia
                  clientId={state.clientId}
                  media={state.media}
                  altTexts={state.altTexts}
                  onChange={composer.setMedia}
                  onAltTextChange={composer.setAltText}
                />
              </ComposerSection>
              <PlatformOptionsSections
                composer={composer}
                clientId={state.clientId}
                accounts={accounts.data ?? []}
              />
            </>
          ) : null}
        </div>
      </div>
      <ComposerSidebar
        composer={composer}
        post={post}
        taskId={taskId}
        accounts={accounts.data ?? []}
        reviewMode={reviewMode}
        pending={pending}
        submit={submit}
        onSchedule={() => setScheduling(true)}
      />
      {scheduling ? (
        <ScheduleModal
          open
          clientId={state.clientId}
          timezone={client.data?.timezone ?? "UTC"}
          scheduledAt={post?.scheduledAt}
          loading={pending}
          title={reviewMode ? t("review.title") : undefined}
          confirmLabel={reviewMode ? t("review.confirm") : undefined}
          onCancel={() => setScheduling(false)}
          onConfirm={(scheduledAt) =>
            submit(
              reviewMode
                ? { kind: "submit-review", scheduledAt }
                : { kind: "schedule", scheduledAt },
            ).finally(() => setScheduling(false))
          }
        />
      ) : null}
    </div>
  );
}
