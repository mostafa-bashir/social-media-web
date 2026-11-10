import type { LandingIconName } from "./icon-names";
import type { LandingTone } from "./tones";

export interface LandingFeature {
  /** Key under `landing.features.items`; also the icon name. */
  key: LandingIconName;
  tone: LandingTone;
}

export const LANDING_FEATURES: readonly LandingFeature[] = [
  { key: "composer", tone: "primary" },
  { key: "scheduling", tone: "growth" },
  { key: "approvals", tone: "accent" },
  { key: "media", tone: "primary" },
  { key: "analytics", tone: "growth" },
  { key: "reports", tone: "accent" },
  { key: "tasks", tone: "primary" },
  { key: "team", tone: "growth" },
];
