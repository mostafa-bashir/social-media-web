/**
 * Modules a platform admin can switch off per workspace. Mirrors the API's
 * `Feature` enum; `GET /members/me` lists the switched-off ones.
 */
export const Feature = {
  Tasks: "tasks",
  Analytics: "analytics",
  ClientConnectLinks: "clientConnectLinks",
  ProspectAudits: "prospectAudits",
} as const;

export type FeatureKey = (typeof Feature)[keyof typeof Feature];

export const FEATURE_KEYS = Object.values(Feature) as FeatureKey[];
