"use client";

import { Checkbox } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { PermissionInfo } from "../types";

function groupByKey(
  permissions: PermissionInfo[],
): Array<[string, PermissionInfo[]]> {
  const groups = new Map<string, PermissionInfo[]>();
  for (const permission of permissions) {
    groups.set(permission.groupKey, [
      ...(groups.get(permission.groupKey) ?? []),
      permission,
    ]);
  }
  return [...groups.entries()];
}

export interface PermissionChecklistProps {
  permissions: PermissionInfo[];
  value?: string[];
  onChange?: (value: string[]) => void;
}

/** Permissions grouped by area; works as an antd Form.Item control. */
export default function PermissionChecklist({
  permissions,
  value,
  onChange,
}: PermissionChecklistProps) {
  const t = useTranslations("roles");
  const groups = useMemo(() => groupByKey(permissions), [permissions]);

  return (
    <Checkbox.Group
      value={value}
      onChange={(next) => onChange?.(next as string[])}
      className="flex! w-full! flex-col! gap-3!"
    >
      {groups.map(([groupKey, items]) => (
        <fieldset
          key={groupKey}
          className="rounded-xl border border-border-secondary bg-background-subtle p-3"
        >
          <legend className="px-1 text-sm font-semibold text-text-primary">
            {t(`groups.${groupKey}`)}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((permission) => (
              <Checkbox key={permission.slug} value={permission.slug}>
                {t(`permissions.${permission.slug.replace(".", "_")}`)}
              </Checkbox>
            ))}
          </div>
        </fieldset>
      ))}
    </Checkbox.Group>
  );
}
