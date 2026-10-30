"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { App, Button, Checkbox, Input, Progress } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useAddChecklistItem,
  useChecklist,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "../api/checklist";

const MAX_ITEM_LENGTH = 300;

export interface TaskChecklistProps {
  taskId: string;
  canManage: boolean;
}

export default function TaskChecklist({
  taskId,
  canManage,
}: TaskChecklistProps) {
  const t = useTranslations("tasks.checklist");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const items = useChecklist(taskId).data ?? [];
  const add = useAddChecklistItem(taskId);
  const update = useUpdateChecklistItem(taskId);
  const remove = useDeleteChecklistItem(taskId);
  const [text, setText] = useState("");
  const onError = (error: unknown) => message.error(errorMessage(error));
  const done = items.filter((item) => item.done).length;

  if (items.length === 0 && !canManage) return null;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    add.mutate(trimmed, { onSuccess: () => setText(""), onError });
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="task-checklist">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="task-checklist"
          className="text-sm font-semibold text-text-primary"
        >
          {t("title")}
        </h3>
        {items.length > 0 ? (
          <span className="text-xs text-text-tertiary">
            {t("progress", { done, total: items.length })}
          </span>
        ) : null}
      </div>
      {items.length > 0 ? (
        <Progress
          percent={Math.round((done / items.length) * 100)}
          showInfo={false}
          size="small"
          status="normal"
          aria-label={t("progress", { done, total: items.length })}
        />
      ) : null}
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2">
            <Checkbox
              checked={item.done}
              disabled={!canManage}
              onChange={(event) =>
                update.mutate(
                  { itemId: item.id, done: event.target.checked },
                  { onError },
                )
              }
            >
              <span
                className={item.done ? "text-text-tertiary line-through" : ""}
              >
                {item.text}
              </span>
            </Checkbox>
            {canManage ? (
              <Button
                type="text"
                size="small"
                className="ms-auto"
                icon={<DeleteOutlined />}
                aria-label={t("delete", { item: item.text })}
                onClick={() => remove.mutate(item.id, { onError })}
              />
            ) : null}
          </li>
        ))}
      </ul>
      {canManage ? (
        <Input
          value={text}
          maxLength={MAX_ITEM_LENGTH}
          disabled={add.isPending}
          placeholder={t("add")}
          aria-label={t("add")}
          onChange={(event) => setText(event.target.value)}
          onPressEnter={submit}
        />
      ) : null}
    </section>
  );
}
