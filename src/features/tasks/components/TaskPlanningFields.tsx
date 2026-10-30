"use client";

import { DatePicker, Form, InputNumber, Select } from "antd";
import { useTranslations } from "next-intl";

import { useTaskLabels } from "../api/task-meta";
import { type Task, TASK_TYPES, type TaskType } from "../types";
import ParentSelect from "./ParentSelect";
import SprintSelect from "./SprintSelect";

const MAX_STORY_POINTS = 999;
const MAX_LABELS = 10;
const HOURS_STEP = 0.25;
/** Mirrors the API's cap of 2000 hours. */
const MAX_ESTIMATE_HOURS = 2000;

/** Jira-style planning fields of the task form: type, parent, labels, points, start. */
export default function TaskPlanningFields({ task }: { task?: Task }) {
  const t = useTranslations("tasks");
  const form = Form.useFormInstance();
  const type = Form.useWatch<TaskType | undefined>("type", form) ?? "task";
  const labels = useTaskLabels().data ?? [];

  return (
    <div className="grid gap-x-4 sm:grid-cols-2">
      <Form.Item name="type" label={t("form.type")}>
        <Select
          options={TASK_TYPES.map((value) => ({
            value,
            label: t(`types.${value}`),
          }))}
          // A new type usually needs a different kind of parent.
          onChange={() => form.setFieldValue("parentId", null)}
        />
      </Form.Item>
      {type === "campaign" ? null : (
        <Form.Item
          name="parentId"
          label={type === "subtask" ? t("form.parentTask") : t("form.campaign")}
          rules={[{ required: type === "subtask" }]}
        >
          <ParentSelect
            childType={type}
            known={task?.parent}
            excludeId={task?.id}
            placeholder={
              type === "subtask" ? t("form.pickParent") : t("form.noCampaign")
            }
          />
        </Form.Item>
      )}
      <Form.Item name="sprintId" label={t("form.sprint")}>
        <SprintSelect placeholder={t("sprints.backlog")} />
      </Form.Item>
      <Form.Item name="labelIds" label={t("form.labels")}>
        <Select
          mode="multiple"
          maxCount={MAX_LABELS}
          placeholder={t("form.noLabels")}
          optionFilterProp="label"
          options={labels.map((label) => ({
            value: label.id,
            label: label.name,
          }))}
        />
      </Form.Item>
      <Form.Item name="storyPoints" label={t("form.storyPoints")}>
        <InputNumber
          className="w-full!"
          min={0}
          max={MAX_STORY_POINTS}
          step={0.5}
          precision={1}
        />
      </Form.Item>
      <Form.Item name="estimateHours" label={t("form.estimate")}>
        <InputNumber
          className="w-full!"
          min={HOURS_STEP}
          max={MAX_ESTIMATE_HOURS}
          step={HOURS_STEP}
          suffix={t("form.hoursUnit")}
        />
      </Form.Item>
      <Form.Item name="startAt" label={t("form.startAt")}>
        <DatePicker
          showTime={{ format: "HH:mm" }}
          format="YYYY-MM-DD HH:mm"
          className="w-full"
        />
      </Form.Item>
    </div>
  );
}
