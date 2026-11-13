"use client";

import { Tag } from "antd";
import { useTranslations } from "next-intl";

import type { AdminUserRow } from "../types/users";

/** Disabled / locked / unverified flags, or "active" when none apply. */
export default function UserStateTags({ user }: { user: AdminUserRow }) {
  const t = useTranslations("admin.users.state");
  const flags = [
    user.disabled && (
      <Tag key="disabled" color="red">
        {t("disabled")}
      </Tag>
    ),
    user.locked && (
      <Tag key="locked" color="orange">
        {t("locked")}
      </Tag>
    ),
    !user.verified && (
      <Tag key="unverified" color="blue">
        {t("unverified")}
      </Tag>
    ),
  ].filter(Boolean);
  return flags.length > 0 ? (
    <>{flags}</>
  ) : (
    <Tag color="green">{t("active")}</Tag>
  );
}
