"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { App, Button, DatePicker, Form, Input, InputNumber } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";
import { type Dayjs, dayjs } from "@/lib/dayjs";

import {
  useDeleteWorklog,
  useLogTime,
  useWorklogs,
} from "../api/collaboration";
import { useDuration } from "../hooks/use-duration";

const MINUTES_PER_HOUR = 60;
const MAX_HOURS = 24;
const HOURS_STEP = 0.25;
const MAX_NOTE_LENGTH = 500;
const DATE_FORMAT = "D MMM YYYY, HH:mm";

interface FormValues {
  hours?: number;
  note?: string;
  startedAt?: Dayjs | null;
}

/** Log time against the task; you can remove your own entries (configurers any). */
export default function TaskWorklogPanel({
  taskId,
  userId,
  canManage,
  canModerate,
}: {
  taskId: string;
  userId: string | undefined;
  canManage: boolean;
  canModerate: boolean;
}) {
  const t = useTranslations("tasks.worklog");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const duration = useDuration();
  const logs = useWorklogs(taskId).data ?? [];
  const log = useLogTime(taskId);
  const remove = useDeleteWorklog(taskId);
  const [form] = Form.useForm<FormValues>();
  const onError = (error: unknown) => message.error(errorMessage(error));

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <Form
          form={form}
          layout="inline"
          className="gap-y-2"
          onFinish={({ hours, note, startedAt }) =>
            hours &&
            log.mutate(
              {
                minutes: Math.round(hours * MINUTES_PER_HOUR),
                note: note?.trim() || null,
                startedAt: (startedAt ?? dayjs()).toISOString(),
              },
              { onSuccess: () => form.resetFields(), onError },
            )
          }
        >
          <Form.Item name="hours" rules={[{ required: true, message: "" }]}>
            <InputNumber
              className="w-28!"
              min={HOURS_STEP}
              max={MAX_HOURS}
              step={HOURS_STEP}
              placeholder={t("hours")}
              aria-label={t("hours")}
            />
          </Form.Item>
          <Form.Item name="startedAt">
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              placeholder={t("when")}
              aria-label={t("when")}
              disabledDate={(date) => date.isAfter(dayjs(), "day")}
            />
          </Form.Item>
          <Form.Item name="note" className="min-w-40 flex-1">
            <Input
              maxLength={MAX_NOTE_LENGTH}
              placeholder={t("note")}
              aria-label={t("note")}
            />
          </Form.Item>
          <Button
            htmlType="submit"
            className="rounded-full!"
            loading={log.isPending}
          >
            {t("log")}
          </Button>
        </Form>
      ) : null}
      {logs.length === 0 ? (
        <p className="text-sm text-text-tertiary">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-secondary">
          {logs.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-2">
              <span className="w-20 shrink-0 text-sm font-medium text-text-primary">
                {duration(entry.minutes)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm text-text-primary">
                  {entry.person?.name ?? t("formerMember")}
                  {entry.note ? ` · ${entry.note}` : ""}
                </span>
                <span className="text-xs text-text-tertiary">
                  {dayjs(entry.startedAt).format(DATE_FORMAT)}
                </span>
              </div>
              {canManage && (canModerate || entry.person?.userId === userId) ? (
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  aria-label={t("delete")}
                  onClick={() => remove.mutate(entry.id, { onError })}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
