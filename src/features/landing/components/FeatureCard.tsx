import type { LandingIconName } from "../lib/icon-names";
import { type LandingTone, TONE_CHIP_CLASS } from "../lib/tones";
import LandingIcon from "./LandingIcon";

export default function FeatureCard({
  icon,
  tone,
  title,
  body,
}: {
  icon: LandingIconName;
  tone: LandingTone;
  title: string;
  body: string;
}) {
  return (
    <li className="surface-card">
      <div className="surface-panel h-full">
        <LandingIcon
          name={icon}
          className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${TONE_CHIP_CLASS[tone]}`}
        />
        <h3 className="mt-4 text-base font-semibold text-text-primary">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {body}
        </p>
      </div>
    </li>
  );
}
