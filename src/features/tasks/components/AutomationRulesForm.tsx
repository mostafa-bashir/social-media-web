"use client";

import { App, Button, Select, Switch } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useTaskStatuses } from "../api/get-tasks";
import {
  useAutomationRules,
  useUpdateAutomationRules,
} from "../api/task-social";
import type { AutomationRule } from "../types";
import WorkflowStageBadge from "./WorkflowStageBadge";

/** "When a task reaches <stage>, move it to <column>": one editable row per stage. */
export default function AutomationRulesForm() {
  const t = useTranslations("tasks.automation");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const rules = useAutomationRules();
  const statuses = useTaskStatuses().data ?? [];
  const save = useUpdateAutomationRules();
  const [draft, setDraft] = useState<AutomationRule[] | null>(null);
  const current = draft ?? rules.data ?? [];

  const change = (
    stage: AutomationRule["stage"],
    patch: Partial<AutomationRule>,
  ) =>
    setDraft(
      current.map((rule) =>
        rule.stage === stage ? { ...rule, ...patch } : rule,
      ),
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">{t("intro")}</p>
      <ul className="flex flex-col divide-y divide-border-secondary">
        {current.map((rule) => (
          <li
            key={rule.stage}
            className="flex flex-wrap items-center gap-3 py-2"
          >
            <span className="min-w-36 flex-1">
              <WorkflowStageBadge stage={rule.stage} />
            </span>
            <Select<string>
              allowClear
              className="w-44!"
              placeholder={t("stay")}
              aria-label={t("columnFor", {
                stage: t(`stageNames.${rule.stage}`),
              })}
              value={rule.targetStatusId ?? undefined}
              options={statuses.map((status) => ({
                value: status.id,
                label: status.name,
              }))}
              onChange={(targetStatusId) =>
                change(rule.stage, {
                  targetStatusId: targetStatusId ?? null,
                  enabled: Boolean(targetStatusId),
                })
              }
            />
            <Switch
              checked={rule.enabled}
              disabled={!rule.targetStatusId}
              aria-label={t("enabledFor", {
                stage: t(`stageNames.${rule.stage}`),
              })}
              onChange={(enabled) => change(rule.stage, { enabled })}
            />
          </li>
        ))}
      </ul>
      <Button
        type="primary"
        className="self-start rounded-full!"
        disabled={draft === null}
        loading={save.isPending}
        onClick={() =>
          save.mutate(current, {
            onSuccess: () => {
              setDraft(null);
              message.success(t("saved"));
            },
            onError: (error) => message.error(errorMessage(error)),
          })
        }
      >
        {t("save")}
      </Button>
    </div>
  );
}
