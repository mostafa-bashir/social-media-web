"use client";

import { DatePicker, Form, Input, Modal, Select } from "antd";
import { useTranslations } from "next-intl";

import ClientSelect from "@/components/ui/ClientSelect";
import MemberSelect from "@/components/ui/MemberSelect";
import { type Dayjs, dayjs } from "@/lib/dayjs";

import {
  type Task,
  TASK_PRIORITIES,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "../types";
import TaskPlanningFields from "./TaskPlanningFields";

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 10_000;
const MAX_ASSIGNEES = 10;
const MINUTES_PER_HOUR = 60;

interface FormValues {
  title: string;
  description?: string;
  statusId?: string;
  type: TaskType;
  parentId?: string | null;
  sprintId?: string | null;
  labelIds: string[];
  storyPoints?: number | null;
  estimateHours?: number | null;
  priority: TaskPriority;
  assigneeIds: string[];
  clientId?: string;
  startAt?: Dayjs | null;
  dueAt?: Dayjs | null;
}

export interface TaskFormDefaults {
  statusId?: string;
  clientId?: string;
  type?: TaskType;
  parentId?: string;
}

export interface TaskFormModalProps {
  open: boolean;
  /** Present when editing. */
  task?: Task;
  statuses: TaskStatus[];
  defaults?: TaskFormDefaults;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (input: TaskInput) => void;
}

const toDayjs = (value: string | null) => (value ? dayjs(value) : null);

function initialValuesFor(
  task: Task | undefined,
  statuses: TaskStatus[],
  defaults: TaskFormDefaults | undefined,
): FormValues {
  if (!task) {
    return {
      title: "",
      description: "",
      statusId: defaults?.statusId ?? statuses[0]?.id,
      type: defaults?.type ?? "task",
      parentId: defaults?.parentId ?? null,
      sprintId: null,
      labelIds: [],
      storyPoints: null,
      estimateHours: null,
      priority: "medium",
      assigneeIds: [],
      clientId: defaults?.clientId,
      startAt: null,
      dueAt: null,
    };
  }
  return {
    title: task.title,
    description: task.description ?? "",
    type: task.type,
    parentId: task.parent?.id ?? null,
    sprintId: task.sprint?.id ?? null,
    labelIds: task.labels.map((label) => label.id),
    storyPoints: task.storyPoints,
    estimateHours: task.estimateMinutes
      ? task.estimateMinutes / MINUTES_PER_HOUR
      : null,
    priority: task.priority,
    assigneeIds: task.assignees.map((person) => person.userId),
    clientId: task.client?.id,
    startAt: toDayjs(task.startAt),
    dueAt: toDayjs(task.dueAt),
  };
}

/** Create or edit a task. Dates are picked and shown in the viewer's zone. */
export default function TaskFormModal({
  open,
  task,
  statuses,
  defaults,
  loading,
  onCancel,
  onSubmit,
}: TaskFormModalProps) {
  const t = useTranslations("tasks.form");
  const tPriority = useTranslations("tasks.priority");
  const [form] = Form.useForm<FormValues>();

  const submit = ({ startAt, dueAt, estimateHours, ...values }: FormValues) =>
    onSubmit({
      ...values,
      description: values.description || null,
      parentId: values.parentId ?? null,
      sprintId: values.sprintId ?? null,
      storyPoints: values.storyPoints ?? null,
      estimateMinutes: estimateHours
        ? Math.round(estimateHours * MINUTES_PER_HOUR)
        : null,
      // Left out on create, a child inherits its parent's client.
      clientId: task ? (values.clientId ?? null) : values.clientId,
      startAt: startAt ? startAt.toISOString() : null,
      dueAt: dueAt ? dueAt.toISOString() : null,
    });

  return (
    <Modal
      open={open}
      title={task ? t("editTitle") : t("createTitle")}
      okText={task ? t("save") : t("create")}
      okButtonProps={{ loading, className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={640}
      // The modal is destroyed when hidden, so initial values apply afresh on every open.
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValuesFor(task, statuses, defaults)}
        onFinish={submit}
      >
        <Form.Item
          name="title"
          label={t("title")}
          rules={[{ required: true, whitespace: true, max: MAX_TITLE_LENGTH }]}
        >
          <Input maxLength={MAX_TITLE_LENGTH} />
        </Form.Item>
        <Form.Item name="description" label={t("description")}>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 8 }}
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
        </Form.Item>
        <TaskPlanningFields task={task} />
        <div className="grid gap-x-4 sm:grid-cols-2">
          {task ? null : (
            <Form.Item name="statusId" label={t("status")}>
              <Select
                options={statuses.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
          )}
          <Form.Item name="priority" label={t("priority")}>
            <Select
              options={TASK_PRIORITIES.map((value) => ({
                value,
                label: tPriority(value),
              }))}
            />
          </Form.Item>
          <Form.Item name="dueAt" label={t("dueAt")}>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              className="w-full"
            />
          </Form.Item>
          <Form.Item name="clientId" label={t("client")}>
            <ClientSelect allowClear placeholder={t("noClient")} />
          </Form.Item>
        </div>
        <Form.Item name="assigneeIds" label={t("assignees")}>
          <MemberSelect
            known={task?.assignees}
            maxCount={MAX_ASSIGNEES}
            placeholder={t("unassigned")}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
