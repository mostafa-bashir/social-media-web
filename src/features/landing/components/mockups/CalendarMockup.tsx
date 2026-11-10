import { useTranslations } from "next-intl";

import type { SocialPlatform } from "@/config/platforms";

import { type LandingTone, TONE_CHIP_CLASS } from "../../lib/tones";
import LandingIcon from "../LandingIcon";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"] as const;

const SAMPLE_POSTS: readonly {
  day: (typeof DAY_KEYS)[number];
  post: "launch" | "reel" | "tips" | "event" | "promo";
  time: string;
  platform: SocialPlatform;
  tone: LandingTone;
}[] = [
  {
    day: "mon",
    post: "launch",
    time: "09:00",
    platform: "instagram",
    tone: "primary",
  },
  {
    day: "mon",
    post: "tips",
    time: "17:00",
    platform: "facebook",
    tone: "accent",
  },
  {
    day: "tue",
    post: "reel",
    time: "18:30",
    platform: "tiktok",
    tone: "growth",
  },
  {
    day: "wed",
    post: "tips",
    time: "12:00",
    platform: "facebook",
    tone: "accent",
  },
  {
    day: "thu",
    post: "event",
    time: "16:00",
    platform: "youtube",
    tone: "primary",
  },
  {
    day: "fri",
    post: "promo",
    time: "10:00",
    platform: "instagram",
    tone: "growth",
  },
  {
    day: "fri",
    post: "reel",
    time: "19:00",
    platform: "tiktok",
    tone: "primary",
  },
];

export default function CalendarMockup() {
  const t = useTranslations("landing.mockups");
  return (
    <figure>
      <figcaption className="sr-only">{t("calendarCaption")}</figcaption>
      <div aria-hidden className="surface-card-raised">
        <div className="surface-panel p-3! sm:p-5!">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {DAY_KEYS.map((day) => (
              <div key={day} className="min-w-0">
                <p className="truncate pb-2 text-center text-[11px] font-medium text-text-tertiary sm:text-xs">
                  {t(`days.${day}`)}
                </p>
                <div className="flex min-h-44 flex-col gap-1.5 rounded-lg bg-background-subtle p-1 sm:p-1.5">
                  {SAMPLE_POSTS.filter((item) => item.day === day).map(
                    (item) => (
                      <div
                        key={`${item.post}-${item.time}`}
                        className={`rounded-md p-1.5 text-[10px] leading-tight sm:text-[11px] ${TONE_CHIP_CLASS[item.tone]}`}
                      >
                        <span className="flex items-center gap-1 font-semibold">
                          <LandingIcon name={item.platform} />
                          <span dir="ltr">{item.time}</span>
                        </span>
                        <span className="mt-1 line-clamp-2">
                          {t(`posts.${item.post}`)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
