"use client";

import { Alert } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { PostAction } from "../api/post-mutations";
import type { Composer } from "../hooks/use-composer";
import type { ComposerAccount, Post } from "../types";
import ComposerActions from "./ComposerActions";
import ComposerSection from "./ComposerSection";
import PlatformChecks from "./PlatformChecks";
import PostingSlotsModal from "./PostingSlotsModal";
import PreviewPanel from "./previews/PreviewPanel";

/** Readiness, the send actions and the live preview, beside the form. */
export default function ComposerSidebar({
  composer,
  post,
  taskId,
  accounts,
  reviewMode,
  pending,
  submit,
  onSchedule,
}: {
  composer: Composer;
  post?: Post;
  taskId?: string;
  accounts: ComposerAccount[];
  reviewMode: boolean;
  pending: boolean;
  submit: (action?: PostAction) => Promise<void>;
  onSchedule: () => void;
}) {
  const t = useTranslations("posts.composer");
  const { state } = composer;
  const [editingSlots, setEditingSlots] = useState(false);

  return (
    <aside className="flex h-fit flex-col gap-4">
      <div className="surface-card">
        <div className="surface-panel flex flex-col gap-5">
          {taskId ? <Alert type="info" showIcon title={t("fromTask")} /> : null}
          <ComposerSection title={t("checks")}>
            <PlatformChecks
              checks={composer.checks}
              mediaCount={state.media.length}
            />
          </ComposerSection>
          {reviewMode ? (
            <Alert type="warning" showIcon title={t("needsApproval")} />
          ) : null}
          <ComposerActions
            status={post?.status}
            canSave={Boolean(state.clientId)}
            canSend={composer.isPublishable}
            reviewMode={reviewMode}
            pending={pending}
            onSave={() => submit()}
            onPublishNow={() => submit({ kind: "publish-now" })}
            onSchedule={onSchedule}
            onQueue={() => submit({ kind: "queue" })}
            onEditSlots={
              state.clientId ? () => setEditingSlots(true) : undefined
            }
            onSubmitForApproval={() =>
              submit({ kind: "submit-review", scheduledAt: null })
            }
          />
        </div>
      </div>
      {state.clientId ? (
        <div className="surface-card">
          <div className="surface-panel">
            <ComposerSection title={t("previewHeading")}>
              <PreviewPanel composer={composer} accounts={accounts} />
            </ComposerSection>
          </div>
        </div>
      ) : null}
      {editingSlots && state.clientId ? (
        <PostingSlotsModal
          clientId={state.clientId}
          onClose={() => setEditingSlots(false)}
        />
      ) : null}
    </aside>
  );
}
