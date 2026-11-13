"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { FeatureKey } from "@/config/features";
import { usePermissions } from "@/hooks/use-permissions";

import ListingEmptyState from "./ListingEmptyState";

/**
 * Shows a calm "not available" state instead of a page full of errors when a
 * module is switched off for the workspace (e.g. a bookmarked /tasks link).
 */
export default function FeatureGate({
  feature,
  children,
}: {
  feature: FeatureKey;
  children: ReactNode;
}) {
  const t = useTranslations("common.featureGate");
  const { featureEnabled, isLoading } = usePermissions();
  if (!isLoading && !featureEnabled(feature)) {
    return (
      <div className="surface-card">
        <div className="surface-panel">
          <ListingEmptyState
            title={t("title")}
            description={t("description")}
          />
        </div>
      </div>
    );
  }
  return children;
}
