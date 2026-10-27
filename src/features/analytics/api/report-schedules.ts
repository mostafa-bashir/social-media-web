import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parseData } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

import { REPORT_SECTIONS, type ReportSection } from "../types/report";

export const SCHEDULE_FREQUENCIES = ["weekly", "monthly"] as const;
export type ScheduleFrequency = (typeof SCHEDULE_FREQUENCIES)[number];
export const SCHEDULE_LOCALES = ["en", "ar"] as const;
/** The API's limits: days 29–31 don't exist every month. */
export const MAX_DAY_OF_MONTH = 28;
export const MAX_RECIPIENTS = 10;
export const MAX_SCHEDULES_PER_CLIENT = 10;

export const reportScheduleSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  frequency: z.enum(SCHEDULE_FREQUENCIES),
  weekday: z.number().nullable(),
  dayOfMonth: z.number().nullable(),
  sendHour: z.number(),
  recipients: z.array(z.string()),
  locale: z.enum(SCHEDULE_LOCALES),
  sections: z.array(z.enum(REPORT_SECTIONS)),
  active: z.boolean(),
  nextRunAt: z.string(),
  lastSentAt: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string(),
});
export type ReportSchedule = z.infer<typeof reportScheduleSchema>;

export interface ReportScheduleInput {
  frequency: ScheduleFrequency;
  weekday?: number;
  dayOfMonth?: number;
  sendHour: number;
  recipients: string[];
  locale: (typeof SCHEDULE_LOCALES)[number];
  sections: ReportSection[];
}

const schedulesKey = (slug: string, clientId?: string) => [
  ...queryKeys.analytics(slug),
  "report-schedules",
  clientId,
];

export function useReportSchedules(clientId: string | undefined) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: schedulesKey(slug, clientId),
    queryFn: async () =>
      parseData(
        z.array(reportScheduleSchema),
        (
          await apiClient.get("/analytics/report-schedules", {
            params: { clientId },
          })
        ).data,
      ),
    enabled: Boolean(slug && clientId),
  });
}

function useInvalidateSchedules() {
  const slug = useActiveWorkspaceSlug() ?? "";
  const queryClient = useQueryClient();
  return (clientId: string) =>
    queryClient.invalidateQueries({ queryKey: schedulesKey(slug, clientId) });
}

export function useCreateReportSchedule() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async (input: ReportScheduleInput & { clientId: string }) =>
      parseData(
        reportScheduleSchema,
        (await apiClient.post("/analytics/report-schedules", input)).data,
      ),
    onSuccess: (schedule) => invalidate(schedule.clientId),
  });
}

export function useUpdateReportSchedule() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: ReportScheduleInput & { id: string; active: boolean }) =>
      parseData(
        reportScheduleSchema,
        (await apiClient.patch(`/analytics/report-schedules/${id}`, input))
          .data,
      ),
    onSuccess: (schedule) => invalidate(schedule.clientId),
  });
}

export function useDeleteReportSchedule() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async (schedule: ReportSchedule) => {
      await apiClient.delete(`/analytics/report-schedules/${schedule.id}`);
    },
    onSuccess: (_data, schedule) => invalidate(schedule.clientId),
  });
}

/** The API replaces the whole rule on update, so send every field back. */
export const toScheduleInput = (
  schedule: ReportSchedule,
): ReportScheduleInput => ({
  frequency: schedule.frequency,
  weekday: schedule.weekday ?? undefined,
  dayOfMonth: schedule.dayOfMonth ?? undefined,
  sendHour: schedule.sendHour,
  recipients: schedule.recipients,
  locale: schedule.locale,
  sections: schedule.sections,
});
