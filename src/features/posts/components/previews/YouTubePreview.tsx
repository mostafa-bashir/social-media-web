import { Avatar } from "antd";
import { useTranslations } from "next-intl";

import type { PreviewProps } from "./preview-props";
import PreviewMedia from "./PreviewMedia";

/** A YouTube video in a list: 16:9 thumbnail, title, channel and description. */
export default function YouTubePreview(props: PreviewProps) {
  const t = useTranslations("posts.composer.preview");
  const [video] = props.media;

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-border-default bg-surface p-3">
      <div className="aspect-video overflow-hidden rounded-lg bg-shell">
        {video ? <PreviewMedia asset={video} /> : null}
      </div>
      <div className="flex gap-2">
        <Avatar src={props.avatarUrl} size={28}>
          {props.accountName.charAt(0)}
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-text-primary">
            {props.title || t("untitled")}
          </p>
          <p className="text-xs text-text-tertiary">{props.accountName}</p>
          {props.caption ? (
            <p className="mt-1 line-clamp-2 text-xs wrap-anywhere whitespace-pre-wrap text-text-secondary">
              {props.caption}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
