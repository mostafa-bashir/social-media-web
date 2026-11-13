import dayjs, { type Dayjs } from "dayjs";

import type {
  AdminAnnouncement,
  AnnouncementInput,
  AnnouncementSeverity,
} from "../types/announcements";

export const ANNOUNCEMENT_TITLE_MAX = 120;
export const ANNOUNCEMENT_BODY_MAX = 1000;

export interface AnnouncementFormValues {
  title: string;
  body: string;
  severity: AnnouncementSeverity;
  audience: "all" | "selected";
  tenantIds?: string[];
  window?: [Dayjs | null, Dayjs | null];
}

/** Form values for a new announcement, or the one being edited. */
export function toFormValues(
  editing: AdminAnnouncement | null,
): AnnouncementFormValues {
  if (!editing) {
    return {
      title: "",
      body: "",
      severity: "info",
      audience: "all",
      tenantIds: [],
    };
  }
  return {
    title: editing.title,
    body: editing.body,
    severity: editing.severity,
    audience: editing.tenantIds ? "selected" : "all",
    tenantIds: editing.tenantIds ?? [],
    window: [
      dayjs(editing.startsAt),
      editing.endsAt ? dayjs(editing.endsAt) : null,
    ],
  };
}

/** What the API expects; an empty window means "now, until removed". */
export function toInput(values: AnnouncementFormValues): AnnouncementInput {
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    severity: values.severity,
    tenantIds: values.audience === "selected" ? (values.tenantIds ?? []) : null,
    startsAt: values.window?.[0]?.toISOString(),
    endsAt: values.window?.[1]?.toISOString() ?? null,
  };
}
