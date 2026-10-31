import { useTranslations } from "next-intl";

import type { PreviewProps } from "./preview-props";
import PreviewHeader from "./PreviewHeader";
import PreviewMedia from "./PreviewMedia";

/**
 * Stories, Reels and Shorts: a 9:16 frame. The shaded bands are where the
 * apps draw their own buttons, so text there may be covered.
 */
export default function VerticalPreview(props: PreviewProps) {
  const t = useTranslations("posts.composer.preview");
  const [first] = props.media;
  const showCaption = props.format !== "story";
  const text = props.format === "short" ? props.title : props.caption;

  return (
    <article className="relative mx-auto aspect-[9/16] w-full max-w-60 overflow-hidden rounded-2xl bg-shell">
      {first ? (
        <PreviewMedia asset={first} altText={props.altTexts[first.id]} />
      ) : (
        <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-shell-text-muted">
          {t("noMedia")}
        </p>
      )}
      <div className="absolute inset-x-0 top-0 h-[14%] bg-gradient-to-b from-shell/70 to-transparent p-3">
        <PreviewHeader
          inverted
          platform={props.platform}
          accountName={props.accountName}
          avatarUrl={props.avatarUrl}
          subtitle={t(`formats.${props.format}`)}
        />
      </div>
      {showCaption && text ? (
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-shell/80 to-transparent p-3 pe-12">
          <p className="absolute bottom-3 line-clamp-2 text-xs wrap-anywhere whitespace-pre-wrap text-text-on-color">
            {text}
          </p>
        </div>
      ) : null}
    </article>
  );
}
