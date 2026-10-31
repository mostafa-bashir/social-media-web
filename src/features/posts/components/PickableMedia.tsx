import { CheckCircleFilled } from "@ant-design/icons";
import { useTranslations } from "next-intl";

import MediaThumb from "@/components/ui/MediaThumb";
import type { MediaAsset } from "@/lib/media";

import { mediaShapeLabel } from "../lib/media-shape";

const THUMB_SIZE = 112;

/** A library file in the picker; `order` is its place among the picked files. */
export default function PickableMedia({
  asset,
  order,
  disabled,
  onToggle,
}: {
  asset: MediaAsset;
  order: number | null;
  disabled: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("posts.composer.picker");
  const shape = mediaShapeLabel(asset);

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={order !== null}
        disabled={disabled}
        aria-label={t("pick", { name: asset.originalFilename })}
        className={`group relative block rounded-lg focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
          order !== null ? "ring-2 ring-primary" : ""
        }`}
      >
        <MediaThumb asset={asset} size={THUMB_SIZE} />
        {order !== null ? (
          <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-text-on-color">
            {order}
          </span>
        ) : (
          <CheckCircleFilled className="absolute end-2 top-2 text-xl text-primary opacity-0 group-hover:opacity-100" />
        )}
        {shape ? (
          <span
            dir="ltr"
            className="absolute bottom-1 start-1 rounded bg-surface/90 px-1.5 text-xs text-text-secondary"
          >
            {shape}
          </span>
        ) : null}
      </button>
    </li>
  );
}
