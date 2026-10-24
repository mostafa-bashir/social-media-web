import type { ReactNode } from "react";

/** `<html>` lives in `[locale]/layout.tsx` so `lang`/`dir` follow the URL locale. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
