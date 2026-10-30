"use client";

import { CheckCircleFilled, DisconnectOutlined } from "@ant-design/icons";
import { App, Button, Select } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useCreateLink,
  useDeleteLink,
  useTaskLinks,
} from "../api/collaboration";
import { LINK_KINDS, type LinkKind, type TaskLink } from "../types";
import TaskKeyLabel from "./TaskKeyLabel";
import TaskSearchSelect from "./TaskSearchSelect";

/** "blocks" / "is blocked by" etc.: the phrase depends on which side we're on. */
const phrase = (link: TaskLink) =>
  `${link.kind}.${link.direction}` as `${LinkKind}.${TaskLink["direction"]}`;

/** Jira-style issue links, opening the other task in the drawer. */
export default function TaskLinksSection({
  taskId,
  canManage,
  onOpen,
}: {
  taskId: string;
  canManage: boolean;
  onOpen: (taskId: string) => void;
}) {
  const t = useTranslations("tasks.links");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const links = useTaskLinks(taskId).data ?? [];
  const create = useCreateLink(taskId);
  const remove = useDeleteLink(taskId);
  const [kind, setKind] = useState<LinkKind>("blocks");
  const onError = (error: unknown) => message.error(errorMessage(error));

  if (links.length === 0 && !canManage) return null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="task-links">
      <h3 id="task-links" className="text-sm font-semibold text-text-primary">
        {t("title")}
      </h3>
      {links.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border-secondary">
          {links.map((link) => (
            <li key={link.id} className="flex items-center gap-3 py-2">
              <span className="w-28 shrink-0 text-xs text-text-tertiary">
                {t(`phrases.${phrase(link)}`)}
              </span>
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 text-start hover:text-primary-text"
                onClick={() => onOpen(link.task.id)}
              >
                <TaskKeyLabel type={link.task.type} taskKey={link.task.key} />
                <span className="truncate text-sm">{link.task.title}</span>
                {link.task.completedAt ? (
                  <CheckCircleFilled
                    className="text-growth-text"
                    aria-label={t("done")}
                  />
                ) : null}
              </button>
              {canManage ? (
                <Button
                  type="text"
                  size="small"
                  icon={<DisconnectOutlined />}
                  aria-label={t("remove", { key: link.task.key })}
                  onClick={() => remove.mutate(link.id, { onError })}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {canManage ? (
        <div className="flex flex-wrap gap-2">
          <Select<LinkKind>
            className="w-40!"
            aria-label={t("kind")}
            value={kind}
            options={LINK_KINDS.map((value) => ({
              value,
              label: t(`phrases.${value}.outgoing`),
            }))}
            onChange={setKind}
          />
          <TaskSearchSelect
            className="min-w-48 flex-1"
            excludeId={taskId}
            placeholder={t("pick")}
            loading={create.isPending}
            onSelect={(targetTaskId) =>
              create.mutate({ kind, targetTaskId }, { onError })
            }
          />
        </div>
      ) : null}
    </section>
  );
}
