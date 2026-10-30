"use client";

import { useTranslations } from "next-intl";

import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import { dayjs } from "@/lib/dayjs";

import type { PostReview } from "../api/post-reviews";

const DATE_FORMAT = "D MMM YYYY, HH:mm";

const TONES: Record<PostReview["action"], StatusTone> = {
  submitted: "accent",
  approved: "growth",
  changes_requested: "danger",
  withdrawn: "neutral",
};

/** Who submitted, approved or sent back the post, with reviewers' notes. */
export default function PostReviewHistory({
  reviews,
}: {
  reviews: PostReview[];
}) {
  const t = useTranslations("posts.review");
  if (reviews.length === 0) return null;
  return (
    <ol className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge tone={TONES[review.action]}>
              {t(`actions.${review.action}`)}
            </StatusBadge>
            <span className="text-text-primary">
              {review.actor?.name ?? t("formerMember")}
            </span>
            <time
              dateTime={review.createdAt}
              className="text-xs text-text-tertiary"
            >
              {dayjs(review.createdAt).format(DATE_FORMAT)}
            </time>
          </div>
          {review.comment ? (
            <p className="whitespace-pre-wrap rounded-lg bg-background-secondary p-2 text-sm text-text-secondary">
              {review.comment}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
