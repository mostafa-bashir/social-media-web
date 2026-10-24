import { type ReactNode, Suspense } from "react";

import AuthShell from "@/components/ui/AuthShell";

/** Auth, workspace picker and invite pages (access rules live in proxy.ts). */
export default function AuthShellLayout({ children }: { children: ReactNode }) {
  return (
    <AuthShell>
      {/* Forms read search params on the client. */}
      <Suspense>{children}</Suspense>
    </AuthShell>
  );
}
