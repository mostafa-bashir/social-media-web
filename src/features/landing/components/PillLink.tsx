import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

import { type PillSize, type PillVariant, pillClassName } from "../lib/pill";

type PillLinkProps = ComponentProps<typeof Link> & {
  variant?: PillVariant;
  size?: PillSize;
};

/** Locale-aware link styled as a pill CTA. */
export default function PillLink({
  variant,
  size,
  className = "",
  ...linkProps
}: PillLinkProps) {
  return (
    <Link
      {...linkProps}
      className={`${pillClassName(variant, size)} ${className}`}
    />
  );
}
