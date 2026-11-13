import { z } from "zod";

const count = z.number();

export const queueHealthSchema = z.object({
  name: z.string(),
  /** False when the queue couldn't be read; its counts are then zeros. */
  available: z.boolean(),
  waiting: count,
  active: count,
  delayed: count,
  failed: count,
  completed: count,
  workers: count,
});
export type QueueHealth = z.infer<typeof queueHealthSchema>;

const platformPublishingSchema = z.object({
  platform: z.string(),
  published: count,
  failed: count,
});
export type PlatformPublishing = z.infer<typeof platformPublishingSchema>;

export const healthOverviewSchema = z.object({
  checkedAt: z.string(),
  dependencies: z.object({
    database: z.boolean(),
    redis: z.boolean(),
    storage: z.boolean(),
  }),
  queues: z.array(queueHealthSchema),
  // Null sections couldn't be read; the rest of the page still renders.
  migrations: z
    .object({
      expected: count,
      behind: z.array(
        z.object({
          tenantId: z.string(),
          slug: z.string(),
          name: z.string(),
          applied: z.number().nullable(),
        }),
      ),
    })
    .nullable(),
  lastSnapshotAt: z.string().nullable(),
  publishing: z
    .object({
      today: z.array(platformPublishingSchema),
      week: z.array(platformPublishingSchema),
      topReasons: z.array(z.object({ reason: z.string(), count })),
    })
    .nullable(),
  accounts: z
    .object({
      reconnect: count,
      expiring: count,
      tenants: z.array(
        z.object({
          tenantId: z.string(),
          name: z.string(),
          slug: z.string(),
          reconnect: count,
          expiring: count,
        }),
      ),
    })
    .nullable(),
});
export type HealthOverview = z.infer<typeof healthOverviewSchema>;

export const failedJobSchema = z.object({
  id: z.string(),
  name: z.string(),
  failedReason: z.string(),
  attemptsMade: count,
  failedAt: z.string().nullable(),
  createdAt: z.string(),
  tenantId: z.string().nullable(),
});
export type FailedJob = z.infer<typeof failedJobSchema>;

export const failedJobsPageSchema = z.object({
  jobs: z.array(failedJobSchema),
  total: count,
  pageSize: count,
});
