import type { ReactNode } from "react";

import BrandMark from "@/components/ui/BrandMark";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

/** The frame of the connect-link pages: no app chrome, one centred card. */
export default function PublicConnectShell({
  children,
  showLocaleSwitcher = true,
}: {
  children: ReactNode;
  /**
   * Off on the callback page: switching language reloads it with the same
   * single-use state, which would then be refused.
   */
  showLocaleSwitcher?: boolean;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <BrandMark />
        {showLocaleSwitcher ? <LocaleSwitcher /> : null}
      </div>
      <section className="surface-card">
        <div className="surface-panel flex flex-col gap-5">{children}</div>
      </section>
    </main>
  );
}
