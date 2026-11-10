import { routes } from "@/config/routes";

/** Keys under `landing.pricing.featureList`. */
export const PLAN_FEATURE_KEYS = [
  "platforms",
  "unlimitedClients",
  "publishing",
  "analytics",
  "tasks",
  "roles",
] as const;
export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[number];

export const PRICING_CURRENCY = "USD";

export interface PricingPlan {
  /** Key under `landing.pricing.plans`. */
  key: string;
  /** `null` while the plan is free (early access); shown as "Free". */
  priceMonthly: number | null;
  highlighted: boolean;
  ctaHref: string;
  featureKeys: readonly PlanFeatureKey[];
}

/**
 * Pricing isn't set yet, so only the free early-access plan is listed.
 * Add paid tiers here (plus their `landing.pricing.plans.*` copy); the
 * pricing section renders whatever this list holds.
 */
export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    key: "earlyAccess",
    priceMonthly: null,
    highlighted: true,
    ctaHref: routes.auth.register,
    featureKeys: PLAN_FEATURE_KEYS,
  },
];
