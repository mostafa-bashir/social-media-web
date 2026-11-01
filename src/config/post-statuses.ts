import { z } from "zod";

/** Mirrors the API's `PostStatus` enum; shared so every feature parses the same set. */
export const POST_STATUSES = [
  "draft",
  "in_review",
  "changes_requested",
  "scheduled",
  "publishing",
  "published",
  "partially_failed",
  "failed",
] as const;
export const postStatusSchema = z.enum(POST_STATUSES);
export type PostStatus = z.infer<typeof postStatusSchema>;
