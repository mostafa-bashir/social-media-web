import { useTranslations } from "next-intl";

import type { MediaAsset } from "@/lib/media";

import type { PreviewProps } from "./preview-props";
import PreviewHeader from "./PreviewHeader";
import PreviewMedia from "./PreviewMedia";

const ALBUM_TILES = 4;

/** A feed post: caption above the files on Facebook, below them on Instagram. */
export default function FeedPreview(props: PreviewProps) {
  const t = useTranslations("posts.composer.preview");
  const { platform, caption, media, link } = props;
  const captionBlock = caption ? (
    <p className="line-clamp-4 text-sm wrap-anywhere whitespace-pre-wrap text-text-primary">
      {caption}
    </p>
  ) : null;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border-default bg-surface p-3">
      <PreviewHeader
        platform={platform}
        accountName={props.accountName}
        avatarUrl={props.avatarUrl}
        subtitle={t("justNow")}
      />
      {platform === "facebook" ? captionBlock : null}
      {media.length > 0 ? (
        platform === "facebook" && media.length > 1 ? (
          <AlbumGrid media={media} altTexts={props.altTexts} />
        ) : (
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-background-tertiary">
            <PreviewMedia
              asset={media[0]}
              altText={props.altTexts[media[0].id]}
            />
            {media.length > 1 ? (
              <span className="absolute end-2 top-2 rounded-full bg-shell/70 px-2 text-xs text-text-on-color">
                1/{media.length}
              </span>
            ) : null}
          </div>
        )
      ) : link ? (
        <p
          dir="ltr"
          className="truncate rounded-lg bg-background-subtle p-3 text-xs text-text-secondary"
        >
          {link}
        </p>
      ) : null}
      {platform === "instagram" ? captionBlock : null}
      {props.firstComment ? (
        <div className="flex gap-2 border-t border-border-default pt-2">
          <span className="text-xs font-semibold text-text-primary">
            {props.accountName}
          </span>
          <p className="line-clamp-2 text-xs wrap-anywhere whitespace-pre-wrap text-text-secondary">
            {props.firstComment}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function AlbumGrid({
  media,
  altTexts,
}: {
  media: MediaAsset[];
  altTexts: Record<string, string>;
}) {
  const extra = media.length - ALBUM_TILES;
  return (
    <div className="grid aspect-square grid-cols-2 gap-0.5 overflow-hidden rounded-lg">
      {media.slice(0, ALBUM_TILES).map((asset, index) => (
        <div key={asset.id} className="relative bg-background-tertiary">
          <PreviewMedia asset={asset} altText={altTexts[asset.id]} />
          {index === ALBUM_TILES - 1 && extra > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-shell/60 text-lg font-semibold text-text-on-color">
              +{extra}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
