"use client";

import { MoreOutlined } from "@ant-design/icons";
import { Button, Popover } from "antd";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

export interface RowAction {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick: () => void;
}

/** Row actions (fana pattern): MoreOutlined button opening a popover menu. */
export default function RowActions({
  actions,
  label,
}: {
  actions: RowAction[];
  /** Accessible name, e.g. "Actions for Jane". */
  label?: string;
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  if (actions.length === 0) {
    return null;
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      content={
        <div role="menu" className="flex min-w-40 flex-col gap-0.5">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-start text-sm transition-colors hover:bg-background-tertiary ${
                action.danger ? "text-danger" : "text-text-primary"
              }`}
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      }
    >
      <Button
        type="text"
        shape="circle"
        icon={<MoreOutlined />}
        aria-label={label ?? t("rowActions")}
      />
    </Popover>
  );
}
