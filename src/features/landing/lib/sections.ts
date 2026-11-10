/** In-page sections the header and footer navigation link to, in display order. */
export const LANDING_NAV_KEYS = ["features", "how", "pricing", "faq"] as const;
export type LandingNavKey = (typeof LANDING_NAV_KEYS)[number];

export const LANDING_SECTION_IDS: Record<LandingNavKey, string> = {
  features: "features",
  how: "how-it-works",
  pricing: "pricing",
  faq: "faq",
};
