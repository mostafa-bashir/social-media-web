import { z } from "zod";

import { platformSchema } from "@/config/platforms";

import { analyticsPostSchema, kpiTotalsSchema } from "./index";
import { audienceSchema } from "./audience";
import { contentInsightsSchema } from "./content";

/** What a client report shows unless asked otherwise. */
export const DEFAULT_REPORT_SECTIONS = [
  "kpis",
  "trend",
  "topPosts",
  "content",
  "audience",
] as const;
/** `audit` is opt-in and never emailed on a schedule; it suits a pitch. */
export const REPORT_SECTIONS = [...DEFAULT_REPORT_SECTIONS, "audit"] as const;
export type ReportSection = (typeof REPORT_SECTIONS)[number];
export type ScheduledReportSection = (typeof DEFAULT_REPORT_SECTIONS)[number];

const dayRange = z.object({ from: z.string(), to: z.string() });

export const AUDIT_CHECKS = [
  "cadence",
  "longestGap",
  "engagementRate",
  "videoShare",
  "timing",
  "hashtags",
  "growth",
] as const;
export type AuditCheckKey = (typeof AUDIT_CHECKS)[number];
export type AuditStatus = "good" | "fair" | "poor" | "noData";

const auditCheckSchema = z.object({
  key: z.enum(AUDIT_CHECKS),
  status: z.enum(["good", "fair", "poor", "noData"]),
  value: z.number().nullable(),
  good: z.object({ min: z.number().nullable(), max: z.number().nullable() }),
});
export type AuditCheck = z.infer<typeof auditCheckSchema>;

export const auditSchema = z.object({
  from: z.string(),
  to: z.string(),
  windowDays: z.number(),
  accountCount: z.number(),
  pendingSync: z.number(),
  score: z.number().nullable(),
  platforms: z.array(
    z.object({
      platform: platformSchema,
      posts: z.number(),
      score: z.number().nullable(),
      checks: z.array(auditCheckSchema),
      /** `public`: rated from public data, before anything was connected. */
      source: z.enum(["connected", "public"]).default("connected"),
    }),
  ),
  publicPreview: z
    .object({
      platform: platformSchema,
      title: z.string(),
      status: z.enum(["ok", "not_configured", "unavailable"]),
    })
    .nullable()
    .default(null),
});
export type Audit = z.infer<typeof auditSchema>;

export const reportSchema = z.object({
  client: z.object({
    id: z.string(),
    name: z.string(),
    logoUrl: z.string().nullable(),
    timezone: z.string(),
  }),
  range: dayRange,
  generatedAt: z.string(),
  sections: z.array(z.enum(REPORT_SECTIONS)),
  kpis: z
    .object({
      totals: kpiTotalsSchema,
      comparisonTotals: kpiTotalsSchema.nullable(),
      comparisonRange: dayRange.nullable(),
    })
    .optional(),
  trend: z
    .object({
      metric: z.literal("views"),
      points: z.array(z.object({ date: z.string(), value: z.number() })),
    })
    .optional(),
  topPosts: z.array(analyticsPostSchema).optional(),
  content: contentInsightsSchema
    .pick({ byContentType: true, recommendedSlots: true, timezone: true })
    .optional(),
  audience: audienceSchema
    .pick({
      basis: true,
      primary: true,
      countries: true,
      lifeStages: true,
      geo: true,
    })
    .optional(),
  audit: auditSchema.optional(),
});
export type Report = z.infer<typeof reportSchema>;
