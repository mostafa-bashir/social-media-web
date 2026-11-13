import type { ReactNode } from "react";

import FeatureGate from "@/components/ui/FeatureGate";
import { Feature } from "@/config/features";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return <FeatureGate feature={Feature.Tasks}>{children}</FeatureGate>;
}
