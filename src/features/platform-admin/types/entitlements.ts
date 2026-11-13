import { z } from "zod";

import { FEATURE_KEYS, type FeatureKey } from "@/config/features";

export const FEATURES = FEATURE_KEYS as [FeatureKey, ...FeatureKey[]];
export type Feature = FeatureKey;

export const LIMIT_KINDS = [
  "members",
  "clients",
  "socialAccounts",
  "storageMb",
] as const;
export type LimitKind = (typeof LIMIT_KINDS)[number];

const limitsSchema = z.object({
  members: z.number().nullable(),
  clients: z.number().nullable(),
  socialAccounts: z.number().nullable(),
  storageMb: z.number().nullable(),
});
export type Limits = z.infer<typeof limitsSchema>;

export const tenantEntitlementsSchema = z.object({
  disabledFeatures: z.array(z.enum(FEATURES)),
  limits: limitsSchema,
  usage: z.object({
    members: z.number(),
    clients: z.number(),
    socialAccounts: z.number(),
    storageMb: z.number(),
  }),
  updatedAt: z.string().nullable(),
});
export type TenantEntitlements = z.infer<typeof tenantEntitlementsSchema>;

export interface EntitlementsInput {
  disabledFeatures: Feature[];
  limits: Limits;
}
