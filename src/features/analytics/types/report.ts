import { z } from "zod";

import { analyticsPostSchema, kpiTotalsSchema } from "./index";
import { audienceSchema } from "./audience";
import { contentInsightsSchema } from "./content";

export const REPORT_SECTIONS = [
  "kpis",
  "trend",
  "topPosts",
  "content",
  "audience",
] as const;
export type ReportSection = (typeof REPORT_SECTIONS)[number];

const dayRange = z.object({ from: z.string(), to: z.string() });

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
});
export type Report = z.infer<typeof reportSchema>;
