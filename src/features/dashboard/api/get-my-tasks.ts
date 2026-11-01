import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { taskPrioritySchema } from "@/config/task-priorities";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { apiClient, parsePaginated } from "@/lib/api/api-client";
import { queryKeys } from "@/lib/query-keys";

export const MY_TASKS_LIMIT = 5;

export type MyTaskDue = "overdue" | "week";

/** Only the fields the dashboard shows; the full task lives in the tasks feature. */
const myTaskSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  priority: taskPrioritySchema,
  dueAt: z.string().nullable(),
  client: z.object({ id: z.string(), name: z.string() }).nullable(),
});
export type MyTask = z.infer<typeof myTaskSchema>;

/** The caller's open tasks, overdue or due within a week. Keyed under tasks. */
export function useMyTasks(
  due: MyTaskDue,
  enabled: boolean,
  clientId?: string,
) {
  const slug = useActiveWorkspaceSlug() ?? "";
  return useQuery({
    queryKey: [
      ...queryKeys.tasks(slug),
      "dashboard-mine",
      due,
      clientId ?? null,
    ],
    queryFn: async () =>
      parsePaginated(
        myTaskSchema,
        (
          await apiClient.get("/tasks", {
            params: {
              assigneeId: "me",
              due,
              clientId,
              pageSize: MY_TASKS_LIMIT,
            },
          })
        ).data,
      ),
    enabled: enabled && Boolean(slug),
  });
}
