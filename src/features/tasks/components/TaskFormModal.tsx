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
} from "../types";

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 10_000;
const MAX_ASSIGNEES = 10;

interface FormValues {
  title: string;
  description?: string;
  statusId?: string;
  priority: TaskPriority;
  assigneeIds: string[];
  clientId?: string;
  dueAt?: Dayjs | null;
}

export interface TaskFormModalProps {
  open: boolean;
  /** Present when editing. */
  task?: Task;
  statuses: TaskStatus[];
  defaults?: { statusId?: string; clientId?: string };
  loading: boolean;
  onCancel: () => void;
  onSubmit: (input: TaskInput) => void;
}

/** Create or edit a task. Due dates are picked and shown in the viewer's zone. */
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

  // The modal is destroyed when hidden, so these apply afresh on every open.
  const initialValues: FormValues = task
    ? {
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        assigneeIds: task.assignees.map((person) => person.userId),
        clientId: task.client?.id,
        dueAt: task.dueAt ? dayjs(task.dueAt) : null,
      }
    : {
        title: "",
        description: "",
        statusId: defaults?.statusId ?? statuses[0]?.id,
        priority: "medium",
        assigneeIds: [],
        clientId: defaults?.clientId,
        dueAt: null,
      };

  const submit = (values: FormValues) =>
    onSubmit({
      title: values.title,
      description: values.description || null,
      ...(task ? {} : { statusId: values.statusId }),
      priority: values.priority,
      assigneeIds: values.assigneeIds,
      clientId: values.clientId ?? null,
      dueAt: values.dueAt ? values.dueAt.toISOString() : null,
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
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
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
