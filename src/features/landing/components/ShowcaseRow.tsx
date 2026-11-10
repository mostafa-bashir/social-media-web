import type { ReactNode } from "react";

import { type LandingTone, TONE_CHIP_CLASS } from "../lib/tones";
import LandingIcon from "./LandingIcon";
import SectionHeading from "./SectionHeading";

/** Copy beside a product mockup; `reversed` puts the mockup first on desktop. */
export default function ShowcaseRow({
  id,
  eyebrow,
  title,
  body,
  points,
  tone,
  reversed = false,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  tone: LandingTone;
  reversed?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto grid max-w-6xl items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16"
    >
      <div className={reversed ? "lg:order-2" : undefined}>
        <SectionHeading
          id={id}
          eyebrow={eyebrow}
          title={title}
          subtitle={body}
          align="start"
        />
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-text-primary"
            >
              <LandingIcon
                name="check"
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${TONE_CHIP_CLASS[tone]}`}
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
