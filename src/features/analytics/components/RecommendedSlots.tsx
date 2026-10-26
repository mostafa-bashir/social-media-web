"use client";

import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import { useMetricFormat } from "../hooks/use-metric-format";
import { useSlotLabel } from "../hooks/use-slot-label";
import type { TimeSlot } from "../types/content";

/** The best times that have enough posts behind them, with a shortcut to post. */
export default function RecommendedSlots({
  slots,
  clientId,
}: {
  slots: TimeSlot[];
  clientId?: string;
}) {
  const t = useTranslations("analytics.content.recommended");
  const slug = useActiveWorkspaceSlug() ?? "";
  const fmt = useMetricFormat();
  const label = useSlotLabel();

  if (slots.length === 0) {
    return <p className="text-sm text-text-tertiary">{t("notEnough")}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {slots.map((slot) => (
          <li
            key={`${slot.weekday}-${slot.hour}`}
            className="surface-panel flex items-center gap-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary-text">
              <ClockCircleOutlined aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-text-primary">
                {t("slot", {
                  day: label.weekday(slot.weekday),
                  hour: label.hour(slot.hour),
                })}
              </p>
              <p className="text-xs text-text-tertiary">
                {t("detail", {
                  engagements: fmt.count(slot.avgEngagements),
                  posts: slot.posts,
                })}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href={{
          pathname: routes.workspace(slug).newPost,
          query: clientId ? { clientId } : {},
        }}
        className="self-start"
      >
        <Button icon={<PlusOutlined />} className="rounded-full!">
          {t("schedule")}
        </Button>
      </Link>
    </div>
  );
}
