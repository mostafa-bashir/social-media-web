import type { SocialPlatform } from "@/config/platforms";

/** Icons `LandingIcon` can render; server components pass these names, not icon elements. */
export type LandingIconName =
  | SocialPlatform
  | "check"
  | "checkCircle"
  | "rise"
  | "composer"
  | "scheduling"
  | "approvals"
  | "media"
  | "analytics"
  | "reports"
  | "tasks"
  | "team"
  | "connect"
  | "plan"
  | "measure";
