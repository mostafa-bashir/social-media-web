"use client";

import { SyncOutlined } from "@ant-design/icons";
import { App, Button, Popconfirm } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { usePostAction } from "../api/post-mutations";
import type { PostRepeat } from "../types";

/** "Repeats weekly · 3 of 10", with a way to stop further repeats. */
export default function PostRepeatInfo({
  postId,
  repeat,
  canManage,
}: {
  postId: string;
  repeat: PostRepeat;
  canManage: boolean;
}) {
  const t = useTranslations("posts.detail.repeat");
  const tUnits = useTranslations("posts.composer.repeat");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const action = usePostAction();
  const every =
    repeat.interval === 1
      ? t(`frequencies.${repeat.frequency}`)
      : t("everyN", {
          count: repeat.interval,
          unit: tUnits(`units.${repeat.frequency}`, { count: repeat.interval }),
        });
  const progress = repeat.endsAfter
    ? t("ofTotal", { occurrence: repeat.occurrence, total: repeat.endsAfter })
    : repeat.until
      ? t("until", { occurrence: repeat.occurrence, date: repeat.until })
      : t("occurrence", { occurrence: repeat.occurrence });

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
      <SyncOutlined aria-hidden />
      <span>
        {repeat.stopped ? t("stopped", { every }) : every} · {progress}
      </span>
      {canManage && !repeat.stopped ? (
        <Popconfirm
          title={t("stopConfirm")}
          okText={t("stop")}
          onConfirm={() =>
            action.mutate(
              { postId, action: { kind: "stop-repeat" } },
              {
                onSuccess: () => message.success(t("stoppedDone")),
                onError: (error) => message.error(errorMessage(error)),
              },
            )
          }
        >
          <Button
            size="small"
            loading={action.isPending}
            className="rounded-full!"
          >
            {t("stop")}
          </Button>
        </Popconfirm>
      ) : null}
    </div>
  );
}
