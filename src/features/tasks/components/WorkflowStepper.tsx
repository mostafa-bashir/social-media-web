"use client";

import { Steps, type StepsProps } from "antd";
import { useTranslations } from "next-intl";

import type { WorkflowStage } from "../types";

type StepStatus = NonNullable<StepsProps["status"]>;

/** Index of the current step and how it's going, for Post → Scheduled → Published → Goals. */
const POSITION: Record<WorkflowStage, { current: number; status: StepStatus }> =
  {
    no_post: { current: 0, status: "process" },
    draft: { current: 0, status: "process" },
    changes_requested: { current: 0, status: "error" },
    in_review: { current: 1, status: "process" },
    scheduled: { current: 1, status: "process" },
    publishing: { current: 2, status: "process" },
    published: { current: 2, status: "finish" },
    measuring: { current: 3, status: "process" },
    goal_reached: { current: 3, status: "finish" },
    goal_missed: { current: 3, status: "error" },
    failed: { current: 2, status: "error" },
  };

/** A content task's path, driven entirely by its posts and goals. */
export default function WorkflowStepper({
  stage,
  hasGoals,
}: {
  stage: WorkflowStage;
  hasGoals: boolean;
}) {
  const t = useTranslations("tasks.workflow");
  const items = [
    {
      title:
        stage === "no_post"
          ? t("needsPost")
          : stage === "changes_requested"
            ? t("changesRequested")
            : t("draft"),
    },
    { title: stage === "in_review" ? t("inReview") : t("scheduled") },
    { title: stage === "failed" ? t("failed") : t("published") },
    ...(hasGoals ? [{ title: t("goals") }] : []),
  ];
  const { current, status } = POSITION[stage];
  return (
    <Steps
      size="small"
      responsive={false}
      className="overflow-x-auto"
      current={Math.min(current, items.length - 1)}
      status={status}
      items={items}
      aria-label={t("label")}
    />
  );
}
