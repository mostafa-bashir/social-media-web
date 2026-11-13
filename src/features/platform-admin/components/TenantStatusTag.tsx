"use client";

import { Tag } from "antd";
import { useTranslations } from "next-intl";

import type { TenantStatus } from "../types/tenants";

export default function TenantStatusTag({ status }: { status: TenantStatus }) {
  const t = useTranslations("admin.tenants.status");
  return <Tag color={status === "active" ? "green" : "red"}>{t(status)}</Tag>;
}
