import { useTranslations } from "next-intl";

import type { SocialPlatform } from "../types";
import { PLATFORM_ICONS } from "./platform-icons";

/** Platform icon + name. */
export default function PlatformBadge({
  platform,
}: {
  platform: SocialPlatform;
}) {
  const t = useTranslations("accounts.platforms");
  return (
    <span className="inline-flex items-center gap-2 text-text-secondary">
      <span className="text-base" aria-hidden>
        {PLATFORM_ICONS[platform]}
      </span>
      {t(platform)}
    </span>
  );
}
