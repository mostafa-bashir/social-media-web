import { z } from "zod";

import { platformSchema } from "@/config/platforms";

const shares = z.array(z.object({ key: z.string(), share: z.number() }));

export const audienceSchema = z.object({
  /** Who the numbers describe; `mixed` blends Instagram followers and YouTube viewers. */
  basis: z.enum(["followers", "viewers", "mixed"]).nullable(),
  age: shares,
  gender: shares,
  ageGender: shares,
  countries: shares,
  cities: shares,
  lifeStages: shares,
  primary: z
    .object({
      age: z.string(),
      gender: z.string(),
      share: z.number(),
      estimated: z.boolean(),
    })
    .nullable(),
  geo: z.object({
    subRegions: shares,
    continents: shares,
    mena: z.number(),
  }),
  accounts: z.array(
    z.object({
      id: z.string(),
      platform: platformSchema,
      displayName: z.string(),
      capturedOn: z.string().nullable(),
      dimensions: z.array(z.string()),
      supported: z.boolean(),
    }),
  ),
});
export type Audience = z.infer<typeof audienceSchema>;
export type ShareRow = Audience["age"][number];
