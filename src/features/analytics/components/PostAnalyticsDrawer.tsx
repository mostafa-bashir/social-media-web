"use client";

import { LinkOutlined } from "@ant-design/icons";
import { Alert, Drawer, Skeleton } from "antd";
import { useFormatter, useTranslations } from "next-intl";

import MediaThumb from "@/components/ui/MediaThumb";
import PlatformBadge from "@/components/ui/PlatformBadge";
import { useErrorMessage } from "@/hooks/use-error-message";
import { toZoned } from "@/lib/dayjs";

import { type PostRef, useAnalyticsPost } from "../api/get-analytics";
import PostHistoryChart from "./PostHistoryChart";
import PostMetricsGrid from "./PostMetricsGrid";

const DRAWER_WIDTH = 560;
const THUMB_SIZE = 160;

/** One post's results in depth: every counter, against the account's average, over time. */
export default function PostAnalyticsDrawer({
  postRef,
  timezone,
  onClose,
}: {
  postRef: PostRef | null;
  timezone: string;
  onClose: () => void;
}) {
  const t = useTranslations("analytics.post");
  const tTypes = useTranslations("analytics.contentTypes");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const detail = useAnalyticsPost(postRef);
  // The query keeps the last post while the next loads; never show the wrong one.
  const data = detail.data?.post.id === postRef?.id ? detail.data : undefined;

  return (
    <Drawer
      open={postRef !== null}
      onClose={onClose}
      title={t("title")}
      size={DRAWER_WIDTH}
      destroyOnHidden
    >
      {detail.error ? (
        <Alert type="error" showIcon title={errorMessage(detail.error)} />
      ) : !data ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <PlatformBadge platform={data.post.platform} />
            <span>{data.post.accountName}</span>
            {data.post.contentType ? (
              <span>· {tTypes(data.post.contentType)}</span>
            ) : null}
            <span>
              ·{" "}
              {format.dateTime(
                toZoned(data.post.publishedAt, timezone).toDate(),
                { dateStyle: "medium", timeStyle: "short" },
              )}
            </span>
          </div>
          {data.post.thumbnail ? (
            <MediaThumb asset={data.post.thumbnail} size={THUMB_SIZE} />
          ) : null}
          <p className="whitespace-pre-wrap text-text-primary">
            {data.post.caption || (
              <span className="text-text-tertiary">{t("noCaption")}</span>
            )}
          </p>
          {data.post.externalUrl ? (
            <a
              href={data.post.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary-text"
            >
              <LinkOutlined aria-hidden />
              {t("viewOnPlatform")}
            </a>
          ) : null}
          {data.post.metrics ? (
            <>
              <PostMetricsGrid
                metrics={data.post.metrics}
                average={data.accountAverage}
              />
              <PostHistoryChart history={data.history} />
            </>
          ) : (
            <Alert type="info" showIcon title={t("noMetrics")} />
          )}
        </div>
      )}
    </Drawer>
  );
}
