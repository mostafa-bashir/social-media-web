import type { ReactNode } from "react";

/** Full-width page band with the shared content width; `scroll-mt` clears the sticky header. */
export default function LandingSection({
  id,
  labelledBy,
  className = "",
  children,
}: {
  id?: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`scroll-mt-16 px-4 py-20 sm:px-6 lg:py-28 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
