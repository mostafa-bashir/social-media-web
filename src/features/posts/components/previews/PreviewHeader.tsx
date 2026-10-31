import { Avatar } from "antd";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";
import type { SocialPlatform } from "@/config/platforms";

/** Avatar, account name and a muted second line, as feeds show them. */
export default function PreviewHeader({
  platform,
  accountName,
  avatarUrl,
  subtitle,
  inverted = false,
}: {
  platform: SocialPlatform;
  accountName: string;
  avatarUrl: string | null;
  subtitle: string;
  /** White text over a photo or video (stories, reels). */
  inverted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Avatar src={avatarUrl} size={28}>
        {accountName.charAt(0)}
      </Avatar>
      <div className="min-w-0 flex-1 leading-tight">
        <p
          className={`truncate text-sm font-semibold ${
            inverted ? "text-text-on-color" : "text-text-primary"
          }`}
        >
          {accountName}
        </p>
        <p
          className={`text-xs ${
            inverted ? "text-text-on-color/80" : "text-text-tertiary"
          }`}
        >
          {subtitle}
        </p>
      </div>
      <span
        aria-hidden
        className={inverted ? "text-text-on-color" : "text-text-secondary"}
      >
        {PLATFORM_ICONS[platform]}
      </span>
    </div>
  );
}
