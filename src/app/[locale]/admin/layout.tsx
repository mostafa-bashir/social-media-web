import type { Metadata } from "next";
import type { ReactNode } from "react";

/** The console is never indexed; access rules live in proxy.ts and the API. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  // Setup links carry a token in the URL; never leak it in a Referer header.
  referrer: "no-referrer",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
