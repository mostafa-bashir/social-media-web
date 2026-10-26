import { CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";
import type { SocialPlatform } from "@/config/platforms";

import type { PlatformIssue } from "../lib/platform-rules";

/** Live "ready to publish?" list, one row per selected platform. */
export default function PlatformChecks({
  checks,
}: {
  checks: Array<{ platform: SocialPlatform; issues: PlatformIssue[] }>;
}) {
  const t = useTranslations("posts.composer");
  const tIssues = useTranslations("posts.issues");
  const tPlatforms = useTranslations("common.platforms");

  if (checks.length === 0) {
    return <p className="text-sm text-text-tertiary">{t("pickAccounts")}</p>;
  }
  return (
    <ul className="flex flex-col gap-3" aria-live="polite">
      {checks.map(({ platform, issues }) => (
        <li key={platform} className="flex gap-3">
          <span className="text-lg text-text-secondary" aria-hidden>
            {PLATFORM_ICONS[platform]}
          </span>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-text-primary">
              {tPlatforms(platform)}
            </span>
            {issues.length === 0 ? (
              <span className="flex items-center gap-1.5 text-sm text-growth-text">
                <CheckCircleFilled aria-hidden /> {t("ready")}
              </span>
            ) : (
              issues.map((issue) => (
                <span
                  key={issue}
                  className="flex items-center gap-1.5 text-sm text-danger-text"
                >
                  <ExclamationCircleFilled aria-hidden /> {tIssues(issue)}
                </span>
              ))
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
