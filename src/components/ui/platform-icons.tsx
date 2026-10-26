import {
  FacebookFilled,
  InstagramFilled,
  YoutubeFilled,
} from "@ant-design/icons";
import type { ReactNode } from "react";

import type { SocialPlatform } from "../types";

/** Monochrome: icons take token colours, never third-party brand hex. */
export const PLATFORM_ICONS: Record<SocialPlatform, ReactNode> = {
  facebook: <FacebookFilled />,
  instagram: <InstagramFilled />,
  youtube: <YoutubeFilled />,
};
