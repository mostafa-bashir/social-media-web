"use client";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";

import RowActions, { type RowAction } from "@/components/ui/RowActions";
import { directionFor } from "@/i18n/routing";

export interface ColumnMenuProps {
  columnName: string;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  /** -1 = earlier on the board, +1 = later. */
  onShift: (offset: -1 | 1) => void;
  onDelete: () => void;
}

export default function ColumnMenu({
  columnName,
  isFirst,
  isLast,
  onEdit,
  onShift,
  onDelete,
}: ColumnMenuProps) {
  const t = useTranslations("tasks.columns");
  // The board reads right-to-left in Arabic, so "earlier" points right there.
  const rtl = directionFor(useLocale()) === "rtl";
  const actions: RowAction[] = [
    { key: "edit", label: t("edit"), icon: <EditOutlined />, onClick: onEdit },
    ...(isFirst
      ? []
      : [
          {
            key: "earlier",
            label: t("moveEarlier"),
            icon: rtl ? <ArrowRightOutlined /> : <ArrowLeftOutlined />,
            onClick: () => onShift(-1),
          },
        ]),
    ...(isLast
      ? []
      : [
          {
            key: "later",
            label: t("moveLater"),
            icon: rtl ? <ArrowLeftOutlined /> : <ArrowRightOutlined />,
            onClick: () => onShift(1),
          },
        ]),
    {
      key: "delete",
      label: t("delete"),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: onDelete,
    },
  ];
  return (
    <RowActions
      actions={actions}
      label={t("actionsFor", { column: columnName })}
    />
  );
}
