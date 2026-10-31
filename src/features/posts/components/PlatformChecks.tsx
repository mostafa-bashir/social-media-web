import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";

import type { TargetCheck } from "../hooks/use-composer";
import { formatLabel } from "../lib/format-label";

/** Live "ready to publish?" list, one row per selected account and format. */
export default function PlatformChecks({
  checks,
  mediaCount,
}: {
  checks: TargetCheck[];
  mediaCount: number;
}) {
  const t = useTranslations("posts.composer");
  const tIssues = useTranslations("posts.issues");
  const tWarnings = useTranslations("posts.warnings");
  const tFormats = useTranslations("common.platformFormats");

  if (checks.length === 0) {
    return <p className="text-sm text-text-tertiary">{t("pickAccounts")}</p>;
  }
  return (
    <ul className="flex flex-col gap-3" aria-live="polite">
      {checks.map((check) => (
        <li key={check.accountId} className="flex gap-3">
          <span className="text-lg text-text-secondary" aria-hidden>
            {PLATFORM_ICONS[check.platform]}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-medium text-text-primary">
              {check.accountName}
              <span className="ms-2 inline-block text-xs font-normal text-text-tertiary">
                {tFormats(
                  formatLabel(check.platform, check.format, mediaCount),
                )}
              </span>
            </span>
            {check.issues.length === 0 ? (
              <span className="flex items-center gap-1.5 text-sm text-growth-text">
                <CheckCircleFilled aria-hidden /> {t("ready")}
              </span>
            ) : (
              check.issues.map((issue) => (
                <span
                  key={issue}
                  className="flex items-center gap-1.5 text-sm text-danger-text"
                >
                  <ExclamationCircleFilled aria-hidden /> {tIssues(issue)}
                </span>
              ))
            )}
            {check.warnings.map((warning) => (
              <span
                key={warning}
                className="flex items-center gap-1.5 text-sm text-accent-text"
              >
                <InfoCircleFilled aria-hidden /> {tWarnings(warning)}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
