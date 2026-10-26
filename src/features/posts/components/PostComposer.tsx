"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import ClientSelect from "@/components/ui/ClientSelect";
import { useClientOption } from "@/hooks/use-client-options";

import { useComposerAccounts } from "../api/get-posts";
import { useComposer } from "../hooks/use-composer";
import { useComposerSubmit } from "../hooks/use-composer-submit";
import type { Post } from "../types";
import AccountPicker from "./AccountPicker";
import CaptionField from "./CaptionField";
import ComposerActions from "./ComposerActions";
import ComposerMedia from "./ComposerMedia";
import PlatformChecks from "./PlatformChecks";
import ScheduleModal from "./ScheduleModal";
import YouTubeOptions from "./YouTubeOptions";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

export default function PostComposer({
  post,
  initialClientId,
}: {
  post?: Post;
  initialClientId?: string;
}) {
  const t = useTranslations("posts.composer");
  const composer = useComposer(post, initialClientId);
  const { state } = composer;
  const accounts = useComposerAccounts(state.clientId);
  const client = useClientOption(state.clientId);
  const { submit, pending } = useComposerSubmit(composer, post?.id);
  const [scheduling, setScheduling] = useState(false);
  const platforms = composer.issues.map((entry) => entry.platform);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px] lg:p-6">
      <div className="surface-card">
        <div className="surface-panel flex flex-col gap-6">
          <Section title={t("client")}>
            <ClientSelect
              className="w-full sm:max-w-sm!"
              placeholder={t("clientPlaceholder")}
              aria-label={t("client")}
              value={state.clientId}
              onChange={composer.setClient}
            />
          </Section>
          {state.clientId ? (
            <>
              <Section title={t("accounts")}>
                <AccountPicker
                  accounts={accounts.data ?? []}
                  loading={accounts.isLoading}
                  selectedIds={Object.keys(state.targets)}
                  onToggle={composer.toggleAccount}
                />
              </Section>
              <Section title={t("caption")}>
                <CaptionField
                  value={state.caption}
                  platforms={platforms}
                  onChange={composer.setCaption}
                />
              </Section>
              <Section title={t("media")}>
                <ComposerMedia
                  clientId={state.clientId}
                  media={state.media}
                  onChange={composer.setMedia}
                />
              </Section>
              {composer.youtubeOptions ? (
                <Section title={t("youtube.heading")}>
                  <YouTubeOptions
                    value={composer.youtubeOptions}
                    onChange={composer.setYouTubeOptions}
                  />
                </Section>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <aside className="surface-card h-fit lg:sticky lg:top-4">
        <div className="surface-panel flex flex-col gap-5">
          <Section title={t("checks")}>
            <PlatformChecks checks={composer.issues} />
          </Section>
          <ComposerActions
            status={post?.status}
            canSave={Boolean(state.clientId)}
            canSend={composer.isPublishable}
            pending={pending}
            onSave={() => submit()}
            onPublishNow={() => submit({ kind: "publish-now" })}
            onSchedule={() => setScheduling(true)}
          />
        </div>
      </aside>
      {scheduling ? (
        <ScheduleModal
          open
          timezone={client.data?.timezone ?? "UTC"}
          scheduledAt={post?.scheduledAt}
          loading={pending}
          onCancel={() => setScheduling(false)}
          onConfirm={(scheduledAt) =>
            submit({ kind: "schedule", scheduledAt }).finally(() =>
              setScheduling(false),
            )
          }
        />
      ) : null}
    </div>
  );
}
