import type { MediaAsset } from "@/lib/media";

/** Ratios platforms talk about; anything else is shown as width×height. */
const NAMED_RATIOS: Array<[label: string, ratio: number]> = [
  ["1:1", 1],
  ["4:5", 4 / 5],
  ["9:16", 9 / 16],
  ["16:9", 16 / 9],
  ["1.91:1", 1.91],
  ["4:3", 4 / 3],
  ["3:4", 3 / 4],
];
const RATIO_TOLERANCE = 0.02;
const SECONDS_PER_MINUTE = 60;

/** "9:16 · 0:30" for a vertical half-minute video; null when the size is unknown. */
export function mediaShapeLabel(
  asset: Pick<MediaAsset, "width" | "height" | "durationMs">,
): string | null {
  if (!asset.width || !asset.height) return null;
  const ratio = asset.width / asset.height;
  const named = NAMED_RATIOS.find(
    ([, value]) => Math.abs(value - ratio) / value < RATIO_TOLERANCE,
  );
  const shape = named ? named[0] : `${asset.width}×${asset.height}`;
  if (asset.durationMs === null) return shape;
  const totalSeconds = Math.round(asset.durationMs / 1_000);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = String(totalSeconds % SECONDS_PER_MINUTE).padStart(2, "0");
  return `${shape} · ${minutes}:${seconds}`;
}
