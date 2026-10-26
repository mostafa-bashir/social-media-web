import { PlayCircleFilled } from "@ant-design/icons";
import { Image } from "antd";

import type { MediaAsset } from "@/lib/media";

/** Square preview of an uploaded image or video (first frame). */
export default function MediaThumb({
  asset,
  size = 120,
}: {
  asset: Pick<MediaAsset, "kind" | "url" | "originalFilename">;
  size?: number;
}) {
  const box = { width: size, height: size };
  if (asset.kind === "image") {
    return (
      <Image
        src={asset.url}
        alt={asset.originalFilename}
        width={size}
        height={size}
        className="rounded-lg object-cover"
        rootClassName="shrink-0 overflow-hidden rounded-lg bg-background-tertiary"
      />
    );
  }
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-lg bg-background-tertiary"
      style={box}
    >
      <video
        src={asset.url}
        preload="metadata"
        muted
        playsInline
        aria-label={asset.originalFilename}
        className="h-full w-full object-cover"
      />
      <PlayCircleFilled
        aria-hidden
        className="absolute inset-0 m-auto! flex! items-center justify-center text-3xl text-text-on-color opacity-90"
      />
    </span>
  );
}
