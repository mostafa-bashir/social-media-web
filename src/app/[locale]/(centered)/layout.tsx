import type { ReactNode } from "react";
import { Suspense } from "react";

import { CenteredCardLayout } from "@/components/layout/CenteredCardLayout";

/** Auth, workspace picker and invite pages share the centered card (access rules live in proxy.ts). */
export default function CenteredLayout({ children }: { children: ReactNode }) {
  return (
    <CenteredCardLayout>
      {/* Forms read search params on the client. */}
      <Suspense>{children}</Suspense>
    </CenteredCardLayout>
  );
}
