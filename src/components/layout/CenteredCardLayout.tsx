import type { ReactNode } from "react";

import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

/** Full-height centered card used by auth, workspace picker and invite pages. */
export function CenteredCardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm sm:p-8">
        {children}
      </div>
      <LocaleSwitcher />
    </main>
  );
}
