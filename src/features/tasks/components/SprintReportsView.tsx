"use client";

import { Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useSprints } from "../api/sprints";
import BurndownChart from "./BurndownChart";
import VelocityChart from "./VelocityChart";

/** Burndown of one sprint (the active one by default) and team velocity. */
export default function SprintReportsView() {
  const t = useTranslations("tasks.reports");
  const sprints = (useSprints().data ?? []).filter(
    (sprint) => sprint.state !== "planned",
  );
  const [chosen, setChosen] = useState<string | undefined>();
  const sprintId = chosen ?? sprints[0]?.id;

  return (
    <div className="grid gap-4 p-4 xl:grid-cols-2">
      <section className="surface-panel flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-primary">
            {t("burndown")}
          </h3>
          {sprints.length > 0 ? (
            <Select<string>
              className="w-48!"
              aria-label={t("pickSprint")}
              value={sprintId}
              onChange={setChosen}
              options={sprints.map((sprint) => ({
                value: sprint.id,
                label: sprint.name,
              }))}
            />
          ) : null}
        </div>
        {sprintId ? (
          <BurndownChart sprintId={sprintId} />
        ) : (
          <p className="text-sm text-text-tertiary">{t("noSprint")}</p>
        )}
      </section>
      <section className="surface-panel flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("velocity")}
        </h3>
        <VelocityChart />
      </section>
    </div>
  );
}
