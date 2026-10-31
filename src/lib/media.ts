import { z } from "zod";

/** Mirrors the API's upload rules; the API re-checks type (by content) and size. */
export const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

export const mediaKindSchema = z.enum(["image", "video"]);
export type MediaKind = z.infer<typeof mediaKindSchema>;

export const mediaAssetSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  kind: mediaKindSchema,
  mimeType: z.string(),
  sizeBytes: z.number(),
  /** Displayed size; null when the API couldn't read it. */
  width: z.number().nullable(),
  height: z.number().nullable(),
  /** Videos only. */
  durationMs: z.number().nullable(),
  originalFilename: z.string(),
  /** Short-lived signed URL. */
  url: z.string(),
  createdAt: z.string(),
});
export type MediaAsset = z.infer<typeof mediaAssetSchema>;

/** Why a file can't be uploaded, or `null` when it can. */
export function uploadProblem(file: {
  type: string;
  size: number;
}): "type" | "size" | null {
  if (IMAGE_MIME_TYPES.includes(file.type)) {
    return file.size > MAX_IMAGE_BYTES ? "size" : null;
  }
  if (VIDEO_MIME_TYPES.includes(file.type)) {
    return file.size > MAX_VIDEO_BYTES ? "size" : null;
  }
  return "type";
}
