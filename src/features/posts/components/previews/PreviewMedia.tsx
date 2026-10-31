import type { MediaAsset } from "@/lib/media";

/** One file filling its frame; videos show their first frame, muted. */
export default function PreviewMedia({
  asset,
  altText,
  className = "",
}: {
  asset: Pick<MediaAsset, "kind" | "url" | "originalFilename">;
  altText?: string;
  className?: string;
}) {
  const classes = `h-full w-full object-cover ${className}`;
  if (asset.kind === "video") {
    return (
      <video
        src={asset.url}
        preload="metadata"
        muted
        playsInline
        aria-label={altText || asset.originalFilename}
        className={classes}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs; next/image would proxy and cache them
    <img
      src={asset.url}
      alt={altText || asset.originalFilename}
      className={classes}
    />
  );
}
