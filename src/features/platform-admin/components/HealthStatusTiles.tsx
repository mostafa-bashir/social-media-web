"use client";

import {
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { HealthOverview } from "../types/health";

type Tone = "ok" | "warning" | "down";

const TONE_ICON: Record<Tone, ReactNode> = {
  ok: <CheckCircleFilled className="text-growth" aria-hidden />,
  warning: <WarningFilled className="text-accent" aria-hidden />,
  down: <CloseCircleFilled className="text-danger" aria-hidden />,
};

function StatusTile({
  label,
  tone,
  text,
}: {
  label: string;
  tone: Tone;
  text: string;
}) {
  return (
    <div className="surface-panel flex items-center justify-between gap-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
        {TONE_ICON[tone]}
        {text}
      </span>
    </div>
  );
}

/** Up/down for each dependency and the background worker; icon + text, never colour alone. */
export default function HealthStatusTiles({
  health,
}: {
  health: HealthOverview;
}) {
  const t = useTranslations("admin.health.status");
  const up = (ok: boolean): { tone: Tone; text: string } =>
    ok ? { tone: "ok", text: t("up") } : { tone: "down", text: t("down") };
  const workers = Math.max(0, ...health.queues.map((queue) => queue.workers));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatusTile label={t("database")} {...up(health.dependencies.database)} />
      <StatusTile label={t("redis")} {...up(health.dependencies.redis)} />
      <StatusTile label={t("storage")} {...up(health.dependencies.storage)} />
      <StatusTile
        label={t("worker")}
        tone={workers > 0 ? "ok" : "down"}
        text={
          workers > 0 ? t("workersOnline", { count: workers }) : t("noWorker")
        }
      />
    </div>
  );
}
